/*
SessionList.tsx

What is this file for: Mobile session list component that displays chat history and allows users to switch between different conversations with swipe and touch interactions.

What the flow of the functions are: Component renders a ScrollView of session items with pending indicators, onSessionSelect() switches to selected conversation, onSessionDelete() removes sessions with confirmation, and onNewChat() creates fresh conversations.

How this service is used: Displayed as an overlay in the mobile chat interface to provide session management functionality, allowing users to navigate between multiple chat conversations and maintain conversation history.
*/

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import type { ChatSession } from '../types';

interface SessionListProps {
  sessions: ChatSession[];
  currentSessionId: string;
  pendingRequests: {[sessionId: string]: boolean};
  onSessionSelect: (sessionId: string) => void;
  onSessionDelete: (sessionId: string) => void;
  onNewChat: () => void;
  canCreateNewChat: boolean;
  ragMode: 'normal' | 'advanced';
  onClose: () => void;
}

const SessionList: React.FC<SessionListProps> = ({
  sessions,
  currentSessionId,
  pendingRequests,
  onSessionSelect,
  onSessionDelete,
  onNewChat,
  canCreateNewChat,
  ragMode,
  onClose,
}) => {
  const isAdvancedMode = ragMode === 'advanced';

  return (
    <View style={[styles.container, isAdvancedMode ? styles.containerUltra : styles.containerBase]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Chat History</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[
            styles.newChatButton,
            !canCreateNewChat && styles.newChatButtonDisabled
          ]}
          onPress={onNewChat}
          disabled={!canCreateNewChat}
        >
          <Text style={[
            styles.newChatText,
            canCreateNewChat ? styles.newChatTextEnabled : styles.newChatTextDisabled
          ]}>
            + New Chat
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.sessionsList}>
        {!currentSessionId && (
          <TouchableOpacity
            style={[styles.newChatIndicator, isAdvancedMode ? styles.newChatIndicatorUltra : styles.newChatIndicatorBase]}
            onPress={onNewChat}
          >
            <Text style={styles.newChatIndicatorTitle}>New Chat</Text>
            <Text style={styles.newChatIndicatorSubtitle}>Start typing to create a new conversation</Text>
          </TouchableOpacity>
        )}

        {sessions.map((session) => (
          <TouchableOpacity
            key={session.id}
            style={[
              styles.sessionItem,
              session.id === currentSessionId && (isAdvancedMode ? styles.activeSessionUltra : styles.activeSessionBase)
            ]}
            onPress={() => onSessionSelect(session.id)}
          >
            <View style={styles.sessionContent}>
              <View style={styles.sessionHeader}>
                <Text style={[
                  styles.sessionTitle,
                  session.id === currentSessionId && styles.activeSessionTitle
                ]}>
                  {session.title}
                </Text>
                {pendingRequests[session.id] && (
                  <View style={styles.processingIndicator}>
                    <ActivityIndicator size="small" color="#f59e0b" />
                    <Text style={styles.processingText}>Processing</Text>
                  </View>
                )}
              </View>
              <Text style={styles.sessionMessageCount}>
                {session.messages.length} messages
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onSessionDelete(session.id)}
            >
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  containerBase: {
    backgroundColor: '#111827',
    borderRightWidth: 1,
    borderRightColor: '#374151',
  },
  containerUltra: {
    backgroundColor: '#000000',
    borderRightWidth: 1,
    borderRightColor: '#10b981',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#9ca3af',
    fontWeight: 'bold',
  },
  newChatButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  newChatText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  newChatTextEnabled: {
    color: '#ffffff',
  },
  newChatTextDisabled: {
    color: '#6b7280',
  },
  newChatButtonDisabled: {
    backgroundColor: '#4b5563',
  },
  sessionsList: {
    flex: 1,
    padding: 16,
  },
  newChatIndicator: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  newChatIndicatorBase: {
    backgroundColor: '#3b82f6',
  },
  newChatIndicatorUltra: {
    backgroundColor: '#10b981',
  },
  newChatIndicatorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  newChatIndicatorSubtitle: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  activeSessionBase: {
    backgroundColor: '#3b82f6',
  },
  activeSessionUltra: {
    backgroundColor: '#10b981',
  },
  sessionContent: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
    flex: 1,
  },
  activeSessionTitle: {
    color: '#ffffff',
  },
  processingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  processingText: {
    fontSize: 10,
    color: '#f59e0b',
    fontWeight: '600',
  },
  sessionMessageCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 18,
    color: '#ef4444',
    fontWeight: 'bold',
  },
});

export default SessionList; 