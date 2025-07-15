/*
ChatInterface.tsx

What is this file for: Mobile chat interface component that handles message display, session management, and user interactions for the React Native financial Q&A application.

What the flow of the functions are: sendMessage() creates new sessions, calls chatService API, and updates message state, while session management functions handle AsyncStorage persistence and session switching with automatic title generation for mobile.

How this service is used: Core UI component that provides the mobile chat experience with RAG mode switching, citation rendering, and multi-session support optimized for touch interfaces and mobile navigation.
*/

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import type { Message, ChatSession } from '../types';
import { chatService } from '../services/api';
import { storageService } from '../services/storage';
import MessageBubble from './MessageBubble';
import SessionList from './SessionList';
import ModeToggle from './ModeToggle';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ragMode, setRagMode] = useState<'normal' | 'advanced'>('normal');
  const [showSessionList, setShowSessionList] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [pendingRequests, setPendingRequests] = useState<{[sessionId: string]: boolean}>({});
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const savedSessions = await storageService.loadChatSessions();
    const savedCurrentSessionId = await storageService.loadCurrentSessionId();
    
    setChatSessions(savedSessions);
    
    if (savedCurrentSessionId && savedSessions.length > 0) {
      const lastActiveSession = savedSessions.find(s => s.id === savedCurrentSessionId);
      if (lastActiveSession) {
        setCurrentSessionId(lastActiveSession.id);
        setMessages(lastActiveSession.messages);
        return;
      }
    }
    
    if (savedSessions.length > 0) {
      const latestSession = savedSessions[savedSessions.length - 1];
      setCurrentSessionId(latestSession.id);
      setMessages(latestSession.messages);
    }
  };

  useEffect(() => {
    if (chatSessions.length > 0) {
      storageService.saveChatSessions(chatSessions);
    }
  }, [chatSessions]);

  useEffect(() => {
    if (currentSessionId) {
      storageService.saveCurrentSessionId(currentSessionId);
    }
  }, [currentSessionId]);


  useEffect(() => {
    if (currentSessionId && messages.length >= 0) {
      setChatSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { ...session, messages: [...messages], title: generateSessionTitle(messages) }
          : session
      ));
    }
  }, [messages, currentSessionId]);

  const generateSessionTitle = (messages: Message[]): string => {
    if (messages.length === 0) return 'New Chat';
    
    const firstUserMessage = messages.find(msg => msg.sender === 'user');
    if (firstUserMessage) {
      const title = firstUserMessage.text.slice(0, 50);
      return title.length === 50 ? title + '...' : title;
    }
    
    return 'New Chat';
  };

  const startNewChat = () => {
    if (currentSessionId && messages.length > 0) {
      setChatSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { ...session, messages: [...messages], title: generateSessionTitle(messages) }
          : session
      ));
    }
    
    setMessages([]);
    setCurrentSessionId('');
    setShowSessionList(false);
  };

  const switchToSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages([...session.messages]);
      setShowSessionList(false);
    }
  };

  const deleteSession = (sessionId: string) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this chat session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setChatSessions(prev => {
              const filtered = prev.filter(s => s.id !== sessionId);
              
              if (sessionId === currentSessionId && filtered.length > 0) {
                const latestSession = filtered[filtered.length - 1];
                setCurrentSessionId(latestSession.id);
                setMessages(latestSession.messages);
              } else if (filtered.length === 0) {
                setCurrentSessionId('');
                setMessages([]);
              }
              
              return filtered;
            });
          },
        },
      ]
    );
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const messageText = input.trim();
    setInput('');

    let sessionId = currentSessionId;
    let isNewSession = false;
    if (!sessionId) {
      sessionId = Date.now().toString();
      isNewSession = true;
      const newSession = {
        id: sessionId,
        title: messageText.slice(0, 50) + (messageText.length > 50 ? '...' : ''),
        messages: []
      };
      
      setChatSessions(prev => [...prev, newSession]);
      setCurrentSessionId(sessionId);
      setMessages([]);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date().toISOString(),
      session_id: sessionId
    };

    setChatSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, messages: [...session.messages, userMessage] }
        : session
    ));

    if (currentSessionId === sessionId || isNewSession) {
      setMessages(prev => [...prev, userMessage]);
    }

    setLoading(true);
    setError(null);
    setPendingRequests(prev => ({ ...prev, [sessionId]: true }));

    try {
      const chatHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text
      }));

      const response = await chatService.sendMessage({
        query: input,
        chat_history: chatHistory,
        mode: ragMode,
        session_id: sessionId
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.answer,
        sender: 'bot',
        timestamp: response.timestamp,
        sources: response.sources,
        services_used: response.services_used,
        stock_data: response.stock_data,
        web_search_results: response.web_search_results,
        web_search_query: response.web_search_query,
        stock_tickers: response.stock_tickers,
        session_id: sessionId
      };

      setChatSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, messages: [...session.messages, botMessage] }
          : session
      ));

      if (currentSessionId === sessionId) {
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        error: true,
        session_id: sessionId
      };
      
      setChatSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, messages: [...session.messages, errorMessage] }
          : session
      ));

      if (currentSessionId === sessionId) {
        setMessages(prev => [...prev, errorMessage]);
      }
      setError('Failed to send message. Please check your connection.');
    } finally {
      setLoading(false);
      setPendingRequests(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  const canCreateNewChat = !!currentSessionId && messages.length > 0;

  const handleLinkedInPress = () => {
    Linking.openURL('https://www.linkedin.com/in/varun-spillai/');
  };

  const handleGitHubPress = () => {
    Linking.openURL('https://github.com/varun6531');
  };

  return (
    <SafeAreaView style={[styles.container, ragMode === 'advanced' ? styles.containerUltra : styles.containerBase]}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, ragMode === 'advanced' ? styles.headerUltra : styles.headerBase]}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => setShowSessionList(!showSessionList)}
            >
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <Text style={styles.title}>
                Investra {ragMode === 'advanced' && <Text style={styles.ultraText}>Ultra</Text>}
              </Text>
              <Text style={styles.subtitle}>
                {ragMode === 'advanced' 
                  ? <>Advanced AI with <Text style={styles.stockApiText}>Stock API</Text> & <Text style={styles.webSearchText}>Web Search</Text> capabilities</> 
                  : 'Your AI-powered financial assistant'
                }
              </Text>
            </View>
            
            <ModeToggle ragMode={ragMode} setRagMode={setRagMode} />
          </View>
        </View>

        {/* Session List */}
        {showSessionList && (
          <SessionList
            sessions={chatSessions}
            currentSessionId={currentSessionId}
            pendingRequests={pendingRequests}
            onSessionSelect={switchToSession}
            onSessionDelete={deleteSession}
            onNewChat={startNewChat}
            canCreateNewChat={canCreateNewChat}
            ragMode={ragMode}
            onClose={() => setShowSessionList(false)}
          />
        )}

        {/* Messages Area */}
        <ScrollView
          ref={scrollViewRef}
          style={[styles.messagesContainer, ragMode === 'advanced' ? styles.messagesContainerUltra : styles.messagesContainerBase]}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, ragMode === 'advanced' ? styles.emptyIconUltra : styles.emptyIconBase]}>
                <Text style={styles.emptyIconText}>B</Text>
              </View>
              <Text style={styles.emptyTitle}>
                Welcome to Investra {ragMode === 'advanced' && <Text style={styles.ultraText}>Ultra</Text>}
              </Text>
              <Text style={styles.emptySubtitle}>
                Start by asking a question about your documents. You can ask about stock investing, financial planning, or any related topics.
              </Text>
              <View style={styles.modeIndicator}>
                <Text style={styles.modeLabel}>Current Mode:</Text>
                <Text style={[styles.modeBadge, ragMode === 'normal' ? styles.modeBadgeBase : styles.modeBadgeUltra]}>
                  {ragMode === 'normal' ? 'Base' : <Text style={styles.ultraText}>Ultra</Text>}
                </Text>
              </View>
            </View>
          )}
          
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              ragMode={ragMode}
            />
          ))}
          
          {loading && (
            <View style={[styles.loadingBubble, ragMode === 'advanced' ? styles.loadingBubbleUltra : styles.loadingBubbleBase]}>
              <View style={styles.loadingAvatar}>
                <Text style={styles.loadingAvatarText}>BOT</Text>
              </View>
              <View style={styles.loadingContent}>
                <ActivityIndicator size="small" color={ragMode === 'advanced' ? '#10b981' : '#3b82f6'} />
                <Text style={styles.loadingText}>Thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Input Area */}
        <View style={[styles.inputContainer, ragMode === 'advanced' ? styles.inputContainerUltra : styles.inputContainerBase]}>
          <TextInput
            style={[styles.textInput, ragMode === 'advanced' ? styles.textInputUltra : styles.textInputBase]}
            value={input}
            onChangeText={setInput}
            placeholder="Ask a question about your documents..."
            placeholderTextColor={ragMode === 'advanced' ? '#6b7280' : '#9ca3af'}
            multiline
            maxLength={1000}
            editable={!loading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              ragMode === 'advanced' ? styles.sendButtonUltra : styles.sendButtonBase,
              (!input.trim() || loading) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={[styles.footer, ragMode === 'advanced' ? styles.footerUltra : styles.footerBase]}>
          <Text style={styles.footerText}>
            {ragMode === 'normal' ? (
              <>
                <Text style={styles.footerBold}>Base Mode:</Text> The <Text style={styles.footerBold}>Basics for Investing in Stocks</Text> by the Editors of Kiplinger's Personal Finance has been pre-loaded. Ask questions about stock investing, financial planning, or related topics using only the document content.
              </>
            ) : (
              <>
                <Text style={styles.footerBold}>Ultra Mode:</Text> Enhanced with <Text style={styles.footerPurple}>real-time stock data</Text> and <Text style={styles.footerBlue}>web search capabilities</Text>. Ask about current stock prices, market trends, or any financial questions - the AI will search for the latest information when the document doesn't contain the answer.
              </>
            )}
          </Text>
          <View style={styles.footerLinks}>
            <Text style={styles.footerCredits}>
              Built by Varun Pillai • 
              <TouchableOpacity onPress={handleLinkedInPress}>
                <Text style={styles.footerLink}> LinkedIn</Text>
              </TouchableOpacity> • 
              <TouchableOpacity onPress={handleGitHubPress}>
                <Text style={styles.footerLink}> GitHub</Text>
              </TouchableOpacity>
            </Text>
          </View>
        </View>


      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerBase: {
    backgroundColor: '#111827',
  },
  containerUltra: {
    backgroundColor: '#000000',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  headerBase: {
    backgroundColor: '#111827',
  },
  headerUltra: {
    backgroundColor: '#000000',
    borderBottomWidth: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 20,
    color: '#9ca3af',
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  ultraText: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContainerBase: {
    backgroundColor: '#111827',
  },
  messagesContainerUltra: {
    backgroundColor: '#000000',
  },
  messagesContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyIconBase: {
    backgroundColor: '#374151',
  },
  emptyIconUltra: {
    backgroundColor: '#000000',
  },
  emptyIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  modeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  modeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  modeBadgeBase: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
  },
  modeBadgeUltra: {
    backgroundColor: 'transparent',
    color: '#10b981',
  },
  loadingBubble: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingBubbleBase: {
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  loadingBubbleUltra: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  loadingAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  loadingAvatarText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#991b1b',
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 8,
  },
  errorText: {
    color: '#fecaca',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  inputContainerBase: {
    backgroundColor: '#111827',
    borderTopColor: '#374151',
  },
  inputContainerUltra: {
    backgroundColor: '#000000',
    borderTopWidth: 0,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    maxHeight: 120,
  },
  textInputBase: {
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4b5563',
    color: '#ffffff',
  },
  textInputUltra: {
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#10b981',
    color: '#ffffff',
  },
  sendButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonBase: {
    backgroundColor: '#3b82f6',
  },
  sendButtonUltra: {
    backgroundColor: '#10b981',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  footerBase: {
    backgroundColor: '#030712',
    borderTopColor: '#374151',
  },
  footerUltra: {
    backgroundColor: '#000000',
    borderTopWidth: 0,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerBold: {
    fontWeight: '600',
  },
  footerPurple: {
    color: '#a78bfa',
    fontWeight: '600',
  },
  footerBlue: {
    color: '#60a5fa',
    fontWeight: '600',
  },
  footerLinks: {
    marginTop: 12,
  },
  footerCredits: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  footerLink: {
    color: '#9ca3af',
    fontSize: 9,
  },
  stockApiText: {
    color: '#a78bfa',
  },
  webSearchText: {
    color: '#60a5fa',
  },
});

export default ChatInterface; 