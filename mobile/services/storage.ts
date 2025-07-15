/*
storage.ts

What is this file for: Mobile storage service that manages chat sessions and current session state using AsyncStorage for persistent data across app sessions.

What the flow of the functions are: saveChatSessions() stores session data as JSON, loadChatSessions() retrieves and parses stored sessions, saveCurrentSessionId() tracks active session, and clearAllData() removes all stored data for cleanup.

How this service is used: Called by mobile ChatInterface to persist conversation history, maintain session state across app restarts, and provide data recovery capabilities for the mobile chat experience.
*/

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChatSession, Message } from '../types';

const CHAT_SESSIONS_KEY = 'chatSessions';
const CURRENT_SESSION_ID_KEY = 'currentSessionId';

export const storageService = {
  async saveChatSessions(sessions: ChatSession[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving chat sessions:', error);
    }
  },

  async loadChatSessions(): Promise<ChatSession[]> {
    try {
      const sessions = await AsyncStorage.getItem(CHAT_SESSIONS_KEY);
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      return [];
    }
  },

  async saveCurrentSessionId(sessionId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(CURRENT_SESSION_ID_KEY, sessionId);
    } catch (error) {
      console.error('Error saving current session ID:', error);
    }
  },

  async loadCurrentSessionId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(CURRENT_SESSION_ID_KEY);
    } catch (error) {
      console.error('Error loading current session ID:', error);
      return null;
    }
  },

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([CHAT_SESSIONS_KEY, CURRENT_SESSION_ID_KEY]);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  },


}; 