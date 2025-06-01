from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import os
import json
import uuid
import re
from datetime import datetime
import logging
import time
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from functools import lru_cache
from pathlib import Path
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from langdetect import detect, LangDetectException

# Hugging Face token loading
load_dotenv()  
hf_token = os.getenv("HUGGINGFACE_TOKEN")
if hf_token:
    print("INFO: Hugging Face token found!")
else:
    print("WARNING: Hugging Face token not found!")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Default cache directory 
DEFAULT_CACHE_DIR = Path.home() / ".cache" / "huggingface" / "hub"
MODELS_DIR = DEFAULT_CACHE_DIR # Start with default

def check_and_set_cache_dir():
    """Check if E: drive is available and set cache directory accordingly."""
    global MODELS_DIR
    e_drive_path = Path("E:/")
    custom_cache_path = e_drive_path / "models" / "huggingface"
    
    if e_drive_path.exists() and e_drive_path.is_dir():
        try:
            # Attempt to create the directory on E: drive
            custom_cache_path.mkdir(parents=True, exist_ok=True)
            # Test write permissions
            test_file = custom_cache_path / ".write_test"
            test_file.touch()
            test_file.unlink()
            
            MODELS_DIR = custom_cache_path
            logger.info(f"Using custom cache directory on E: drive: {MODELS_DIR}")
            
            # Set environment variables for Hugging Face
            os.environ["TRANSFORMERS_CACHE"] = str(MODELS_DIR)
            os.environ["HF_HOME"] = str(MODELS_DIR) # HF_HOME often includes configs, downloads
            os.environ["HF_DATASETS_CACHE"] = str(MODELS_DIR / "datasets")
            os.environ["TORCH_HOME"] = str(MODELS_DIR / "torch") # For PyTorch hub models
            
        except OSError as e:
            logger.warning(f"E: drive found, but failed to create/write to cache directory {custom_cache_path}. Error: {e}. Falling back to default cache.")
            MODELS_DIR = DEFAULT_CACHE_DIR
            # Ensure default cache exists
            MODELS_DIR.mkdir(parents=True, exist_ok=True)
            # Set env vars to default (or let Hugging Face handle defaults)
            os.environ["TRANSFORMERS_CACHE"] = str(MODELS_DIR)
            os.environ["HF_HOME"] = str(MODELS_DIR)
            os.environ["HF_DATASETS_CACHE"] = str(MODELS_DIR / "datasets")
            os.environ["TORCH_HOME"] = str(MODELS_DIR / "torch")
    else:
        logger.warning("E: drive not found or not accessible. Using default cache directory.")
        MODELS_DIR = DEFAULT_CACHE_DIR
        # Ensure default cache exists
        MODELS_DIR.mkdir(parents=True, exist_ok=True)
        # Set env vars to default
        os.environ["TRANSFORMERS_CACHE"] = str(MODELS_DIR)
        os.environ["HF_HOME"] = str(MODELS_DIR)
        os.environ["HF_DATASETS_CACHE"] = str(MODELS_DIR / "datasets")
        os.environ["TORCH_HOME"] = str(MODELS_DIR / "torch")

# --- End Custom Cache Logic ---

# Model configuration
MODEL_ID = "vinai/PhoGPT-7B5-Instruct"  # Vietnamese-capable model
FALLBACK_MODEL_ID = "google/gemma-2b-it"  # Fallback model
DEVICE = "cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu")
logger.info(f"Using device: {DEVICE}")

# Global variables to store model and tokenizer
model = None
tokenizer = None
model_loading = False
model_loaded = False
model_error = None
model_id_loaded = None

# In-memory conversation store
conversations = {}

