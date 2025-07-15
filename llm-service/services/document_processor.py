"""
document_processor.py

What is this file for: Processes PDF documents into chunks for vector storage and manages document loading from text files.

What the flow of the functions are: process_pdf() loads PDF pages, splits them into chunks with metadata, and saves to text file, while load_from_txt() reads pre-processed chunks from text files for faster loading.

How this service is used: Called during LLM service initialization to prepare the reference document for RAG operations and vector storage.
"""

import logging
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader
from typing import Optional
import os

logger = logging.getLogger(__name__)

# Storing the chunks into a text file and also loading it from there
# to keep track of page number easier from pdf

class DocumentProcessor:
    def __init__(self, chunk_size: int = 800, chunk_overlap: int = 150):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
    
    def process_pdf(self, pdf_path: str) -> list[Document]:
        try:
            logger.info(f"Loading PDF: {pdf_path}")
            
            if not os.path.exists(pdf_path):
                raise FileNotFoundError(f"PDF file not found: {pdf_path}")
            

            loader = PyPDFLoader(pdf_path)
            pages = loader.load()
            
            logger.info(f"Loaded {len(pages)} pages from PDF")
            

            txt_path = "reference_doc_chunks.txt"

            all_chunks = []
            chunk_id = 0
            
            with open(txt_path, 'w', encoding='utf-8') as txt_file:
                for page in pages:
                    page_num = page.metadata.get('page', 0) + 1 
                    content = page.page_content
                    
                    if content.strip():
                        # Split content into chunks
                        chunks = self.text_splitter.split_text(content)
                        
                        # Add page metadata to each chunk and save to text file
                        for chunk in chunks:
                            chunk_id += 1
                            # Save chunk with page number prefix to text file
                            txt_file.write(f"[Page {page_num}] {chunk}\n\n")
                            
                            # Create Document object for vector store
                            doc = Document(
                                page_content=chunk,
                                metadata={
                                    'page': str(page_num),
                                    'source': os.path.basename(pdf_path),
                                    'chunk_id': chunk_id
                                }
                            )
                            all_chunks.append(doc)
            
            logger.info(f"Saved {len(all_chunks)} chunks to {txt_path}")
            logger.info(f"Created {len(all_chunks)} chunks with page metadata")
            logger.info(f"Successfully processed PDF: {len(all_chunks)} chunks created")
            
            return all_chunks
            
        except Exception as e:
            logger.error(f"Error processing PDF: {e}")
            raise
    
    def load_from_txt(self, txt_path: str, source_name: Optional[str] = None) -> list[Document]:
        try:
            logger.info(f"Loading chunks from text file: {txt_path}")
            
            if not os.path.exists(txt_path):
                raise FileNotFoundError(f"Text file not found: {txt_path}")
            
            if source_name is None:
                source_name = os.path.basename(txt_path)
            
            all_chunks = []
            chunk_id = 0
            
            with open(txt_path, 'r', encoding='utf-8') as txt_file:
                content = txt_file.read()
                
                chunks = content.split('\n\n')
                
                for chunk in chunks:
                    chunk = chunk.strip()
                    if not chunk:
                        continue
                    
                    chunk_id += 1

                    page_match = chunk.split(']', 1)
                    if len(page_match) >= 2 and page_match[0].startswith('[Page '):
                        page_num = page_match[0][6:]  # Remove '[Page ' prefix
                        chunk_content = page_match[1].strip()
                    else:
                        page_num = 'Unknown'
                        chunk_content = chunk

                    doc = Document(
                        page_content=chunk_content,
                        metadata={
                            'page': page_num,
                            'source': source_name,
                            'chunk_id': chunk_id
                        }
                    )
                    all_chunks.append(doc)
            
            logger.info(f"Loaded {len(all_chunks)} chunks from {txt_path}")
            return all_chunks
            
        except Exception as e:
            logger.error(f"Error loading from text file: {e}")
            raise 