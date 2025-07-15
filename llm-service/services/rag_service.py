from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_ollama import OllamaLLM
from typing import List, Dict, Any, Optional
import logging
import re

logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self, llm: OllamaLLM, retriever):
        self.llm = llm
        self.retriever = retriever
        self.system_prompt = (
            "You are a professional assistant for The Basics for Investing in Stocks by the Editors of Kiplinger's Personal Finance. Always answer questions directly and factually using the provided document context and chat history. If the answer is not in the context, say \"I am not sure about that.\" When asked about previous questions, use the chat history and never say you don't have access to it. CRITICAL: For document citations, use ONLY [Page X] format (for example [Page 1], [Page 5]) - do NOT use [1], [2], or any other format when referencing information from the document."
        )
    
    def get_answer(self, question: str, chat_history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        try:
            
            retrieved_docs = self.retriever.invoke(question)
            
            for idx, doc in enumerate(retrieved_docs):
                page_num = doc.metadata.get('page', 'Unknown')
            

            docs_content = "\n\n".join(f"=== PAGE {doc.metadata.get('page', 'Unknown')} ===\n{doc.page_content}" for doc in retrieved_docs) # Combine all docs contents
            

            chat_context = ""
            if chat_history:
                for msg in chat_history:
                    role = msg.get('role', 'unknown')
                    content = msg.get('content', '')
                    chat_context += f"{role.capitalize()}: {content}\n"
            else:
                chat_context = "No previous conversation."
            
            
            messages = ChatPromptTemplate.from_messages([
                ("system", self.system_prompt + "\n\nDocument Context:\n{context}\n\nChat History:\n{chat_history}"),
                ("human", "{question}"),
            ]).invoke({"question": question, "context": docs_content, "chat_history": chat_context})
            

            response = self.llm.invoke(messages)
            answer_content = response if isinstance(response, str) else response.content
            


            

            citations = self._extract_citations_from_answer(answer_content)

            

            sources = []
            for i, doc in enumerate(retrieved_docs):
                page_number = doc.metadata.get('page', 'Unknown page')
                source_title = doc.metadata.get('source', 'The Basics for Investing in Stocks')
                base_url = "https://www.rld.nm.gov/wp-content/uploads/2021/06/IPT_Stocks_2012.pdf"
                if page_number and page_number != 'Unknown page':
                    url = f"{base_url}#page={page_number}"
                else:
                    url = base_url
                sources.append({
                    "id": i + 1,
                    "content": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                    "metadata": doc.metadata,
                    "page": page_number,
                    "title": source_title,
                    "citation_text": f"[{i + 1}] {source_title}, Page {page_number}",
                    "url": url
                })

            cited_pages = {citation['page'] for citation in citations}
            filtered_sources = []
            seen_pages = set()
            
            for s in sources:
                if s['page'] in cited_pages and s['page'] not in seen_pages:
                    filtered_sources.append(s)
                    seen_pages.add(s['page'])

            for i, source in enumerate(filtered_sources):
                source['id'] = i + 1
                source['citation_text'] = f"[{i + 1}] {source['title']}, Page {source['page']}"
            
            return {
                "answer": answer_content,
                "sources": filtered_sources
            }
            
        except Exception as e:
            logger.error(f"Error getting RAG answer: {e}")
            raise
    
    def _extract_citations_from_answer(self, answer: str) -> List[Dict[str, str]]:
        citations = []
        page_pattern = r'\[Page (\d+)\]' #  [Page 1], [Page 2]...
        matches = re.finditer(page_pattern, answer)
        
        for match in matches:
            page_num = match.group(1)
            citations.append({
                'page': page_num,
                'text': f"Page {page_num}"
            })
        
        return citations 