# Pydantic models for request and response
class ChatHistory(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    conversation_history: Optional[List[ChatHistory]] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    mood: str = "default"
    simplified_response: Optional[str] = None

def detect_language(text):
    """Detect language of input text."""
    try:
        lang = detect(text)
        return lang
    except LangDetectException:
        # Default to English if detection fails
        return "en"

# Model management functions
def load_model_and_tokenizer(model_id=MODEL_ID):
    """Load model and tokenizer using the configured cache directory."""
    global model, tokenizer, model_loading, model_loaded, model_error, model_id_loaded
    
    if model_loading:
        return
    
    model_loading = True
    model_error = None
    
    try:
        logger.info(f"Loading model {model_id} using cache: {MODELS_DIR}...")
        start_time = time.time()
    
        # Load tokenizer and model 
        tokenizer = AutoTokenizer.from_pretrained(
            model_id,
            cache_dir=MODELS_DIR,
            token=hf_token,
            trust_remote_code=True
        )
        
        model = AutoModelForCausalLM.from_pretrained(
            model_id,
            cache_dir=MODELS_DIR,
            device_map=DEVICE,
            torch_dtype="auto",
            token=hf_token,
            trust_remote_code=True
        )
        
        model_id_loaded = model_id
        load_time = time.time() - start_time
        logger.info(f"Model loaded in {load_time:.2f} seconds")
        model_loaded = True
        
    except Exception as e:
        logger.error(f"Error loading model {model_id}: {str(e)}")
        model_error = str(e)
        
        # Try fallback only if the primary model failed
        if model_id == MODEL_ID and FALLBACK_MODEL_ID:
            logger.info(f"Attempting to load fallback model {FALLBACK_MODEL_ID}")
            # Reset loading flag before recursive call
            model_loading = False 
            load_model_and_tokenizer(FALLBACK_MODEL_ID)
        else:
             # If fallback also fails or no fallback defined
            model_loaded = False 
            model_loading = False
        
    finally:
        if model_id != MODEL_ID or not FALLBACK_MODEL_ID:
             model_loading = False

def format_conversation(conversation_history, user_message):
    """Format conversation for model input using appropriate chat template."""
    global tokenizer, model_id_loaded

    if not tokenizer:
        logger.error("Tokenizer not available for formatting conversation.")
        # Fallback to a very basic format
        return f"User: {user_message}\nAssistant:"

    # Detect language of user message
    lang = detect_language(user_message)
    is_vietnamese = lang == "vi"
    
    # Adjust system prompt based on detected language
    if is_vietnamese:
        system_prompt = """Bạn là Miku, một trợ lý AI thân thiện giúp học tiếng Anh.
        - Chỉ trả lời câu hỏi được hỏi, không tạo ra các cuộc hội thoại giả định
        - KHÔNG được tự đặt câu hỏi và tự trả lời
        - Giải thích khái niệm ngữ pháp rõ ràng và ngắn gọn
        - Cung cấp ví dụ và sửa lỗi khi cần thiết
        - Trả lời bằng tiếng Việt khi được hỏi bằng tiếng Việt
        - Sử dụng định dạng Markdown để làm nổi bật các phần quan trọng (như **từ này** cho in đậm)
        - Trả lời trực tiếp và ngắn gọn, tránh dài dòng
        - KHÔNG được tạo ra các cuộc đối thoại giả định giữa người dùng và trợ lý"""
    else:
        system_prompt = """You are Miku, a friendly AI English tutor.
        - ONLY answer the question asked, do not create fictional dialogues
        - DO NOT create hypothetical questions and answers
        - Explain grammar concepts clearly and concisely
        - Provide examples and corrections when needed
        - Reply in English when asked in English
        - Use Markdown formatting to highlight important parts (like **this word** for bold)
        - Answer directly and concisely, avoid being verbose
        - DO NOT create fictional dialogues between user and assistant"""

    messages = [{"role": "system", "content": system_prompt}]
    if conversation_history:
        # Ensure history roles are 'user' or 'assistant'
        messages.extend([
            {"role": msg.role, "content": msg.content}
            for msg in conversation_history
            if msg.role in ["user", "assistant"]
        ])
    messages.append({"role": "user", "content": user_message})

    try:
        formatted_prompt = tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )
        return formatted_prompt
    except Exception as e:
        logger.warning(f"Failed to apply chat template: {e}. Falling back to manual formatting.")
        formatted_prompt = ""
        if messages[0]["role"] == "system":
             formatted_prompt += f"System: {messages[0]['content']}\n" # Include system prompt if possible
             messages = messages[1:] # Remove system prompt for loop

        for msg in messages:
             formatted_prompt += f"{msg['role'].capitalize()}: {msg['content']}\n"
        formatted_prompt += "Assistant:" # Prompt the model to respond
        return formatted_prompt

