from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import os
import json
import uuid
from datetime import datetime
import logging
import time
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from functools import lru_cache
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Custom Cache Logic Restored ---
# Default cache directory (can be overridden by check_drive_available)
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

# Initialize FastAPI app
app = FastAPI(
    title="English Learning Chatbot API",
    description="API for English language learning chatbot using LLM",
    version="2.1.1" # Incremented version
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model configuration
MODEL_ID = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"  # Smaller model (~2GB)
FALLBACK_MODEL_ID = "microsoft/phi-1_5"  # Fallback model (~3GB)
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
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
    difficulty_level: Optional[str] = "beginner"

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    mood: str = "default"
    grammar_feedback: Optional[Dict[str, Any]] = None
    simplified_response: Optional[str] = None

# Model management functions
def load_model_and_tokenizer(model_id=MODEL_ID):
    """Load model and tokenizer using the configured cache directory."""
    global model, tokenizer, model_loading, model_loaded, model_error, model_id_loaded
    
    if model_loading:
        return
    
    model_loading = True
    model_error = None
    
    try:
        # Ensure cache directory is determined before loading
        # check_and_set_cache_dir() # This is called at startup now
        logger.info(f"Loading model {model_id} using cache: {MODELS_DIR}...")
        start_time = time.time()
        
        # Load tokenizer and model using the determined cache directory
        tokenizer = AutoTokenizer.from_pretrained(
            model_id,
            cache_dir=MODELS_DIR, # Use the globally set MODELS_DIR
            trust_remote_code=True
        )
        
        model = AutoModelForCausalLM.from_pretrained(
            model_id,
            cache_dir=MODELS_DIR, # Use the globally set MODELS_DIR
            device_map=DEVICE,
            torch_dtype="auto",
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
        # Ensure loading is set to false if not attempting fallback
        if model_id != MODEL_ID or not FALLBACK_MODEL_ID:
             model_loading = False

# --- Helper Functions (Format, Generate, Check, Simplify, Mood, Conversation) ---
# (These functions remain largely the same as the user's provided version)

def format_conversation(conversation_history, user_message, difficulty_level="beginner"):
    """Format conversation for model input with difficulty level"""
    system_prompt = f"""You are Sakura, a friendly AI English tutor for {difficulty_level} learners. 
    - Use simple words and short sentences for beginners
    - Explain grammar concepts clearly
    - Provide examples and corrections
    - Be patient and encouraging"""
    
    messages = [{"role": "system", "content": system_prompt}]
    
    if conversation_history:
        messages.extend([{"role": msg.role, "content": msg.content} for msg in conversation_history])
    
    messages.append({"role": "user", "content": user_message})
    
    # Format based on model type (assuming TinyLlama format)
    if model_id_loaded and "llama" in model_id_loaded.lower():
        formatted_prompt = ""
        # Llama 2 chat format
        for i, msg in enumerate(messages):
            if msg["role"] == "system":
                 # System prompt is handled differently in Llama 2
                 # It's usually placed within the first user message's [INST]
                 continue
            elif msg["role"] == "user":
                 if i == 1: # First user message includes system prompt
                     formatted_prompt += f"<s>[INST] <<SYS>>\n{messages[0]['content']}\n<</SYS>>\n\n{msg['content']} [/INST]"
                 else:
                     formatted_prompt += f"<s>[INST] {msg['content']} [/INST]"
            elif msg["role"] == "assistant":
                 formatted_prompt += f" {msg['content']}</s>"
    else: # Generic or other model format (like phi)
        formatted_prompt = ""
        for msg in messages:
            formatted_prompt += f"{msg['role'].capitalize()}: {msg['content']}\n"
        formatted_prompt += "Assistant: "
    
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

def check_grammar(text):
    """Simple grammar check using the model"""
    # This might be too slow or unreliable with small models on CPU
    # Consider using a dedicated grammar check library or API if performance is critical
    prompt = f"""Check this English sentence for grammar mistakes and provide corrections in the format: Corrected: [corrected version] Explanation: [brief explanation]. Sentence: {text}"""
    try:
        # Use a smaller max_new_tokens for this specific task
        return generate_response(prompt, max_new_tokens=128) 
    except Exception as e:
        logger.error(f"Grammar check failed: {e}")
        return "Grammar check currently unavailable."

def simplify_text(text, level="beginner"):
    """Simplify text for English learners"""
    prompt = f"""Simplify this text for a {level} English learner: {text} Simplified:"""
    try:
        return generate_response(prompt, max_new_tokens=256)
    except Exception as e:
        logger.error(f"Text simplification failed: {e}")
        return "Text simplification currently unavailable."

def detect_mood(response):
    """Detect mood from response text"""
    response_lower = response.lower()
    positive_words = ["great", "excellent", "well done", "perfect", "amazing"]
    negative_words = ["sorry", "incorrect", "wrong", "mistake"]
    encouraging_words = ["try", "practice", "improve", "better"]
    
    if any(word in response_lower for word in positive_words):
        return "excited"
    elif any(word in response_lower for word in negative_words):
        return "confused"
    elif any(word in response_lower for word in encouraging_words):
        return "happy"
    elif "goodbye" in response_lower or "bye" in response_lower:
        return "sad"
    return "default"

def get_or_create_conversation(conversation_id=None):
    """Get or create conversation"""
    if conversation_id and conversation_id in conversations:
        return conversation_id
    
    new_id = str(uuid.uuid4())
    conversations[new_id] = {
        "created_at": datetime.now().isoformat(),
        "messages": [],
        "difficulty_level": "beginner"
    }
    return new_id

def update_conversation(conversation_id, user_message, bot_response, difficulty_level):
    """Update conversation history and difficulty level"""
    if conversation_id not in conversations:
        conversation_id = get_or_create_conversation(conversation_id)
    
    conversations[conversation_id]["messages"].extend([
        {"role": "user", "content": user_message, "timestamp": datetime.now().isoformat()},
        {"role": "assistant", "content": bot_response, "timestamp": datetime.now().isoformat()}
    ])
    conversations[conversation_id]["difficulty_level"] = difficulty_level
    conversations[conversation_id]["messages"] = conversations[conversation_id]["messages"][-20:] # Keep last 20 messages

# --- API Endpoints --- 
@app.on_event("startup")
async def startup_event():
    """Check cache dir and start model loading on startup."""
    check_and_set_cache_dir() # Determine cache location first
    background_tasks = BackgroundTasks()
    background_tasks.add_task(load_model_and_tokenizer)
    await background_tasks()

@app.get("/api/health")
async def health_check():
    """Health check endpoint with model location info"""
    return {
        "status": "ok",
        "version": "2.1.1",
        "model_loaded": model_loaded,
        "model_loading": model_loading,
        "model_id": model_id_loaded if model_loaded else None,
        "model_location": str(MODELS_DIR), # Report the actual cache dir being used
        "device": DEVICE,
        "active_conversations": len(conversations)
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Enhanced chat endpoint with grammar checking and simplification"""
    if not model_loaded:
        if model_error:
            raise HTTPException(500, detail=f"Model failed to load: {model_error}")
        if model_loading:
             raise HTTPException(503, detail="Model is still loading, please wait")
        raise HTTPException(500, detail="Model is not available")

    conversation_id = get_or_create_conversation(request.conversation_id)
    difficulty_level = request.difficulty_level or conversations.get(conversation_id, {}).get("difficulty_level", "beginner")

    try:
        prompt = format_conversation(
            request.conversation_history,
            request.message,
            difficulty_level
        )
        
        response = generate_response(prompt)
        
        grammar_feedback_text = None
        simplified_response = None
        
        # Perform checks only if requested difficulty allows and model is capable
        if difficulty_level in ["beginner", "intermediate"]:
            # Run these potentially slow operations in background or handle errors gracefully
            try:
                simplified_response = simplify_text(response, difficulty_level)
            except Exception as simplify_err:
                logger.error(f"Error simplifying text: {simplify_err}")
            try:
                grammar_feedback_text = check_grammar(request.message)
            except Exception as grammar_err:
                 logger.error(f"Error checking grammar: {grammar_err}")

        update_conversation(conversation_id, request.message, response, difficulty_level)
        
        return ChatResponse(
            response=response,
            conversation_id=conversation_id,
            mood=detect_mood(response),
            grammar_feedback={"analysis": grammar_feedback_text} if grammar_feedback_text else None,
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
    # Use reload=False for production or when debugging model loading issues
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False) 

