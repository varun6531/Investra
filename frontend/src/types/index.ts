export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  sources?: Source[];
  error?: boolean;
  services_used?: {
    rag_used: boolean;
    stock_api_used: boolean;
    web_search_used: boolean;
  };
  stock_data?: Record<string, any>;
  web_search_results?: any;
  web_search_query?: string;
  stock_tickers?: string[];
  session_id?: string;
}

export interface Source {
  id: number;
  title: string;
  content: string;
  url?: string;
  page?: string;
  citation_text: string;
}

export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  query: string;
  chat_history: ChatHistoryItem[];
  mode?: 'normal' | 'advanced';
  session_id?: string;
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
  timestamp: string;
  services_used?: {
    rag_used: boolean;
    stock_api_used: boolean;
    web_search_used: boolean;
  };
  stock_data?: Record<string, any>;
  web_search_results?: any;
  web_search_query?: string;
  stock_tickers?: string[];
  session_id?: string;
}