def generate_response(prompt, max_new_tokens=512):
    """Generate response using the loaded model"""
    global model, tokenizer
    
    if not model_loaded or model is None or tokenizer is None:
        raise ValueError("Model not loaded or unavailable")
    
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    with torch.no_grad():
        outputs = model.generate(
            inputs["input_ids"],
            max_new_tokens=max_new_tokens,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
            eos_token_id=tokenizer.eos_token_id
        )
    
    response_ids = outputs[0][inputs["input_ids"].shape[-1]:]
    response = tokenizer.decode(response_ids, skip_special_tokens=True)
    return response.strip()

def clean_response(response):
    """Clean the response to remove hallucinated dialogues."""
    # Remove any lines that look like "User:" or "Assistant:" or "Miku:"
    cleaned = re.sub(r'(?i)(User|Assistant|Miku):\s*.*?(\n|$)', '', response)
    
    # Remove any lines that look like questions (ending with ?)
    cleaned = re.sub(r'\n.*?\?\s*\n', '\n', cleaned)
    
    # Remove any lines that start with common dialogue patterns
    dialogue_patterns = [
        r'Let\'s try',
        r'Let me ask',
        r'Now, let\'s',
        r'Hãy thử',
        r'Bây giờ hãy',
    ]
    for pattern in dialogue_patterns:
        cleaned = re.sub(f'{pattern}.*?(\n|$)', '', cleaned)
    
    # Clean up any extra newlines
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
    
    return cleaned.strip()

def simplify_text(text, lang="en"):
    """Simplify text for language learners in the appropriate language"""
    if lang == "vi":
        prompt = f"""Đơn giản hóa đoạn văn này cho người học tiếng Anh. Chỉ trả lời bằng phiên bản đơn giản, không thêm bất kỳ nội dung nào khác: {text}"""
    else:
        prompt = f"""Simplify this text for an English learner. Only respond with the simplified version, do not add any other content: {text}"""
    
    try:
        simplified = generate_response(prompt, max_new_tokens=256)
        # Clean up the simplified response as well
        simplified = clean_response(simplified)
        return simplified
    except Exception as e:
        logger.error(f"Text simplification failed: {e}")
        return "Text simplification currently unavailable."

def detect_mood(response):
    """Detect mood from response text"""
    response_lower = response.lower()
    
    # Vietnamese and English positive words
    positive_words = ["great", "excellent", "well done", "perfect", "amazing", 
                     "tuyệt vời", "xuất sắc", "làm tốt lắm", "hoàn hảo"]
    
    # Vietnamese and English negative words
    negative_words = ["sorry", "incorrect", "wrong", "mistake", 
                     "xin lỗi", "không đúng", "sai", "lỗi"]
    
    # Vietnamese and English encouraging words
    encouraging_words = ["try", "practice", "improve", "better", 
                        "cố gắng", "luyện tập", "cải thiện", "tốt hơn"]
    
    # Vietnamese and English goodbye words
    goodbye_words = ["goodbye", "bye", "tạm biệt"]
    
    if any(word in response_lower for word in positive_words):
        return "excited"
    elif any(word in response_lower for word in negative_words):
        return "confused"
    elif any(word in response_lower for word in encouraging_words):
        return "happy"
    elif any(word in response_lower for word in goodbye_words):
        return "sad"
    return "default"

