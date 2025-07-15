"""
main.py

What is this file for: FastAPI server that provides LLM chat endpoints with RAG, stock data, and web search capabilities.

What the flow of the functions are: initialize_ollama() sets up embeddings and LLM models, initialize_services() creates all service instances, and chat endpoints process user queries through the RAG pipeline.

How this service is used: Receives chat requests from the backend API gateway and returns AI-generated responses with citations and service usage indicators.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from langchain_ollama import OllamaEmbeddings, OllamaLLM
from langchain_core.documents import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from services.vector_store import VectorStoreService
from services.document_processor import DocumentProcessor
from services.rag_service import RAGService
from services.advanced_rag_service import AdvancedRAGService
from services.stock_service import StockService
from services.web_search_service import WebSearchService
import logging
import os
import time
from datetime import datetime
import sys


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("llm_service.log", mode="w")
    ]
)

logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)

logger = logging.getLogger(__name__)

app = FastAPI(title="LLM Service", version="1.0.0")
backend_port = "http://localhost:3000"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[backend_port],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


embeddings = None
llm = None
vector_store_service = None
rag_service = None
advanced_rag_service = None
stock_service = None
web_search_service = None
document_loaded = False

def initialize_ollama(max_retries=3):
    for attempt in range(max_retries):
        try:
            logger.info(f"Attempting to initialize Ollama (attempt {attempt + 1}/{max_retries})")
            embeddings = OllamaEmbeddings(model="nomic-embed-text")
            llm = OllamaLLM(model="llama3.2:3b")
            logger.info("Ollama components initialized successfully")
            return embeddings, llm
            
        except Exception as e:
            logger.warning(f"Attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                logger.info("Retrying in 5 seconds...")
                time.sleep(5)
            else:
                logger.error("Failed to initialize Ollama after all attempts")
                return None, None

def load_default_document():
    global document_loaded, vector_store_service
    
    try:
        pdf_path = "reference_doc.pdf"
        txt_path = "reference_doc_chunks.txt"
        
        doc_processor = DocumentProcessor(chunk_size=800, chunk_overlap=150)
        
        if os.path.exists(txt_path):
            logger.info(f"Loading from existing text file: {txt_path}")
            chunks = doc_processor.load_from_txt(txt_path, "reference_doc.pdf")
        else:
            if not os.path.exists(pdf_path):
                logger.warning(f"Default document not found: {pdf_path}")
                return False
            
            logger.info("Loading default document: The Basics for Investing in Stocks")
            

            logger.info("Starting PDF processing...")
            chunks = doc_processor.process_pdf(pdf_path)
            logger.info(f"PDF processing completed. Created {len(chunks)} chunks")
        

        if vector_store_service and chunks:
            logger.info("Starting vector store document addition...")
            success = vector_store_service.add_documents(chunks)
            if success:
                document_loaded = True
                logger.info(f"Successfully loaded {len(chunks)} chunks from default document")
                return True
            else:
                logger.error("Failed to add documents to vector store")
                return False
        else:
            logger.error("Vector store service not available or no chunks created")
            return False
            
    except Exception as e:
        logger.error(f"Error loading default document: {e}")
        return False

def initialize_services():
    global embeddings, llm, vector_store_service, rag_service, advanced_rag_service, stock_service, web_search_service
    
    result = initialize_ollama()
    if result is None or result[0] is None or result[1] is None:
        logger.error("Failed to initialize Ollama components")
        return False
    embeddings, llm = result

    try:
        vector_store_service = VectorStoreService(embeddings)
        logger.info("Vector store service initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize vector store service: {e}")
        return False
    

    if not load_default_document():
        logger.warning("Failed to load default document, but continuing...")

    try:
        logger.info("Initializing stock service...")
        stock_service = StockService(llm=llm)
        logger.info("Stock service initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize stock service: {e}")
        stock_service = None
    

    try:
        logger.info("Initializing web search service...")
        web_search_service = WebSearchService()
        logger.info("Web search service initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize web search service: {e}")
        web_search_service = None
    

    try:
        logger.info("Creating vector store retriever...")
        retriever = vector_store_service.get_retriever(k=4)
        logger.info("Vector store retriever created successfully")
        
        logger.info("Initializing basic RAG service...")
        rag_service = RAGService(llm, retriever)
        logger.info("Basic RAG service initialized successfully")
        
        logger.info("Initializing advanced RAG service...")
        advanced_rag_service = AdvancedRAGService(llm, retriever, stock_service, web_search_service)
        logger.info("Advanced RAG service initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize RAG services: {e}")
        return False
    
    return True

class ChatRequest(BaseModel):
    query: str
    chat_history: Optional[List[dict]] = []
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    sources: List[dict]
    timestamp: str
    document_loaded: bool
    services_used: Optional[dict] = None
    stock_data: Optional[dict] = None
    web_search_results: Optional[dict] = None
    web_search_query: Optional[str] = None
    stock_tickers: Optional[List[str]] = None
    session_id: Optional[str] = None

@app.post("/chat", response_model=ChatResponse) # base mode
async def chat(request: ChatRequest):
    try:
        if not advanced_rag_service:
            raise HTTPException(status_code=500, detail="Advanced RAG service not available. Please ensure all services are initialized.")
        

        chat_history = request.chat_history if request.chat_history else []
        result = advanced_rag_service.get_answer(request.query, chat_history)
        
        return ChatResponse(
            answer=result["answer"],
            sources=result["sources"],
            timestamp=datetime.now().isoformat(),
            document_loaded=document_loaded,
            services_used=result.get("services_used"),
            stock_data=result.get("stock_data"),
            web_search_results=result.get("web_search_results"),
            web_search_query=result.get("web_search_query"),
            stock_tickers=result.get("stock_tickers"),
            session_id=request.session_id
        )
    except Exception as e:
        logger.error(f"Error in advanced chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/normal", response_model=ChatResponse) #ultra mode
async def chat_normal(request: ChatRequest):
    try:
        if not rag_service:
            raise HTTPException(status_code=500, detail="RAG service not available. Please ensure all services are initialized.")
        
        chat_history = request.chat_history if request.chat_history else []
        result = rag_service.get_answer(request.query, chat_history)
        
        return ChatResponse(
            answer=result["answer"],
            sources=result["sources"],
            timestamp=datetime.now().isoformat(),
            document_loaded=document_loaded,
            services_used={"rag_used": True, "stock_api_used": False, "web_search_used": False},
            stock_data=None,
            web_search_results=None,
            web_search_query=None,
            stock_tickers=None,
            session_id=request.session_id
        )
    except Exception as e:
        logger.error(f"Error in normal chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    logger.info("Starting LLM Service...")
    

    if initialize_services():
        logger.info("All services initialized successfully")
    else:
        logger.error("Failed to initialize some services")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
 