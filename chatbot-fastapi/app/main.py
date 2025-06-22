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
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from functools import lru_cache
from pathlib import Path
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from langdetect import detect, LangDetectException
from rag_utils import build_or_load_vector_store, get_retriever, EMBEDDING_MODEL_NAME
from langchain_core.vectorstores import VectorStoreRetriever

# Hugging Face token loading
load_dotenv("chatbot.env") 
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

# RAG configuration
MAX_RAG_DOCS = 3
MAX_RAG_DOC_LENGTH = 500

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
            os.environ["HF_HOME"] = str(MODELS_DIR)
            os.environ["HF_DATASETS_CACHE"] = str(MODELS_DIR / "datasets")
            os.environ["TORCH_HOME"] = str(MODELS_DIR / "torch")
            
        except OSError as e:
            logger.warning(f"E: drive found, but failed to create/write to cache directory {custom_cache_path}. Error: {e}. Falling back to default cache.")
            MODELS_DIR = DEFAULT_CACHE_DIR
            MODELS_DIR.mkdir(parents=True, exist_ok=True)
            os.environ["TRANSFORMERS_CACHE"] = str(MODELS_DIR)
            os.environ["HF_HOME"] = str(MODELS_DIR)
            os.environ["HF_DATASETS_CACHE"] = str(MODELS_DIR / "datasets")
            os.environ["TORCH_HOME"] = str(MODELS_DIR / "torch")
    else:
        logger.warning("E: drive not found or not accessible. Using default cache directory.")
        MODELS_DIR = DEFAULT_CACHE_DIR
        MODELS_DIR.mkdir(parents=True, exist_ok=True)
        os.environ["TRANSFORMERS_CACHE"] = str(MODELS_DIR)
        os.environ["HF_HOME"] = str(MODELS_DIR)
        os.environ["HF_DATASETS_CACHE"] = str(MODELS_DIR / "datasets")
        os.environ["TORCH_HOME"] = str(MODELS_DIR / "torch")

# Model configuration
MODEL_ID = "google/gemma-2b-it"  
DEVICE = "cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu")
logger.info(f"Using device: {DEVICE}")

# Global variables to store model, tokenizer, and RAG retriever
model = None
tokenizer = None
model_loading = False
model_loaded = False
model_error = None
model_id_loaded = None
rag_retriever: Optional[VectorStoreRetriever] = None
rag_ready = False
rag_error = None

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    mood: str = "default"
    retrieved_context: Optional[List[Dict[str, Any]]] = None

def detect_language(text):
    """Detect language of input text."""
    try:
        lang = detect(text)
        return lang
    except LangDetectException:
        return "en"

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
        model_loaded = False
        
    finally:
        model_loading = False

def load_rag_retriever():
    """Load or build the RAG vector store and retriever."""
    global rag_retriever, rag_ready, rag_error
    try:
        logger.info("Initializing RAG retriever...")
        vector_store = build_or_load_vector_store(device=DEVICE)
        if vector_store:
            rag_retriever = get_retriever(vector_store, k=MAX_RAG_DOCS)
            if rag_retriever:
                rag_ready = True
                logger.info("RAG retriever initialized successfully.")
            else:
                rag_error = "Failed to create retriever from vector store."
                logger.error(rag_error)
        else:
            rag_error = "Failed to build or load vector store."
            logger.error(rag_error)
    except Exception as e:
        rag_error = f"Error initializing RAG: {str(e)}"
        logger.error(rag_error)
        rag_ready = False

def truncate_rag_docs(docs, max_length=MAX_RAG_DOC_LENGTH):
    """Truncate RAG documents to fit within context window."""
    if not docs:
        return []
    
    for doc in docs:
        if len(doc.page_content) > max_length:
            doc.page_content = doc.page_content[:max_length] + "..."
    
    return docs