def get_or_create_conversation(conversation_id=None):
    """Get or create conversation"""
    if conversation_id and conversation_id in conversations:
        return conversation_id
    
    new_id = str(uuid.uuid4())
    conversations[new_id] = {
        "created_at": datetime.now().isoformat(),
        "messages": []
    }
    return new_id

def update_conversation(conversation_id, user_message, bot_response):
    """Update conversation history"""
    if conversation_id not in conversations:
        conversation_id = get_or_create_conversation(conversation_id)
    
    conversations[conversation_id]["messages"].extend([
        {"role": "user", "content": user_message, "timestamp": datetime.now().isoformat()},
        {"role": "assistant", "content": bot_response, "timestamp": datetime.now().isoformat()}
    ])
    conversations[conversation_id]["messages"] = conversations[conversation_id]["messages"][-20:] # Keep last 20 messages

# --- Lifespan Event Handler ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for application startup and shutdown."""
    # Startup code (previously in @app.on_event("startup"))
    if not hf_token and MODEL_ID in ["google/gemma-2b-it"]:
        logger.warning("No Hugging Face token provided for gated model - loading may fail")

    check_and_set_cache_dir()  # Determine cache location first
    background_tasks = BackgroundTasks()
    background_tasks.add_task(load_model_and_tokenizer)
    await background_tasks()
    
    # Yield control back to FastAPI
    yield
    
    # Shutdown code (if needed in the future)
    # Any cleanup code would go here

# Initialize FastAPI app with lifespan handler
app = FastAPI(
    title="Multilingual Learning Chatbot API",
    description="API for multilingual language learning chatbot using LLM",
    version="2.4.0", # Updated for response cleaning and hallucination prevention
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Endpoints --- 
@app.get("/api/health")
async def health_check():
    """Health check endpoint with model location info"""
    return {
        "status": "ok",
        "version": "2.4.0",
        "model_loaded": model_loaded,
        "model_loading": model_loading,
        "model_id": model_id_loaded if model_loaded else None,
        "model_location": str(MODELS_DIR), # Report the actual cache dir being used
        "device": DEVICE,
        "active_conversations": len(conversations)
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat endpoint with language detection and simplified response"""
    if not model_loaded:
        if model_error:
            raise HTTPException(500, detail=f"Model failed to load: {model_error}")
        if model_loading:
             raise HTTPException(503, detail="Model is still loading, please wait")
        raise HTTPException(500, detail="Model is not available")

    conversation_id = get_or_create_conversation(request.conversation_id)

    try:
        # Detect language of user message
        lang = detect_language(request.message)
        logger.info(f"Detected language: {lang}")
        
        prompt = format_conversation(
            request.conversation_history,
            request.message
        )
        
        raw_response = generate_response(prompt)
        
        # Clean the response to remove hallucinated dialogues
        response = clean_response(raw_response)
        logger.info(f"Original response length: {len(raw_response)}, Cleaned response length: {len(response)}")
        
        simplified_response = None
        
        # Generate simplified response in the same language
        try:
            simplified_response = simplify_text(response, lang)
        except Exception as simplify_err:
            logger.error(f"Error simplifying text: {simplify_err}")

        update_conversation(conversation_id, request.message, response)
        
        return ChatResponse(
            response=response,
            conversation_id=conversation_id,
            mood=detect_mood(response),
            simplified_response=simplified_response
        )
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        # Provide a more user-friendly error message
        raise HTTPException(500, detail=f"An error occurred while processing your request.")

@app.get("/api/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    """Get conversation history"""
    if conversation_id not in conversations:
        raise HTTPException(404, detail="Conversation not found")
    return conversations[conversation_id]

@app.delete("/api/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """Delete conversation"""
    if conversation_id in conversations:
        del conversations[conversation_id]
        return {"status": "deleted"}
    raise HTTPException(404, detail="Conversation not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
