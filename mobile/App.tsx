/*
App.tsx

What is this file for: Main React Native application component that renders the mobile chat interface and manages the mode comparison modal.

What the flow of the functions are: checkModalStatus() checks AsyncStorage for modal display preference, handleCloseModal() hides modal and saves preference, and the component renders ChatInterface with optional ModeComparisonModal overlay.

How this service is used: Entry point for the mobile application that provides the same chat experience as the web version with native mobile optimizations and AsyncStorage for persistence.
*/

import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatInterface from './components/ChatInterface';
import ModeComparisonModal from './components/ModeComparisonModal';

export default function App() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const checkModalStatus = async () => {
      try {
        const hasSeenModal = await AsyncStorage.getItem('investraModalSeen');
        if (!hasSeenModal) {
          setShowModal(true);
        }
      } catch (error) {
        console.error('Error checking modal status:', error);
        setShowModal(true);
      }
    };

    checkModalStatus();
  }, []);

  const handleCloseModal = async () => {
    setShowModal(false);
    try {
      await AsyncStorage.setItem('investraModalSeen', 'true');
    } catch (error) {
      console.error('Error saving modal status:', error);
    }
  };

  return (
    <>
      <StatusBar style="light" />
      <ChatInterface />
      <ModeComparisonModal isOpen={showModal} onClose={handleCloseModal} />
    </>
  );
}
