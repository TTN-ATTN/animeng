import os
import logging
from pathlib import Path
import faiss
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import DirectoryLoader, TextLoader, UnstructuredFileLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.docstore.document import Document
import mimetypes
import traceback

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Configuration
# Use a multilingual model suitable for both English and Vietnamese
EMBEDDING_MODEL_NAME = "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
VECTOR_STORE_PATH = "animeng\\chatbot-fastapi\\app\\faiss_vector_store"
SOURCE_DIRECTORY = "D:\\UNI\\web\\project\\animeng\\chatbot-fastapi\\documents" 

# Define file types to load from the source directory
GLOB_PATTERNS = ["**/*.tsx", "**/*.ts", "**/*.js", "**/*.jsx", "**/*.md", "**/*.json", "**/*.html", "**/*.txt", "**/*.py"]
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 150

# Helper function to determine the appropriate loader for a file
def get_file_loader(file_path):
    """Determine the appropriate loader based on file type."""
    try:
        text_extensions = ['.tsx', '.ts', '.js', '.jsx', '.md', '.json', '.html', '.css', '.txt', '.py']
        if any(file_path.lower().endswith(ext) for ext in text_extensions):
            return TextLoader(file_path, encoding='utf-8')
        
        # Use UnstructuredFileLoader as fallback for other types
        return UnstructuredFileLoader(
            file_path,
            mode="single",
            strategy="fast"
        )
    except Exception as e:
        logger.warning(f"Error creating loader for {file_path}: {e}")
        return None

def load_documents_safely(source_dir: str) -> list[Document]:
    """Load documents with better error handling and Windows path compatibility."""
    documents = []
    source_path = Path(source_dir)
    
    if not source_path.exists() or not source_path.is_dir():
        logger.error(f"Source directory not found: {source_dir}")
        return []

    logger.info(f"Loading documents from: {source_dir}")
    
    # Process each pattern
    for pattern in GLOB_PATTERNS:
        try:
            # Use Path.glob for better Windows compatibility
            matching_files = list(source_path.glob(pattern))
            logger.info(f"Found {len(matching_files)} files matching pattern: {pattern}")
            
            # Process each file individually with appropriate loader
            for file_path in matching_files:
                try:
                    if ".env" in str(file_path):
                        continue

                    loader = get_file_loader(str(file_path))
                    if loader is None:
                        continue
                        
                    docs = loader.load()
                    valid_docs = [doc for doc in docs if doc.page_content and len(doc.page_content) > 10]
                    
                    if valid_docs:
                        documents.extend(valid_docs)
                        logger.info(f"Successfully loaded {len(valid_docs)} documents from {file_path}")
                    else:
                        logger.info(f"No valid content found in {file_path}")
                        
                except Exception as e:
                    logger.warning(f"Error loading file {file_path}: {str(e)}")
                    logger.debug(traceback.format_exc())
                    continue
                    
        except Exception as e:
            logger.warning(f"Error processing pattern {pattern}: {str(e)}")
            logger.debug(traceback.format_exc())
            
    # Final check for empty documents
    if not documents:
        logger.warning("No documents were successfully loaded.")
    else:
        logger.info(f"Total documents loaded: {len(documents)}")
        
    return documents

def split_documents(documents: list[Document]) -> list[Document]:
    """Split documents into smaller chunks."""
    if not documents:
        logger.warning("No documents to split.")
        return []
        
    logger.info(f"Splitting {len(documents)} documents into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        length_function=len,
        add_start_index=True,
    )
    chunks = text_splitter.split_documents(documents)
    logger.info(f"Created {len(chunks)} document chunks.")
    return chunks

def get_embeddings(device="cpu"):
    """Initialize HuggingFace embeddings."""
    logger.info(f"Initializing embeddings model: {EMBEDDING_MODEL_NAME} on device: {device}")
    # Specify device explicitly, default is usually CPU if CUDA not found
    model_kwargs = {"device": device}
    # Recommended settings for sentence-transformers with HuggingFaceEmbeddings
    encode_kwargs = {"normalize_embeddings": True}
    embeddings = HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL_NAME,
        model_kwargs=model_kwargs,
        encode_kwargs=encode_kwargs
    )
    return embeddings

