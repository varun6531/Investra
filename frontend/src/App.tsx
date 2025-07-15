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
