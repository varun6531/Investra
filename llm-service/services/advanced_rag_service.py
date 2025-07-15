from langchain_core.runnables import RunnableParallel, RunnableSequence, RunnableLambda
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_ollama import OllamaLLM
from typing import List, Dict, Any, Optional
import logging
import re
import json

from .stock_service import StockService
from .web_search_service import WebSearchService

logger = logging.getLogger(__name__)

class AdvancedRAGService:
    def __init__(self, llm: OllamaLLM, retriever, stock_service: Optional[StockService], web_search_service: Optional[WebSearchService]):
        self.llm = llm
        self.retriever = retriever
        self.stock_service = stock_service
        self.web_search_service = web_search_service
        

        self.chain = self._build_chain()
    
    def _build_chain(self):
        

        def check_stock_needed(inputs):
            query = inputs["question"]
            
            if self.stock_service:
                needs_stock, tickers = self.stock_service.should_use_stock_api(query)
                return {"question": query, "chat_history": inputs.get("chat_history", []), "needs_stock": needs_stock, "stock_tickers": tickers}
            else:
                return {"question": query, "chat_history": inputs.get("chat_history", []), "needs_stock": False, "stock_tickers": []}

        def get_stock_data(inputs):
            if not inputs["needs_stock"] or not self.stock_service:
                return {"stock_data": None, "stock_tickers": []}
            

            tickers = inputs.get("stock_tickers", [])
            if not tickers:
                return {"stock_data": None, "stock_tickers": []}
            
            stock_data = {}
            
            for ticker in tickers[:3]:
                data = self.stock_service.get_stock_data(ticker)
                stock_data[ticker] = data
            
            return {"stock_data": stock_data, "stock_tickers": tickers}
        

        def get_rag_answer(inputs):
            question = inputs["question"]
            chat_history = inputs.get("chat_history", [])
            
            try:

                retrieved_docs = self.retriever.invoke(question)
                

                docs_content_parts = []
                for doc in retrieved_docs:
                    try:
                        page_num = doc.metadata.get('page', 'Unknown')
                        content = doc.page_content

                        if not isinstance(content, str):
                            content = str(content)
                        part = f"=== PAGE {page_num} ===\n{content}"
                        docs_content_parts.append(part)
                    except Exception as e:
                        logger.error(f"Error processing document: {e}")
                        continue
                
                docs_content = "\n\n".join(docs_content_parts)
                

                chat_context = ""
                if chat_history:
                    for i, msg in enumerate(chat_history):
 
                        if isinstance(msg, dict):
                            role = msg.get('role', 'unknown')
                            content = msg.get('content', '')

                            role = str(role)
                            content = str(content)
                        else:

                            role = 'unknown'
                            content = str(msg)
                        
                        chat_context += f"{role.capitalize()}: {content}\n"
                else:
                    chat_context = "No previous conversation."
                

                rag_prompt = ChatPromptTemplate.from_messages([
                    ("system", "You are a professional assistant for The Basics for Investing in Stocks by the Editors of Kiplinger's Personal Finance. Always answer questions directly and factually using the provided document context and chat history. If the answer is not in the context, say \"I am not sure about that.\" When asked about previous questions, use the chat history and never say you don't have access to it. CRITICAL: Always provide citations using [Page X] format when referencing information from the document. For example: 'According to the document [Page 3], stocks are...' or 'The basics of investing [Page 5] suggest that...'"),
                    ("human", "Document Context:\n{context}\n\nChat History:\n{chat_history}\n\nQuestion: {question}")
                ])
                

                rag_chain = rag_prompt | self.llm | StrOutputParser()
                

                rag_answer = rag_chain.invoke({
                    "context": str(docs_content),
                    "chat_history": str(chat_context), 
                    "question": str(question)
                })
                

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
                
                return {
                    "rag_answer": rag_answer,
                    "rag_sources": sources,
                    "docs_content": docs_content,
                    "chat_context": chat_context,
                    "question": question
                }
                
            except Exception as e:
                logger.error(f"Error in get_rag_answer: {e}")
                raise
        

        def check_web_search_needed(inputs):
            rag_answer = inputs["rag_answer"]
            question = inputs["question"]

            needs_web_search = self.web_search_service.should_use_web_search(question, rag_answer) if self.web_search_service else False
            return {
                "needs_web_search": needs_web_search,
                "question": question,
                "rag_answer": rag_answer,
                "rag_sources": inputs["rag_sources"],
                "stock_data": inputs.get("stock_data"),
                "chat_history": inputs.get("chat_history", []),
                "stock_tickers": inputs.get("stock_tickers", [])

            }
        

        def combine_and_generate_final_answer(inputs):
            question = inputs["question"]
            rag_answer = inputs["rag_answer"]
            rag_sources = inputs["rag_sources"]
            stock_data = inputs.get("stock_data")
            web_search_results = inputs.get("web_search_results")
            

            stock_api_actually_used = False
            if stock_data:
                for ticker, data in stock_data.items():
                    if data:

                        has_news = data.get("news") and len(str(data["news"])) > 0
                        has_financials = data.get("financials") and len(str(data["financials"])) > 0
                        has_price_data = data.get("data") and isinstance(data["data"], dict) and "error" not in data["data"]
                        
                        if has_news or has_financials or has_price_data:
                            stock_api_actually_used = True
                            break
            
            web_search_actually_used = False
            if web_search_results and "error" not in web_search_results:
                results_content = web_search_results.get("results")
                if results_content:
                    if isinstance(results_content, str) and len(results_content.strip()) > 0:
                        web_search_actually_used = True
                    elif isinstance(results_content, list) and len(results_content) > 0:
                        web_search_actually_used = True
            

            final_context = f"RAG_ANSWER: {rag_answer}\n\n"
            final_context += f"Services Used:\n"
            final_context += f"- Document RAG: True\n"
            final_context += f"- Stock API: {stock_api_actually_used}\n"
            final_context += f"- Web Search: {web_search_actually_used}\n\n"
            

            if stock_data:
                final_context += "STOCK_API:\n"
                for ticker, data in stock_data.items():
                    if data:
                        final_context += f"ticker: {ticker}\n"
                        if data.get("news"):
                            final_context += f"Recent News: {data['news'][:500]}...\n"
                        if data.get("financials"):
                            final_context += f"Financial Data: {str(data['financials'])[:500]}...\n"
                        if data.get("data") and isinstance(data["data"], dict) and "error" not in data["data"]:
                            price_data = data["data"]
                            final_context += f"Current Price: ${price_data.get('current_price', 'N/A')}\n"
                            final_context += f"Date: {price_data.get('date', 'N/A')}\n"
                            final_context += f"Open: ${price_data.get('open_price', 'N/A')}\n"
                            final_context += f"High: ${price_data.get('high_price', 'N/A')}\n"
                            final_context += f"Low: ${price_data.get('low_price', 'N/A')}\n"
                            final_context += f"Volume: {price_data.get('volume', 'N/A'):,}\n"
                            final_context += f"Price Change: ${price_data.get('price_change', 'N/A')} ({price_data.get('price_change_percent', 'N/A')}%)\n"
                        final_context += "\n"
            
            if web_search_actually_used:
                web_results_content = web_search_results.get('results', '')
                if isinstance(web_results_content, str):
                    final_context += f"WEB_SEARCH_RESULTS: {web_results_content}\n\n"
                elif isinstance(web_results_content, list):

                    string_results = []
                    for item in web_results_content:
                        if isinstance(item, dict):

                            string_results.append(str(item))
                        else:
                            string_results.append(str(item))
                    final_context += f"WEB_SEARCH_RESULTS: {' '.join(string_results)}\n\n"
                else:
                    final_context += f"WEB_SEARCH_RESULTS: {str(web_results_content)}\n\n"


            final_prompt = ChatPromptTemplate.from_messages([
                ("system", """You are a comprehensive financial assistant. Provide clear, informative answers by combining information from multiple sources.

The context data will as any of three parts: RAG_ANSWER, STOCK_API, and WEB_SEARCH_RESULTS.

There will be a section called Services Used with fields rag_used, stock_api_use, web_search_used
Only use the data from the services that were actually used, as indicated in the Services Used section.
                                  
Guidelines: 
1. PRIORITY: If the question is about stock prices, market data, or specific companies, prioritize STOCK_API data over other sources
2. Use RAG_ANSWER's data as your base and enhance it with additional information
3. If STOCK_API's data is used incorporate the financial data naturally using [TICKER] format (for example [AAPL])
4. If WEB_SEARCH_RESULTS's is used include current/recent information
5. CRITICAL: For document citations, use ONLY [Page X] format (for example [Page 1], [Page 5]) - do NOT use [1], [2], or any other format
6. Write in a natural, conversational tone
7. CRITICAL:Do NOT mention "RAG_ANSWER", "WEB_SEARCH_RESULTS", "STOCK_API", or "Services Used" in your response
8. Do NOT include "References:" section at the end
9. Integrate all information seamlessly into a single, coherent answer, split into paragraphs when appropriate
10. Only include information from services that were actually used (check the Services Used section)
11. For stock data, use format like "According to recent data, [AAPL] shows..." or "The stock [TSLA] has..."

Format your response as a natural, informative answer while preserving document citations [Page X] and adding stock citations [TICKER] when relevant."""),
                ("human", "Question: {question}\n\nCombined Context:\n{context}")
            ])
            

            final_chain = final_prompt | self.llm | StrOutputParser()
            

            final_answer = final_chain.invoke({
                "question": str(question),
                "context": str(final_context)
            })
            
            services_used = {
                "rag_used": True,
                "stock_api_used": stock_api_actually_used,
                "web_search_used": web_search_actually_used
            }
            
            return {
                "answer": final_answer,
                "sources": rag_sources,
                "services_used": services_used,
                "stock_data": stock_data,
                "web_search_results": web_search_results,
                "web_search_query": inputs.get("question") if web_search_actually_used else None,
                "stock_tickers": inputs.get("stock_tickers", []) if stock_api_actually_used else None
            }

        def merge_parallel_outputs(inputs):
            merged = {
                "question": inputs["rag_info"].get("question", ""),
                "rag_answer": inputs["rag_info"]["rag_answer"],
                "rag_sources": inputs["rag_info"]["rag_sources"],
                "stock_data": inputs["stock_info"]["stock_data"],
                "stock_tickers": inputs["stock_info"].get("stock_tickers", []),
                "chat_history": inputs.get("chat_history", [])
            }
            
            return merged
        
        def add_web_search_results(inputs):
            if inputs.get("needs_web_search", False) and self.web_search_service:
                web_results = self.web_search_service.search(inputs["question"])
                
                if web_results and "error" not in web_results:

                    has_results = False
                    if web_results.get("results"):
                        results_content = web_results.get("results")
                        if isinstance(results_content, str) and len(results_content.strip()) > 0:
                            has_results = True
                        elif isinstance(results_content, list) and len(results_content) > 0:
                            has_results = True
                    
                    if has_results:
                        inputs["web_search_results"] = web_results
                    else:
                        inputs["web_search_results"] = None
                else:
                    inputs["web_search_results"] = None
            else:
                inputs["web_search_results"] = None
            return inputs
        
        chain = (
            RunnableLambda(check_stock_needed)
            | RunnableParallel({
                "stock_info": RunnableLambda(get_stock_data),
                "rag_info": RunnableLambda(get_rag_answer),
            })
            | RunnableLambda(merge_parallel_outputs)
            | RunnableLambda(check_web_search_needed)
            | RunnableLambda(add_web_search_results)
            | RunnableLambda(combine_and_generate_final_answer)
        )
        
        return chain
    
    def get_answer(self, question: str, chat_history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        try:

            inputs = {
                "question": question,
                "chat_history": chat_history or []
            }
            

            result = self.chain.invoke(inputs)
            return {
                "answer": result["answer"],
                "sources": result["sources"],
                "services_used": result["services_used"],
                "stock_data": result.get("stock_data"),
                "web_search_results": result.get("web_search_results"),
                "web_search_query": result.get("web_search_query"),
                "stock_tickers": result.get("stock_tickers")
            }
            
        except Exception as e:
            logger.error(f"Error in advanced RAG: {e}")
            raise

