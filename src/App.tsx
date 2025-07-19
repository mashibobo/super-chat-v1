import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SocketProvider } from './context/SocketContext';
import Header from './components/Layout/Header';
import BottomNavigation from './components/Layout/BottomNavigation';
import PrivateChat from './components/Chat/PrivateChat';
import ChatRooms from './components/Rooms/ChatRooms';
import Confessions from './components/Confessions/Confessions';
import Profile from './components/Profile/Profile';
import AuthModal from './components/Auth/AuthModal';
import SettingsModal from './components/Profile/SettingsModal';
import ConnectionStatus from './components/Common/ConnectionStatus';
import { useRealTimeMessages } from './hooks/useRealTimeMessages';

function AppContent() {
  const { currentUser, userPreferences } = useApp();
  const [activeTab, setActiveTab] = useState('confessions');
  const [showAuth, setShowAuth] = useState(!currentUser);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Initialize real-time messaging
  useRealTimeMessages();

  if (!currentUser) {
    return <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />;
  }

  const renderActiveTab = () => {
    if (showProfile) {
      return <Profile />;
    }
    
    switch (activeTab) {
      case 'private':
        return <PrivateChat />;
      case 'rooms':
        return <ChatRooms />;
      case 'confessions':
        return <Confessions />;
      default:
        return <PrivateChat />;
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setShowProfile(false);
  };

  return (
    <div className={`h-screen flex flex-col ${
      userPreferences.theme.isDark ? 'bg-gray-900' : 'bg-gray-50'
    } transition-colors duration-200`}>
      <ConnectionStatus />
      <Header 
        onProfileClick={() => setShowProfile(!showProfile)}
        onSettingsClick={() => setShowSettings(true)}
      />
      <main className="flex-1 overflow-hidden">
        {renderActiveTab()}
      </main>
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      
      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AppProvider>
  );
}

export default App;