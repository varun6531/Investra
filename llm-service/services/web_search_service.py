from langchain_community.utilities.serpapi import SerpAPIWrapper
from typing import Dict, Any, Optional, List
import logging
import os

logger = logging.getLogger(__name__)

class WebSearchService:
    def __init__(self):
        self.search_wrapper = None
        self._initialize_serpapi()
    
    def _initialize_serpapi(self):
        try:
            # TODO: change this to use env variable
            # normally i would use an env variable for the API key but since this is a demo to share on github i'll hardcode it
            api_key = "1ec74560b947438b4f9d1fa6aa1b28f7731ec3f4a98525df131219a48a18f282"

            try:
                self.search_wrapper = SerpAPIWrapper()
            except Exception as env_error:
                try:
                    params = {
                        "engine": "google",
                        "gl": "us",
                        "hl": "en",
                        "num": 5 
                    }
                    
                    self.search_wrapper = SerpAPIWrapper(serpapi_api_key=api_key, params=params)
                except Exception as direct_error:
                    raise direct_error
                
        except Exception as e:
            self.search_wrapper = None
    
    def is_available(self) -> bool:
        return self.search_wrapper is not None
    
    def search(self, query: str, num_results: int = 5) -> Dict[str, Any]:

        if not self.is_available():
            return {"error": "Web search service not available"}
        
        try:

            if not self.search_wrapper:
                return {"error": "Search wrapper not initialized", "query": query}
            

            result = self.search_wrapper.run(query)
            

            if result and len(str(result).strip()) > 0:
                return {
                    "query": query,
                    "results": result
                }
            else:
                return {"error": "No results found", "query": query}
            
        except Exception as e:
            return {"error": str(e), "query": query}
    
    def should_use_web_search(self, query: str, rag_answer: str) -> bool:
        insufficient_keywords = [
            "i am not sure", "i don't know", "cannot find", "not available",
            "no information", "unclear", "uncertain", "not mentioned",
            "not in the context", "not provided", "not found", "can't find"
        ]
        
        rag_lower = rag_answer.lower()
        has_insufficient_indicators = any(keyword in rag_lower for keyword in insufficient_keywords)
        
        is_too_short = len(rag_answer.strip()) < 50
        
        current_keywords = [
            "current", "latest", "recent", "today", "now", "latest news",
            "current price", "current market", "recent developments", "this week", "this month"
            "search", "find", "look up", "check", "search for", "find out", "web search",
            "web results", "web search results", "search the web", "search online", "find online", 
            "web", "online"
        ]
        query_lower = query.lower()
        asks_for_current_info = any(keyword in query_lower for keyword in current_keywords)
        
        return has_insufficient_indicators or is_too_short or asks_for_current_info 