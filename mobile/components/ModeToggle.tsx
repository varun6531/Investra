/*
ModeToggle.tsx

What is this file for: Mobile toggle component that allows users to switch between Base and Ultra modes with visual feedback and touch interactions.

What the flow of the functions are: Component renders two TouchableOpacity buttons for mode selection, applies conditional styling based on ragMode prop, and calls setRagMode() callback when user taps to change modes.

How this service is used: Displayed in the mobile chat interface header to provide easy mode switching between document-only RAG (Base) and enhanced RAG with stock data and web search (Ultra) modes.
*/

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface ModeToggleProps {
  ragMode: 'normal' | 'advanced';
  setRagMode: (mode: 'normal' | 'advanced') => void;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ ragMode, setRagMode }) => {
  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            ragMode === 'normal' && styles.activeButton
          ]}
          onPress={() => setRagMode('normal')}
        >
          <Text style={[
            styles.toggleText,
            ragMode === 'normal' && styles.activeText
          ]}>
            Base
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.toggleButton,
            ragMode === 'advanced' && styles.activeButtonUltra
          ]}
          onPress={() => setRagMode('advanced')}
        >
          <Text style={[
            styles.toggleText,
            ragMode === 'advanced' && styles.activeTextUltra
          ]}>
            Ultra
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#4b5563',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeButton: {
    backgroundColor: '#3b82f6',
  },
  activeButtonUltra: {
    backgroundColor: '#1f2937',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
  },
  activeText: {
    color: '#ffffff',
  },
  activeTextUltra: {
    color: '#10b981',
  },
  ultraBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10b981',
    backgroundColor: '#1f2937',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
});

export default ModeToggle; 