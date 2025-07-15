/*
App.tsx

What is this file for: Main React application component that renders the chat interface and manages the mode comparison modal.

What the flow of the functions are: useEffect() checks localStorage for modal display preference, handleCloseModal() hides modal and saves preference, and the component renders ChatInterface with optional ModeComparisonModal overlay.

How this service is used: Entry point for the web application that provides the main chat interface and onboarding experience for new users.
*/

import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import ModeComparisonModal from './components/ModeComparisonModal';

function App() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const hasSeenModal = localStorage.getItem('investraModalSeen');
    if (!hasSeenModal) {
      setShowModal(true);
    }
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    localStorage.setItem('investraModalSeen', 'true');
  };

  return (
    <div className="App">
      <ChatInterface />
      <ModeComparisonModal isOpen={showModal} onClose={handleCloseModal} />
    </div>
  );
}

export default App;
