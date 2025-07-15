from langchain_community.utilities.polygon import PolygonAPIWrapper
from langchain_community.tools.polygon.aggregates import PolygonAggregates
from langchain_community.tools.polygon.financials import PolygonFinancials
from langchain_community.tools.polygon.ticker_news import PolygonTickerNews
from langchain_community.tools.polygon.last_quote import PolygonLastQuote
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from typing import Dict, Any, Optional, List
import logging
import re
import os

logger = logging.getLogger(__name__)

class StockService:
    def __init__(self, llm=None):
        self.api_wrapper = None
        self.aggregates_tool = None
        self.financials_tool = None
        self.news_tool = None
        self.last_quote_tool = None
        self.llm = llm
        self._initialize_polygon()
    
    def _initialize_polygon(self):
        try:
            # TODO: change this to use env variable
            # normally i would use an env variable for the API key but since this is a demo to share on github i'll hardcode it
            api_key = "2C9lxbAV2F464aMm2mpYEGzfQmSlM5PX"
        
            
            self.api_wrapper = PolygonAPIWrapper(polygon_api_key=api_key)
            self.aggregates_tool = PolygonAggregates(api_wrapper=self.api_wrapper)
            self.financials_tool = PolygonFinancials(api_wrapper=self.api_wrapper)
            self.news_tool = PolygonTickerNews(api_wrapper=self.api_wrapper)
            self.last_quote_tool = PolygonLastQuote(api_wrapper=self.api_wrapper)
            
            logger.info("Polygon API tools initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Polygon API: {e}")
    
    def is_available(self) -> bool:
        return self.api_wrapper is not None
    
    def extract_stock_tickers(self, text: str) -> List[str]:

        patterns = [
            r'\b[A-Z]{1,5}\b', # AAPL, TSLA
            r'\$[A-Z]{1,5}\b', # $AAPL, $TSLA
        ]
        
        tickers = set()
        for pattern in patterns:
            matches = re.findall(pattern, text.upper())
            for match in matches:

                ticker = match.replace('$', '').strip()
                if len(ticker) >= 1 and len(ticker) <= 5:
                    tickers.add(ticker)
        
        return list(tickers)
    
    def _clean_price_data(self, raw_data: dict) -> dict:
        if not isinstance(raw_data, dict) or 'results' not in raw_data:
            return {}
        
        results = raw_data.get('results', [])
        if not results:
            return {}
        

        latest = results[-1]
        

        from datetime import datetime
        timestamp_ms = latest.get('t', 0)
        date = datetime.fromtimestamp(timestamp_ms / 1000).strftime('%Y-%m-%d')
        

        cleaned_data = {
            "date": date,
            "current_price": latest.get('c', 0),
            "open_price": latest.get('o', 0),
            "high_price": latest.get('h', 0),
            "low_price": latest.get('l', 0),
            "volume": latest.get('v', 0),
            "price_change": round(latest.get('c', 0) - latest.get('o', 0), 2),
            "price_change_percent": round(((latest.get('c', 0) - latest.get('o', 0)) / latest.get('o', 0)) * 100, 2) if latest.get('o', 0) else 0,
            "data_points": len(results),
            "status": raw_data.get('status', 'Unknown')
        }
        
        return cleaned_data
    
    def get_stock_data(self, ticker: str) -> Dict[str, Any]:
        if not self.is_available():
            return {"error": "Stock service not available"}
        
        try:
            ticker = ticker.upper().replace('$', '')
            result = {
                "ticker": ticker,
                "data": {},
                "news": [],
                "financials": {}
            }
            

            if self.news_tool:
                try:
                    news_result = self.news_tool.invoke({"query": ticker})
                    if news_result and hasattr(news_result, 'content'):
                        result["news"] = news_result.content
                except Exception as e:
                    result["news"] = []
            else:
                result["news"] = []
            

            if self.financials_tool:
                try:
                    financials_result = self.financials_tool.invoke({"query": ticker})
                    if financials_result and hasattr(financials_result, 'content'):
                        result["financials"] = financials_result.content
                except Exception as e:
                    result["financials"] = {}
            else:
                result["financials"] = {}

            if self.aggregates_tool:
                try:
                    from datetime import datetime, timedelta
                    end_date = datetime.now()
                    start_date = end_date - timedelta(days=5)
                    

                    request_params = {
                        "ticker": ticker,
                        "timespan": "day",
                        "timespan_multiplier": 1,
                        "from_date": start_date.strftime("%Y-%m-%d"),
                        "to_date": end_date.strftime("%Y-%m-%d"),
                    }
                    
                    aggregates_result = self.aggregates_tool.invoke(request_params)
                    
                    if aggregates_result:

                        raw_data = None
                        if hasattr(aggregates_result, 'content'):
                            raw_data = aggregates_result.content
                        else:
                            raw_data = aggregates_result
                        

                        if isinstance(raw_data, dict):
                            results_count = raw_data.get('resultsCount', 0)
                            
                            if results_count > 0:

                                result["data"] = self._clean_price_data(raw_data)
                            else:
                                result["data"] = {}
                        else:
                            result["data"] = {}
                    else:
                        result["data"] = {}
                    
                except Exception as e:

                    if "API Error:" in str(e) and "DELAYED" in str(e):
                        try:
 
                            error_str = str(e)
                            if "API Error:" in error_str:

                                start_idx = error_str.find("{")
                                if start_idx != -1:
                                    import json
                                    import ast
                                    api_response_str = error_str[start_idx:]

                                    try:
                                        api_response = ast.literal_eval(api_response_str)
                                    except:

                                        try:
                                            api_response = json.loads(api_response_str)
                                        except:
                                            result["data"] = {}
                                            return result
                                    
  
                                    if api_response.get('resultsCount', 0) > 0 and api_response.get('results'):
    
                                        result["data"] = self._clean_price_data(api_response)
                                        return result
                                    else:
                                        result["data"] = {}
                                else:
                                    result["data"] = {}
                            else:
                                result["data"] = {}
                        except Exception as parse_error:
                            result["data"] = {}
                    else:
                        result["data"] = {}
            else:
                result["data"] = {}
            
            return result
            
        except Exception as e:
            logger.error(f"Error getting stock data for {ticker}: {e}")
            return {"ticker": ticker, "data": {}, "news": [], "financials": {}}

    def should_use_stock_api(self, query: str) -> tuple[bool, List[str]]:
        if not self.llm:
            stock_keywords = [
                'stock', 'price', 'market', 'trading', 'shares', 'invest', 'portfolio',
                'earnings', 'revenue', 'financial', 'quarterly', 'annual', 'dividend',
                'market cap', 'pe ratio', 'eps', 'revenue', 'profit', 'loss'
            ]
            tickers = self.extract_stock_tickers(query)
            query_lower = query.lower()
            has_stock_keywords = any(keyword in query_lower for keyword in stock_keywords)
            return (len(tickers) > 0 or has_stock_keywords, tickers)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a financial assistant that determines whether a user query requires real-time stock market data.

