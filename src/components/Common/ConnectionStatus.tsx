import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useConnectionStatus } from '../../context/SocketContext';
import { useApp } from '../../context/AppContext';

export default function ConnectionStatus() {
  const { status, connectionError } = useConnectionStatus();
  const { userPreferences } = useApp();

  if (status === 'connected') {
    return null; // Don't show anything when connected
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'connecting':
        return {
          icon: Wifi,
          text: 'Connecting...',
          bgColor: userPreferences.theme.isDark ? 'bg-yellow-900' : 'bg-yellow-50',
          textColor: userPreferences.theme.isDark ? 'text-yellow-200' : 'text-yellow-800',
          iconColor: 'text-yellow-500',
        };
      case 'error':
        return {
          icon: WifiOff,
          text: connectionError || 'Connection failed',
          bgColor: userPreferences.theme.isDark ? 'bg-red-900' : 'bg-red-50',
          textColor: userPreferences.theme.isDark ? 'text-red-200' : 'text-red-800',
          iconColor: 'text-red-500',
        };
      default:
        return {
          icon: AlertCircle,
          text: 'Unknown connection status',
          bgColor: userPreferences.theme.isDark ? 'bg-gray-800' : 'bg-gray-50',
          textColor: userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700',
          iconColor: 'text-gray-500',
        };
    }
  };

  const { icon: Icon, text, bgColor, textColor, iconColor } = getStatusConfig();

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${bgColor} border-b ${
      userPreferences.theme.isDark ? 'border-gray-700' : 'border-gray-200'
    } transition-colors duration-200`}>
      <div className="flex items-center justify-center space-x-2 py-2 px-4">
        <Icon size={16} className={iconColor} />
        <span className={`text-sm font-medium ${textColor}`}>
          {text}
        </span>
        {status === 'connecting' && (
          <div className="flex space-x-1">
            <div className={`w-1 h-1 ${iconColor.replace('text-', 'bg-')} rounded-full animate-pulse`}></div>
            <div className={`w-1 h-1 ${iconColor.replace('text-', 'bg-')} rounded-full animate-pulse`} style={{ animationDelay: '0.2s' }}></div>
            <div className={`w-1 h-1 ${iconColor.replace('text-', 'bg-')} rounded-full animate-pulse`} style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
      </div>
    </div>
  );
}