def create_vector_store(chunks: list[Document], embeddings, store_path: str):
    """Create and save FAISS vector store."""
    if not chunks:
        logger.error("No chunks provided to create vector store.")
        return None
        
    logger.info(f"Creating FAISS vector store at: {store_path}")
    try:
        vector_store = FAISS.from_documents(chunks, embeddings)
        os.makedirs(store_path, exist_ok=True)
        vector_store.save_local(store_path)
        logger.info(f"FAISS vector store created and saved.")
        return vector_store
    except Exception as e:
        logger.error(f"Error creating vector store: {str(e)}")
        logger.debug(traceback.format_exc())
        return None

def load_vector_store(store_path: str, embeddings):
    """Load existing FAISS vector store."""
    store_path = Path(store_path)
    index_path = store_path / "index.faiss"
    
    if store_path.exists() and index_path.exists():
        logger.info(f"Loading existing FAISS vector store from: {store_path}")
        try:
            vector_store = FAISS.load_local(str(store_path), embeddings, allow_dangerous_deserialization=True)
            logger.info(f"FAISS vector store loaded.")
            return vector_store
        except Exception as e:
            logger.error(f"Error loading vector store: {str(e)}")
            logger.debug(traceback.format_exc())
            return None
    else:
        logger.warning(f"Vector store not found at: {store_path}")
        return None

def build_or_load_vector_store(device="cpu"):
    """Build the vector store if it doesn't exist, otherwise load it."""
    try:
        embeddings = get_embeddings(device=device)
        vector_store = load_vector_store(VECTOR_STORE_PATH, embeddings)
        
        if vector_store is None:
            logger.info("Building new vector store...")
            documents = load_documents_safely(SOURCE_DIRECTORY)
            if not documents:
                logger.error(f"No documents found in {SOURCE_DIRECTORY}. Please check:")
                logger.error(f"- Directory exists: {Path(SOURCE_DIRECTORY).exists()}")
                logger.error(f"- Contains matching files: {list(Path(SOURCE_DIRECTORY).glob('*'))}")
                return None
                
            chunks = split_documents(documents)
            if not chunks:
                logger.error("No chunks created, cannot build vector store.")
                return None
                
            vector_store = create_vector_store(chunks, embeddings, VECTOR_STORE_PATH)
            
        return vector_store
    except Exception as e:
        logger.error(f"Error in build_or_load_vector_store: {str(e)}")
        logger.debug(traceback.format_exc())
        return None

def get_retriever(vector_store, k=5):
    """Get a retriever object from the vector store."""
    if vector_store:
        return vector_store.as_retriever(search_kwargs={"k": k})
    return None

def delete_vector_store(store_path: str):
    """Delete existing FAISS vector store if it exists."""
    try:
        import shutil
        store_path = Path(store_path)
        if store_path.exists():
            shutil.rmtree(store_path)
            logger.info(f"Deleted existing vector store at: {store_path}")
            return True
        logger.info(f"No existing vector store found at: {store_path} - will create new one")
        return True  # Return True even if didn't exist
    except Exception as e:
        logger.error(f"Error deleting vector store: {str(e)}")
        logger.debug(traceback.format_exc())
        return False
    
def rebuild_vector_store(device="cpu"):
    """Force rebuild the vector store by deleting existing one if present."""
    logger.info("Rebuilding vector store...")
    # Delete if exists, but continue even if it doesn't
    delete_vector_store(VECTOR_STORE_PATH)
    return build_or_load_vector_store(device)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--rebuild", action="store_true", help="Delete and rebuild vector store")
    args = parser.parse_args()

    logger.info("Running RAG utility script for setup...")
    try:
        import torch
        current_device = "cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu")
    except ImportError:
        current_device = "cpu"
        
    logger.info(f"Using device: {current_device}")
    
    vs = rebuild_vector_store(current_device) if args.rebuild else build_or_load_vector_store(current_device)
    
    if vs:
        logger.info("Vector store is ready.")
        retriever = get_retriever(vs)
        if retriever:
            logger.info("Retriever is ready.")
            # Test query
            test_query = "What is the lesson system?"
            results = retriever.invoke(test_query)
            logger.info(f"Test query results:")
            for i, doc in enumerate(results):
                logger.info(f"Result {i+1} (Source: {doc.metadata.get('source', 'N/A')}):\n{doc.page_content[:200]}...\n")
        else:
            logger.error("Failed to create retriever.")
    else:
        logger.error("Failed to build or load vector store.")