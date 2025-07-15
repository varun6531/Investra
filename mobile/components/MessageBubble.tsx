import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  ragMode: 'normal' | 'advanced';
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, ragMode }) => {
  const isUser = message.sender === 'user';
  const isAdvancedMode = ragMode === 'advanced';

  const renderServiceIndicators = () => {
    if (message.sender !== 'bot' || !message.services_used) return null;

    return (
      <View style={styles.serviceIndicators}>
        {message.services_used.rag_used && (
          <View style={styles.serviceBadge}>
            <Text style={styles.serviceBadgeText}>RAG</Text>
          </View>
        )}
        {message.services_used.stock_api_used && (
          <View style={[styles.serviceBadge, styles.stockBadge]}>
            <Text style={styles.serviceBadgeText}>Stock</Text>
          </View>
        )}
        {message.services_used.web_search_used && (
          <View style={[styles.serviceBadge, styles.webSearchBadge]}>
            <Text style={styles.serviceBadgeText}>Web</Text>
          </View>
        )}
      </View>
    );
  };

  const renderAnswerWithCitations = (text: string) => {
    if (!message.sources || message.sender !== 'bot') {
      return <Text style={styles.messageText}>{text}</Text>;
    }

    let processedText = text;
    let citedSourceIds = new Set<number>();


    if (message.stock_tickers && message.stock_tickers.length > 0) {
      message.stock_tickers.forEach(ticker => {
        const tickerPattern = new RegExp(`\\b${ticker}\\b`, 'gi');
        processedText = processedText.replace(tickerPattern, `[STOCK${ticker}]`);
      });
    }


    const pagePattern = /\b(?:page|Page)\s*[-]?\s*(\d+)\b/gi; // Page 1, page 1, Page-1, page-1...
    processedText = processedText.replace(pagePattern, (match, pageNum) => {
      const source = message.sources!.find(s => s.page === pageNum);
      if (source) {
        citedSourceIds.add(source.id);
        return `[DOC${source.id}]`;
      }
      return match;
    });

    const parts = processedText.split(/(\[DOC\d+\]|\[STOCK[A-Z]+\])/g);
    
    return (
      <View>
        <Text style={styles.messageText}>
          {parts.map((part, i) => {
            const docMatch = part.match(/^\[DOC(\d+)\]$/);
            if (docMatch) {
              const citationId = parseInt(docMatch[1], 10);
              const source = message.sources!.find(s => s.id === citationId);
              if (source) {
                return (
                  <Text
                    key={i}
                    style={styles.citationLink}
                    onPress={() => Linking.openURL(`https://www.rld.nm.gov/wp-content/uploads/2021/06/IPT_Stocks_2012.pdf#page=${source.page}`)}
                  >
                    [{citationId}]
                  </Text>
                );
              }
            }
            
            const stockMatch = part.match(/^\[STOCK([A-Z]+)\]$/); // [AAPL], [GOOGL], etc.
            if (stockMatch) {
              const ticker = stockMatch[1];
              return (
                <Text 
                  key={i} 
                  style={styles.stockLink}
                  onPress={() => Linking.openURL(`https://finance.yahoo.com/quote/${ticker}`)}
                >
                  {ticker}
                </Text>
              );
            }
            
            return part;
          })}
        </Text>
        
        {/* Citations */}
        {citedSourceIds.size > 0 && (
          <View style={styles.citationsContainer}>
            {message.sources!
              .filter(source => citedSourceIds.has(source.id))
              .map((source) => (
                <View key={source.id} style={styles.citationItem}>
                  <Text 
                    style={styles.citationNumber}
                    onPress={() => Linking.openURL(`https://www.rld.nm.gov/wp-content/uploads/2021/06/IPT_Stocks_2012.pdf#page=${source.page}`)}
                  >
                    [{source.id}]
                  </Text>
                  <Text 
                    style={styles.citationText}
                    onPress={() => Linking.openURL(`https://www.rld.nm.gov/wp-content/uploads/2021/06/IPT_Stocks_2012.pdf#page=${source.page}`)}
                  >
                    {source.citation_text.replace(`[${source.id}]`, '')}
                  </Text>
                </View>
              ))}
          </View>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    const footers = [];

    if (message.web_search_query) {
      footers.push(
        <View key="web-search" style={styles.footerItem}>
          <Text style={styles.footerLabel}>🔍 Searched:</Text>
          <Text 
            style={styles.footerLink}
            onPress={() => Linking.openURL(`https://www.google.com/search?q=${encodeURIComponent(message.web_search_query!)}`)}
          >
            {message.web_search_query}
          </Text>
        </View>
      );
    }

    if (message.stock_tickers && message.stock_tickers.length > 0) {
      footers.push(
        <View key="stock-tickers" style={styles.footerItem}>
          <Text style={styles.footerLabel}>📈 Stock Data:</Text>
                      {message.stock_tickers.map((ticker, index) => (
              <Text 
                key={ticker}
                style={styles.stockFooterLink}
                onPress={() => Linking.openURL(`https://finance.yahoo.com/quote/${ticker}`)}
              >
                {ticker}{index < message.stock_tickers!.length - 1 ? ' ' : ''}
              </Text>
            ))}
        </View>
      );
    }

    return footers.length > 0 ? (
      <View style={styles.footerContainer}>
        {footers}
      </View>
    ) : null;
  };

  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.botContainer,
      isUser 
        ? (isAdvancedMode ? styles.userContainerUltra : styles.userContainerBase)
        : (isAdvancedMode ? styles.botContainerUltra : styles.botContainerBase)
    ]}>
      <View style={[
        styles.avatar,
        isUser 
          ? (isAdvancedMode ? styles.userAvatarUltra : styles.userAvatarBase)
          : styles.botAvatar
      ]}>
        <Text style={styles.avatarText}>
          {isUser ? 'USER' : 'BOT'}
        </Text>
      </View>
      
      <View style={styles.content}>
        {renderServiceIndicators()}
        {renderAnswerWithCitations(message.text)}
        {renderFooter()}
        
        {message.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorLabel}>ERROR</Text>
            <Text style={styles.errorText}>Error occurred</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  userContainer: {
    flexDirection: 'row-reverse',
  },
  userContainerBase: {
    backgroundColor: '#3b82f6',
  },
  userContainerUltra: {
    backgroundColor: '#10b981',
  },
  botContainer: {
    flexDirection: 'row',
  },
  botContainerBase: {
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  botContainerUltra: {
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  userAvatarBase: {
    backgroundColor: '#2563eb',
  },
  userAvatarUltra: {
    backgroundColor: '#059669',
  },
  botAvatar: {
    backgroundColor: '#4b5563',
  },
  avatarText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  serviceIndicators: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  serviceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#10b981',
  },
  stockBadge: {
    backgroundColor: '#a78bfa',
  },
  webSearchBadge: {
    backgroundColor: '#60a5fa',
  },
  serviceBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#ffffff',
  },
  citationLink: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  stockLink: {
    color: '#a78bfa',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  citationsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#4b5563',
  },
  citationItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  citationNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10b981',
    marginRight: 8,
  },
  citationText: {
    fontSize: 12,
    color: '#10b981',
    flex: 1,
  },
  footerContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#4b5563',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  footerLabel: {
    fontSize: 12,
    color: '#60a5fa',
    fontWeight: '600',
    marginRight: 4,
  },
  footerLink: {
    fontSize: 12,
    color: '#60a5fa',
    textDecorationLine: 'underline',
  },
  stockFooterLink: {
    fontSize: 12,
    color: '#a78bfa',
    textDecorationLine: 'underline',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  errorLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  errorText: {
    fontSize: 10,
    color: '#ef4444',
  },
});

export default MessageBubble; 