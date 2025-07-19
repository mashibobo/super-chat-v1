import React from 'react';
import { MessageCircle, Users, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const { userPreferences } = useApp();
  
  const tabs = [
    { id: 'confessions', label: 'Confessions', icon: Heart },
    { id: 'rooms', label: 'Rooms', icon: Users },
    { id: 'private', label: 'Private', icon: MessageCircle },
  ];

  return (
    <nav className={`${
      userPreferences.theme.isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border-t px-4 py-2 transition-colors duration-200`}>
      <div className="flex justify-around">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
              activeTab === id
                ? 'text-blue-600 bg-blue-50'
                : userPreferences.theme.isDark
                ? 'text-gray-400 hover:text-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon size={20} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}