def format_conversation(user_message, retrieved_docs=None):
    """Format conversation for model input using appropriate chat template."""
    global tokenizer, model_id_loaded

    if not tokenizer:
        logger.error("Tokenizer not available for formatting conversation.")
        return f"User: {user_message}\nAssistant:"

    lang = detect_language(user_message)
    is_vietnamese = lang == "vi"
    
    if is_vietnamese:
        system_prompt = """Bạn là Miku, một trợ lý AI thân thiện giúp học tiếng Anh.
        - Chỉ trả lời câu hỏi được hỏi, không tạo ra các cuộc hội thoại giả định
        - KHÔNG được tự đặt câu hỏi và tự trả lời
        - Giải thích khái niệm ngữ pháp rõ ràng và ngắn gọn
        - Cung cấp ví dụ và sửa lỗi khi cần thiết
        - Trả lời bằng tiếng Việt khi được hỏi bằng tiếng Việt
        - Sử dụng định dạng Markdown để làm nổi bật các phần quan trọng
        - Trả lời trực tiếp và ngắn gọn, tránh dài dòng
        - KHÔNG được tạo ra các cuộc đối thoại giả định giữa người dùng và trợ lý"""
    else:
        system_prompt = """You are Miku, a friendly AI English tutor.
        - ONLY answer the question asked, do not create fictional dialogues
        - DO NOT create hypothetical questions and answers
        - Explain grammar concepts clearly and concisely
        - Provide examples and corrections when needed
        - Reply in English when asked in English
        - Use Markdown formatting to highlight important parts
        - Answer directly and concisely, avoid being verbose
        - DO NOT create fictional dialogues between user and assistant"""

    if retrieved_docs:
        truncated_docs = truncate_rag_docs(retrieved_docs)
        context_str = "\n\n".join([doc.page_content for doc in truncated_docs])
        
        if is_vietnamese:
            system_prompt += f"\n\nDựa vào thông tin sau đây từ trang web để trả lời câu hỏi của người dùng nếu có liên quan:\n---BEGIN CONTEXT---\n{context_str}\n---END CONTEXT---"
        else:
            system_prompt += f"\n\nUse the following information from the website to answer the user's question if relevant:\n---BEGIN CONTEXT---\n{context_str}\n---END CONTEXT---"

    messages = [{"role": "system", "content": system_prompt}]
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
             formatted_prompt += f"System: {messages[0]['content']}\n"
             messages = messages[1:]

        for msg in messages:
             formatted_prompt += f"{msg['role'].capitalize()}: {msg['content']}\n"
        formatted_prompt += "Assistant:"
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
    cleaned = re.sub(r'(?i)(User|Assistant|Miku):\s*.*?(\n|$)', '', response)
    
    dialogue_patterns = [
        r'Let\'s try',
        r'Let me ask',
        r'Now, let\'s',
        r'Hãy thử',
        r'Bây giờ hãy',
    ]
    for pattern in dialogue_patterns:
        cleaned = re.sub(f'{pattern}.*?(\n|$)', '', cleaned)
    
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
    
    return cleaned.strip()

def detect_mood(response):
    """Detect mood from response text"""
    response_lower = response.lower()
    
    positive_words = ["great", "excellent", "well done", "perfect", "amazing", 
                     "tuyệt vời", "xuất sắc", "làm tốt lắm", "hoàn hảo"]
    
    negative_words = ["sorry", "incorrect", "wrong", "mistake", 
                     "xin lỗi", "không đúng", "sai", "lỗi"]
    
    encouraging_words = ["try", "practice", "improve", "better", 
                        "cố gắng", "luyện tập", "cải thiện", "tốt hơn"]
    
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

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for application startup and shutdown."""
    global rag_retriever
    
    if not hf_token and MODEL_ID in ["google/gemma-2b-it"]:
        logger.warning("No Hugging Face token provided for gated model - loading may fail")

    check_and_set_cache_dir()
    
    background_tasks = BackgroundTasks()
    background_tasks.add_task(load_model_and_tokenizer)
    background_tasks.add_task(load_rag_retriever)
    await background_tasks()
    
    yield
    
app = FastAPI(
    title="Multilingual RAG Chatbot API",
    description="API for multilingual language learning chatbot with RAG using website content",
    version="3.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    """Health check endpoint with model and RAG status"""
    return {
        "status": "ok",
        "version": "3.0.0",
        "model_loaded": model_loaded,
        "model_loading": model_loading,
        "model_error": model_error,
        "model_id": model_id_loaded or MODEL_ID,
        "rag_ready": rag_ready,
        "rag_error": rag_error,
        "device": DEVICE,
        "model_location": str(MODELS_DIR),
        "embedding_model": EMBEDDING_MODEL_NAME,
    }

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Chat endpoint that uses RAG to enhance responses"""
    global model_loaded, model_loading, rag_retriever, rag_ready
    
    if not model_loaded:
        if model_loading:
            raise HTTPException(status_code=503, detail="Model is still loading")
        else:
            raise HTTPException(status_code=500, detail=f"Model failed to load: {model_error}")
    
    retrieved_docs = []
    retrieved_context_info = []
    
    if rag_ready and rag_retriever:
        try:
            retrieved_docs = rag_retriever.invoke(request.message)
            for doc in retrieved_docs:
                source = doc.metadata.get("source", "Unknown")
                preview = doc.page_content[:100] + "..." if len(doc.page_content) > 100 else doc.page_content
                retrieved_context_info.append({
                    "source": source,
                    "content_preview": preview
                })
        except Exception as e:
            logger.error(f"Error retrieving documents: {str(e)}")
    
    prompt = format_conversation(request.message, retrieved_docs)
    
    try:
        response = generate_response(prompt)
        cleaned_response = clean_response(response)
    except Exception as e:
        logger.error(f"Error generating response: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")
    
    mood = detect_mood(cleaned_response)
    if not mood:
        mood = "default"    

    return ChatResponse(
        response=cleaned_response,
        mood=mood,
        retrieved_context=retrieved_context_info if retrieved_context_info else None
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)