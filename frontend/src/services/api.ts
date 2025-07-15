import axios from 'axios';
import type { ChatRequest, ChatResponse } from '../types';

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