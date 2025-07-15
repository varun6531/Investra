/*
api.ts

What is this file for: Mobile API service layer that handles communication between the React Native app and backend server for chat functionality.

What the flow of the functions are: sendMessage() determines the correct endpoint based on mode (normal vs advanced), formats the request with chat history and session data, and returns the structured response from the backend API optimized for mobile.

How this service is used: Called by mobile ChatInterface components to send user messages and receive AI responses with citations and service usage indicators from the LLM service, configured for iOS Simulator localhost access.
*/

import axios from 'axios';
import type { ChatRequest, ChatResponse } from '../types';


// Please only use iOS Simulator from expo on terminal: use localhost (runs on Mac)
const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatService = {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const endpoint = request.mode === 'normal' ? '/chat/normal' : '/chat';
    const requestBody = {
      query: request.query,
      chat_history: request.chat_history,
      mode: request.mode || 'advanced',
      session_id: request.session_id
    };
    const response = await api.post<ChatResponse>(endpoint, requestBody);
    return response.data;
  },
}; 