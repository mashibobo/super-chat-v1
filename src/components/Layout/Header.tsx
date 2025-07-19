import React from 'react';
import { Coins, Settings, User, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  onProfileClick: () => void;
  onSettingsClick: () => void;
}

export default function Header({ onProfileClick, onSettingsClick }: HeaderProps) {
  const { currentUser, userPreferences, updateCredits, notifications } = useApp();
  
  const earnCredits = () => {
    // Mock earning credits (ads)
    updateCredits(25);
  };

  const unreadNotifications = notifications.filter(n => !n.isRead && n.userId === currentUser?.id);

  if (!currentUser) return null;

  return (
    <header className={`${
      userPreferences.theme.isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border-b px-4 py-3 flex items-center justify-between transition-colors duration-200`}>
      <div className="flex items-center space-x-3">
        <h1 className={`text-xl font-bold ${
          userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'
        }`}>
          AnonChat
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <button
          onClick={earnCredits}
          className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105"
        >
          <Coins size={16} />
          <span>{currentUser.credits}</span>
        </button>
        
        <button
          onClick={onProfileClick}
          className={`relative p-2 rounded-full transition-colors duration-200 ${
            userPreferences.theme.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        >
          <User 
            size={20} 
            className={`${
              userPreferences.theme.isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            } transition-colors duration-200`}
          />
          {unreadNotifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
            </span>
          )}
        </button>
        
        <button
          onClick={onSettingsClick}
          className={`p-2 rounded-full transition-colors duration-200 ${
            userPreferences.theme.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        >
          <Settings 
            size={20} 
            className={`${
              userPreferences.theme.isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            } cursor-pointer transition-colors duration-200`}
          />
        </button>
      </div>
    </header>
  );
}