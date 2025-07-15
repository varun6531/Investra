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
