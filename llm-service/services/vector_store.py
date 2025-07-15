"""
vector_store.py

What is this file for: Manages Qdrant vector database for storing and retrieving document embeddings for similarity search.

What the flow of the functions are: _initialize_client() sets up Qdrant connection, _initialize_collection() creates or connects to existing collection, add_documents() stores document chunks with embeddings, and get_retriever() creates search interface for RAG operations.

How this service is used: Provides the core vector storage and retrieval functionality for the RAG system, enabling semantic search across financial documents.
"""

from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from langchain_core.documents import Document
from langchain_ollama import OllamaEmbeddings
import logging
import os

logger = logging.getLogger(__name__)

class VectorStoreService:
    def __init__(self, embeddings: OllamaEmbeddings, db_path: str = "../vector-db"):
        self.embeddings = embeddings
        self.db_path = db_path
        self.client = None
        self.vector_store = None
        self.collection_name = "financial_docs"

        #make vector db directory
        os.makedirs(db_path, exist_ok=True)
        
        self._initialize_client()
        self._initialize_collection()
        self._initialize_vector_store()
    
    def _initialize_client(self):
        try:
            self.client = QdrantClient(path=f"{self.db_path}/qdrant_data")
            logger.info("Qdrant client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Qdrant client: {e}")
            raise
    
    def _initialize_collection(self):
        try:
            if self.client is None:
                raise ValueError("Qdrant client not initialized")
                
            collections = self.client.get_collections()
            collection_exists = any(col.name == self.collection_name for col in collections.collections)
            
            if collection_exists:
                logger.info(f"Collection {self.collection_name} already exists")
                logger.info(f"Using existing collection: {self.collection_name}")
            else:

                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(size=768, distance=Distance.COSINE),
                )
                logger.info(f"Created new collection: {self.collection_name} with 768 dimensions")
            
        except Exception as e:
            logger.error(f"Failed to initialize collection: {e}")
            raise
    
    def _initialize_vector_store(self):

        try:
            if self.client is None:
                raise ValueError("Qdrant client not initialized")
                
            self.vector_store = QdrantVectorStore(
                client=self.client,
                collection_name=self.collection_name,
                embedding=self.embeddings,
            )
            logger.info("Qdrant vector store initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize vector store: {e}")
            raise
    
    def add_documents(self, documents: list[Document]) -> bool:

        try:
            if not self.vector_store:
                raise ValueError("Vector store not initialized")
            
            logger.info(f"Adding documents to vector store")
            
            batch_size = 100
            total_batches = (len(documents) + batch_size - 1) // batch_size
            
            for i in range(0, len(documents), batch_size):
                batch = documents[i:i + batch_size]
                batch_num = (i // batch_size) + 1
                
                self.vector_store.add_documents(batch)
                logger.info(f"Completed batch {batch_num}/{total_batches}")
            
            logger.info(f"Successfully added all documents to vector store")
            return True
        except Exception as e:
            logger.error(f"Failed to add documents: {e}")
            return False
    
    def get_retriever(self, k: int = 4):
        try:
            if not self.vector_store:
                raise ValueError("Vector store not initialized")
            
            retriever = self.vector_store.as_retriever(
                search_type="similarity",
                search_kwargs={"k": k}
            )
            logger.info(f"Created retriever with k={k}")
            return retriever
            
        except Exception as e:
            logger.error(f"Failed to create retriever: {e}")
            raise
    
    def get_collection_info(self) -> dict:
        try:
            if self.client is None:
                return {"error": "Qdrant client not initialized"}
                
            collection_info = self.client.get_collection(self.collection_name)
            return {
                "name": getattr(collection_info, 'name', 'unknown'),
                "vectors_count": getattr(collection_info, 'vectors_count', 0),
                "status": getattr(collection_info, 'status', 'unknown')
            }
        except Exception as e:
            logger.error(f"Failed to get collection info: {e}")
            return {"error": str(e)} 