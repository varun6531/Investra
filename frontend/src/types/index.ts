/*
index.ts

What is this file for: TypeScript type definitions for the chat application including message structures, API requests/responses, and data models.

What the flow of the functions are: Defines Message interface for chat bubbles, Source interface for citations, ChatRequest/ChatResponse for API communication, and ChatHistoryItem for conversation context management.

How this service is used: Provides type safety across the frontend application, ensuring consistent data structures between components and API calls for messages, sources, and service usage indicators.
*/

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