Consider the following when making your decision:
1. Does the query ask about specific stock prices, market data, or financial metrics?
2. Does it mention specific company ticker symbols (like AAPL, TSLA, etc.)?
3. Does it ask for current/recent financial information, earnings, or market performance?
4. Does it request real-time or up-to-date stock information?

If YES, you MUST also identify and return the stock ticker symbols mentioned in the query.

Respond in this exact format:
- If stock data is needed: "YES:TICKER1,TICKER2,TICKER3" (comma-separated tickers)
- If no stock data needed: "NO"

Examples:
- "What's the price of AAPL?" → "YES:AAPL"
- "How are TSLA and NVDA performing?" → "YES:TSLA,NVDA"
- "What are growth stocks?" → "NO"
- "Tell me about Apple and Microsoft" → "YES:AAPL,MSFT"

Only return the exact format above - no other text."""),
            ("human", "Query: {query}")
        ])
        
        chain = prompt | self.llm | StrOutputParser()
        
        try:
            response = chain.invoke({"query": query})
            response = response.strip().upper()
            
            if "YES:" in response:

                yes_part = response.split("YES:")[1].split()[0] # part after "YES:"
                tickers = [ticker.strip() for ticker in yes_part.split(",") if ticker.strip()]
                

                valid_tickers = []
                for ticker in tickers:
                    if len(ticker) >= 1 and len(ticker) <= 5 and ticker.isalpha():
                        valid_tickers.append(ticker)
                
                if valid_tickers:
                    return (True, valid_tickers)
                else:
                    return (False, [])
            else:
                return (False, [])
                
        except Exception as e:
            logger.error(f"Error using LLM for stock API decision: {e}")
            tickers = self.extract_stock_tickers(query)
            return (len(tickers) > 0, tickers) 