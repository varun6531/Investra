import React, { useState, useRef, useEffect } from 'react';
import type { Message, ChatHistoryItem, Source } from '../types';
import { chatService } from '../services/api';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ragMode, setRagMode] = useState<'normal' | 'advanced'>('normal');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState<{id: string, title: string, messages: Message[]}[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [pendingRequests, setPendingRequests] = useState<{[sessionId: string]: boolean}>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentSessionIdRef = useRef<string>('');

  const isAdvancedMode = ragMode === 'advanced';
  const theme = {
    bgPrimary: isAdvancedMode ? 'bg-black' : 'bg-gray-900',
    bgSecondary: isAdvancedMode ? 'bg-gray-900' : 'bg-gray-800',
    bgTertiary: isAdvancedMode ? 'bg-gray-800' : 'bg-gray-700',
    
    textPrimary: 'text-white',
    textSecondary: isAdvancedMode ? 'text-green-300' : 'text-gray-300',
    textTertiary: isAdvancedMode ? 'text-green-500' : 'text-gray-400',
    
    borderPrimary: isAdvancedMode ? 'border-green-600' : 'border-gray-800',
    borderSecondary: isAdvancedMode ? 'border-green-700' : 'border-gray-700',
    buttonPrimary: isAdvancedMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700',
    buttonSecondary: isAdvancedMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-700 hover:bg-gray-600',
    
    accent: isAdvancedMode ? 'text-green-400' : 'text-blue-400',
    accentBg: isAdvancedMode ? 'bg-green-600' : 'bg-blue-600',
    

    stockColor: 'text-purple-400',
    webSearchColor: 'text-blue-400',
  };

  useEffect(() => {
    const savedSessions = localStorage.getItem('chatSessions');
    const savedCurrentSessionId = localStorage.getItem('currentSessionId');
    
    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions);
        setChatSessions(parsedSessions);
        if (savedCurrentSessionId && parsedSessions.length > 0) {
          const lastActiveSession = parsedSessions.find((s: {id: string, title: string, messages: Message[]}) => s.id === savedCurrentSessionId);
          if (lastActiveSession) {
            setCurrentSessionId(lastActiveSession.id);
            setMessages(lastActiveSession.messages);
            return;
          }
        }
        

        if (parsedSessions.length > 0) {
          const latestSession = parsedSessions[parsedSessions.length - 1];
          setCurrentSessionId(latestSession.id);
          setMessages(latestSession.messages);
        }
      } catch (error) {
        console.error('Error loading chat sessions:', error);
        localStorage.removeItem('chatSessions');
        localStorage.removeItem('currentSessionId');
      }
    }
  }, []);

  useEffect(() => {
    if (chatSessions.length > 0) {
      localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    }
  }, [chatSessions]);

  useEffect(() => {
    console.log('current session ID changed to:', currentSessionId);
    currentSessionIdRef.current = currentSessionId;
    if (currentSessionId) {
      localStorage.setItem('currentSessionId', currentSessionId);
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
  };

  const switchToSession = (sessionId: string) => {
    console.log('Switching to session:', sessionId, 'from current:', currentSessionId);
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages([...session.messages]);
      setSidebarOpen(false);
    }
  };

  const deleteSession = (sessionId: string) => {
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
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;


    let sessionId = currentSessionId;
    let isNewSession = false;
    if (!sessionId) {
      sessionId = Date.now().toString();
      isNewSession = true;
      const newSession = {
        id: sessionId,
        title: input.slice(0, 50) + (input.length > 50 ? '...' : ''),
        messages: []
      };
      
      setChatSessions(prev => [...prev, newSession]);
      setCurrentSessionId(sessionId);

      setMessages([]);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
      session_id: sessionId
    };

    // Add user message to the correct session
    setChatSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, messages: [...session.messages, userMessage] }
        : session
    ));

    if (currentSessionId === sessionId || isNewSession) {
    setMessages(prev => [...prev, userMessage]);
    }

    setInput('');
    setLoading(true);
    setError(null);

    setPendingRequests(prev => ({ ...prev, [sessionId]: true }));

    try {
      const chatHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })) as ChatHistoryItem[];

      const response = await chatService.sendMessage({
        query: input,
        chat_history: chatHistory,
        mode: ragMode,
        session_id: sessionId
      });

      console.log('Services Used:', response.services_used);

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

      if (currentSessionIdRef.current === sessionId) {
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

      if (currentSessionIdRef.current === sessionId) {
      setMessages(prev => [...prev, errorMessage]);
      }
      setError('Failed to send message. Please check your connection.');
    } finally {
      setLoading(false);
      setPendingRequests(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getCitationText = (id: number, sources: Source[]) => {
    const found = sources.find((s) => s.id === id);
    return found ? found.citation_text : '';
  };

  const getCitationUrl = (id: number, sources: Source[]) => {
    const found = sources.find((s) => s.id === id);
    return found && found.url ? found.url : undefined;
  };

  const renderAnswerWithCitations = (text: string, sources: Source[], stockTickers?: string[], mode: 'normal' | 'advanced' = 'normal') => {
    console.log('=== CITATION RENDERING ===');
    console.log('Text length:', text.length);
    console.log('Stock Tickers:', stockTickers);
    console.log('Mode:', mode);
    
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    let hasDocumentCitations = false;
    let citedSourceIds = new Set<number>();
    
    const processParagraph = (paragraphText: string) => {
      let processedText = paragraphText;
      

      if (stockTickers && stockTickers.length > 0) {
        console.log('Processing stock tickers:', stockTickers);
      stockTickers.forEach(ticker => {
          const tickerPattern = new RegExp(`\\b${ticker}\\b`, 'gi');
          const matches = processedText.match(tickerPattern);
          if (matches) {
            console.log(`Found ${matches.length} occurrences of ${ticker}`);
          }
        processedText = processedText.replace(tickerPattern, `[STOCK${ticker}]`);
      });
    }
    

      const pagePattern = /\b(?:page|Page)\s*[-]?\s*(\d+)\b/gi; // Page 1, page 1, Page-1, page-1...
    processedText = processedText.replace(pagePattern, (match, pageNum) => {

      const source = sources.find(s => s.page === pageNum);
      if (source) {
        hasDocumentCitations = true;
        citedSourceIds.add(source.id);
        return `[DOC${source.id}]`; // [DOC1] (only one doc for now)
      }
      return match;
    });
    

    const parts = processedText.split(/(\[DOC\d+\]|\[STOCK[A-Z]+\])/g);
    
    const renderedParts = parts.map((part, i) => {
      const docMatch = part.match(/^\[DOC(\d+)\]$/);
      if (docMatch) {
        const citationId = parseInt(docMatch[1], 10);
        const source = sources.find(s => s.id === citationId);
        if (source) {
          const citationText = getCitationText(source.id, sources);
          const citationUrl = getCitationUrl(source.id, sources);
          return (
            <sup key={i}>
              {citationUrl ? (
                <a
                  href={citationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-500 hover:underline cursor-pointer font-semibold"
                  title={citationText}
                >
                  [{citationId}]
                </a>
              ) : (
                <span
                  className="text-green-500 cursor-pointer font-semibold"
                  title={citationText}
                >
                  [{citationId}]
                </span>
              )}
            </sup>
          );
        }
      }
      
      const stockMatch = part.match(/^\[STOCK([A-Z]+)\]$/); // [AAPL], [GOOGL], etc.
      if (stockMatch) {
        const ticker = stockMatch[1];
        return (
            <a
              key={i}
              href={`https://finance.yahoo.com/quote/${ticker}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-500 hover:underline cursor-pointer font-semibold"
              title={`View ${ticker} stock data on Yahoo Finance`}
            >
              {ticker}
            </a>
        );
      }
      
      return part;
    });
      
      return renderedParts;
    };
    
    const renderedParagraphs = paragraphs.map((paragraph, index) => (
      <p key={index} className="text-base leading-relaxed">
        {processParagraph(paragraph)}
      </p>
    ));
    
    console.log('Citation Patterns Found:', text.match(/(\[DOC\d+\]|\[STOCK[A-Z]+\])/g));
    console.log('Cited Source IDs:', Array.from(citedSourceIds));
    console.log('=== END CITATION PROCESSING ===');
    
    return {
      renderedParts: renderedParagraphs,
      hasDocumentCitations,
      citedSourceIds
    };
  };

  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    return (
    <div
      className={
        `flex gap-4 p-6 rounded-2xl shadow-md max-w-4xl mx-auto transition-all duration-500 ease-in-out ` +
        (message.sender === 'user'
          ? `flex-row-reverse ${isAdvancedMode ? 'bg-green-600' : 'bg-blue-600'} text-white`
          : `${theme.bgSecondary} ${theme.textPrimary} border ${theme.borderSecondary}`)
      }
    >
      <div
        className={
          `flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow transition-all duration-500 ease-in-out ` +
          (message.sender === 'user' ? (isAdvancedMode ? 'bg-green-700' : 'bg-blue-700') : theme.bgTertiary)
        }
      >
        {message.sender === 'user' ? 'USER' : 'BOT'}
      </div>
      <div className="flex-1">
        {/* Service Usage Indicators - Small bubbles */}
        {message.sender === 'bot' && message.services_used && (
          <div className="flex items-center gap-2 mb-2">
            {message.services_used.rag_used && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                RAG
              </span>
            )}
            {message.services_used.stock_api_used && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
                Stock
              </span>
            )}
            {message.services_used.web_search_used && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                Web
              </span>
            )}
          </div>
        )}
        {(() => {
          if (message.sender === 'bot' && message.sources) {
            const citationResult = renderAnswerWithCitations(message.text, message.sources, message.stock_tickers, ragMode);
            return (
              <>
                <div className="space-y-3">
                  {citationResult.renderedParts}
                </div>
                {citationResult.hasDocumentCitations && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <div className="text-xs text-gray-400 space-y-1">
                      {message.sources
                        .filter(source => citationResult.citedSourceIds.has(source.id))
                        .map((source) => (
                          <div key={source.id} className="flex items-start gap-2">
                            <span className="font-medium text-green-500">[{source.id}]</span>
                            {source.url ? (
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline text-green-300"
                              >
                                {source.citation_text.replace(`[${source.id}]`, '')}
                              </a>
                            ) : (
                              <span>{source.citation_text.replace(`[${source.id}]`, '')}</span>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            );
          } else {
            const paragraphs = message.text.split(/\n\s*\n/).filter(p => p.trim());
            return (
              <div className="space-y-3">
                {paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-base leading-relaxed">
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
            );
          }
        })()}

        {/* Web Search Query Footer */}
        {message.web_search_query && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="text-xs text-blue-400">
              <span className="font-medium">🔍 Searched:</span>{' '}
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(message.web_search_query)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-blue-300"
                title={`Search for: ${message.web_search_query}`}
              >
                {message.web_search_query}
              </a>
            </div>
          </div>
        )}

        {/* Stock Tickers Footer */}
        {message.stock_tickers && message.stock_tickers.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="text-xs text-purple-400">
              <span className="font-medium">📈 Stock Data:</span>{' '}
              {message.stock_tickers!.map((ticker, index) => (
                <React.Fragment key={ticker}>
                  <a
                    href={`https://finance.yahoo.com/quote/${ticker}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-purple-300"
                    title={`View ${ticker} stock data on Yahoo Finance`}
                  >
                    {ticker}
                  </a>
                  {index < message.stock_tickers!.length - 1 && ' '}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {message.error && (
          <div className="mt-2 flex items-center gap-2 text-red-400">
            <span className="text-xs font-bold">ERROR</span>
            <span className="text-xs">Error occurred</span>
          </div>
        )}
      </div>
    </div>
  );
  };

  const canCreateNewChat = currentSessionId && messages.length > 0;

  return (
    <div className={`min-h-screen flex transition-all duration-500 ease-in-out ${
      isAdvancedMode 
        ? 'bg-gradient-to-br from-black to-gray-900' 
        : 'bg-gradient-to-br from-gray-900 to-gray-800'
    }`}>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 ${theme.bgPrimary} border-r ${theme.borderPrimary} transform transition-all duration-500 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className={`p-4 border-b ${theme.borderPrimary} transition-all duration-500 ease-in-out`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-semibold ${theme.textPrimary} transition-all duration-500 ease-in-out`}>Chat History</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className={`lg:hidden p-2 ${theme.textTertiary} hover:${theme.textPrimary} transition-all duration-300 ease-in-out`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <button
              onClick={startNewChat}
              disabled={!canCreateNewChat}
              className={`w-full mt-4 px-4 py-2 rounded-lg transition-all duration-500 ease-in-out text-sm font-medium ${
                canCreateNewChat 
                  ? `${theme.buttonPrimary} text-white` 
                  : `${theme.bgTertiary} ${theme.textTertiary} cursor-not-allowed`
              }`}
            >
              + New Chat
            </button>
          </div>

          {/* Chat Sessions List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* Show "New Chat" indicator when no current session */}
            {!currentSessionId && (
              <div className={`p-3 rounded-lg ${theme.accentBg} text-white transition-all duration-500 ease-in-out`}>
                <p className="text-sm font-medium">New Chat</p>
                <p className="text-xs opacity-75 mt-1">Start typing to create a new conversation</p>
              </div>
            )}
            
            {chatSessions.map((session) => (
              <div
                key={session.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-500 ease-in-out ${
                  session.id === currentSessionId
                    ? `${theme.accentBg} text-white`
                    : `${theme.textSecondary} hover:${theme.bgSecondary}`
                }`}
                onClick={() => switchToSession(session.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{session.title}</p>
                      {pendingRequests[session.id] && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 animate-pulse">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          Processing
                        </span>
                      )}
                    </div>
                    <p className="text-xs opacity-75 mt-1">
                      {session.messages.length} messages
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className={`${theme.bgPrimary} border-b ${theme.borderPrimary} p-4 transition-all duration-500 ease-in-out`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className={`lg:hidden p-2 ${theme.textTertiary} hover:${theme.textPrimary} transition-all duration-300 ease-in-out`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            <div>
                <h1 className={`text-xl font-bold ${theme.textPrimary} transition-all duration-500 ease-in-out`}>
                  {isAdvancedMode ? <><span>Investra </span><span className="inline-block px-2 py-0.5 rounded bg-zinc-900 text-green-400 font-semibold align-middle">Ultra</span></> : 'Investra'}
                </h1>
                <p className={`text-sm ${theme.textSecondary} transition-all duration-500 ease-in-out`}>
                  {isAdvancedMode 
                    ? <>Advanced AI with <span className="text-purple-400">Stock API</span> & <span className="text-blue-400">Web Search</span> capabilities</> 
                    : 'Your AI-powered financial assistant'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className={`text-xs ${theme.textSecondary} font-medium transition-all duration-500 ease-in-out`}>Mode:</span>
                <div className={`flex ${theme.bgTertiary} rounded-lg p-1 transition-all duration-500 ease-in-out`}>
                  <button
                    onClick={() => setRagMode('normal')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-500 ease-in-out ${
                      ragMode === 'normal'
                        ? 'bg-blue-600 text-white'
                        : `${theme.textSecondary} hover:${theme.textPrimary}`
                    }`}
                    title="Base mode - document search only"
                  >
                    Base
                  </button>
                  <button
                    onClick={() => setRagMode('advanced')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-500 ease-in-out ${
                      ragMode === 'advanced'
                        ? 'bg-zinc-900 text-green-400'
                        : 'text-gray-400'
                    }`}
                    title="Ultra mode - includes stock data and web search"
                  >
                    {ragMode === 'advanced' ? (
                      <span className="inline-block px-2 py-0.5 rounded bg-zinc-900 text-green-400 font-semibold">Ultra</span>
                    ) : (
                      <span>Ultra</span>
                    )}
                  </button>
                </div>
              </div>
              <div className={`flex items-center gap-2 text-sm ${theme.textSecondary} transition-all duration-500 ease-in-out`}>
                <div className={`w-2 h-2 ${isAdvancedMode ? 'bg-green-400' : 'bg-green-400'} rounded-full transition-all duration-500 ease-in-out`}></div>
              <span>Connected</span>
              </div>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className={`mx-auto w-16 h-16 ${theme.bgSecondary} rounded-full flex items-center justify-center mb-6 transition-all duration-500 ease-in-out`}>
                <span className={`${theme.textTertiary} font-bold text-xl transition-all duration-500 ease-in-out`}>B</span>
              </div>
              <h3 className={`text-xl font-medium ${theme.textPrimary} mb-3 transition-all duration-500 ease-in-out`}>
                Welcome to {isAdvancedMode ? <><span>Investra </span><span className="inline-block px-2 py-0.5 rounded bg-zinc-900 text-green-400 font-semibold align-middle">Ultra</span></> : 'Investra'}
              </h3>
              <p className={`${theme.textTertiary} mb-6 max-w-md mx-auto transition-all duration-500 ease-in-out`}>
                Start by asking a question about your documents. You can ask about stock investing, financial planning, or any related topics.
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className={`text-sm ${theme.textTertiary} transition-all duration-500 ease-in-out`}>Current Mode:</span>
                <span className={`px-3 py-1 text-sm font-medium rounded transition-all duration-500 ease-in-out ${
                  ragMode === 'normal' 
                    ? 'bg-blue-600 text-white' 
                    : ''
                }`}
                >
                  {ragMode === 'normal' ? 'Base' : <span className="inline-block px-2 py-0.5 rounded bg-zinc-900 text-green-400 font-semibold align-middle">Ultra</span>}
                </span>
              </div>
            </div>
          )}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {loading && (
            <div className={`flex gap-4 p-6 rounded-2xl ${theme.bgSecondary} border ${theme.borderSecondary} shadow animate-pulse max-w-4xl mx-auto transition-all duration-500 ease-in-out`}>
              <div className={`flex-shrink-0 w-10 h-10 rounded-full ${theme.bgTertiary} flex items-center justify-center transition-all duration-500 ease-in-out`}>
                <span className={`${theme.textTertiary} font-bold transition-all duration-500 ease-in-out`}>BOT</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-lg ${theme.textSecondary} transition-all duration-500 ease-in-out`}>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mb-4 p-4 bg-red-900 border border-red-700 rounded-lg">
            <div className="flex items-center gap-2 text-red-200">
              <span className="text-sm font-bold">ERROR</span>
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className={`${theme.bgPrimary} border-t ${theme.borderPrimary} p-6 transition-all duration-500 ease-in-out`}>
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                  placeholder="Ask a question about your documents..."
                disabled={loading}
                  className={`w-full resize-none ${theme.bgSecondary} border ${theme.borderSecondary} rounded-xl px-4 py-3 text-base ${theme.textPrimary} focus:outline-none focus:ring-2 transition-all duration-500 ease-in-out ${isAdvancedMode ? 'focus:ring-green-600' : 'focus:ring-blue-700'}`}
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
                className={`disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold ${theme.buttonPrimary} text-white transition-all duration-500 ease-in-out`}
            >
              Send
            </button>
          </div>
        </div>
        </div>

        {/* Footer */}
        <footer className={`${isAdvancedMode ? 'bg-black' : 'bg-gray-950'} border-t ${theme.borderPrimary} p-4 transition-all duration-500 ease-in-out`}>
          <div className="max-w-4xl mx-auto text-center text-sm text-gray-400 transition-all duration-500 ease-in-out">
            {ragMode === 'normal' ? (
              <>
                <span className="font-medium">Base Mode:</span> The <span className="font-semibold">Basics for Investing in Stocks</span> by the Editors of Kiplinger's Personal Finance has been pre-loaded. Ask questions about stock investing, financial planning, or related topics using only the document content.
                <a 
                  href="https://www.rld.nm.gov/wp-content/uploads/2021/06/IPT_Stocks_2012.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-200 underline ml-1"
                >
                  View the official document →
                </a>
              </>
            ) : (
              <>
                <span className="font-medium">Ultra Mode:</span> Enhanced with <span className="text-purple-400 font-semibold">real-time stock data</span> and <span className="text-blue-400 font-semibold">web search capabilities</span>. Ask about current stock prices, market trends, or any financial questions - the AI will search for the latest information when the document doesn't contain the answer.
            <a 
              href="https://www.rld.nm.gov/wp-content/uploads/2021/06/IPT_Stocks_2012.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-200 underline ml-1"
            >
              View the official document →
            </a>
              </>
            )}
            <div className="mt-3 text-xs text-gray-500">
              Built by Varun Pillai • 
              <a href="https://www.linkedin.com/in/varun-spillai/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-300 underline ml-1">LinkedIn</a> • 
              <a href="https://github.com/varun6531" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-300 underline ml-1">GitHub</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatInterface; 