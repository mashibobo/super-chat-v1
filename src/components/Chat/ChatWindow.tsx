import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Smile, Image, MoreVertical, Check, CheckCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';

interface ChatWindowProps {
  user: User;
  onBack: () => void;
}

export default function ChatWindow({ user, onBack }: ChatWindowProps) {
  const { currentUser, messages, sendMessage, userPreferences } = useApp();
  const [message, setMessage] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMessages = messages.filter(
    msg => 
      (msg.senderId === user.id && msg.receiverId === currentUser?.id) ||
      (msg.senderId === currentUser?.id && msg.receiverId === user.id)
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentUser) return;
    
    if (currentUser.credits < 1) {
      alert('You need at least 1 credit to send a message!');
      return;
    }
    
    sendMessage(user.id, message.trim());
    setMessage('');
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`h-full flex flex-col ${userPreferences.theme.isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      {/* Header */}
      <div className={`${userPreferences.theme.isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4 flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className={`p-1 rounded-full ${userPreferences.theme.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-200`}
          >
            <ArrowLeft size={20} className={userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-600'} />
          </button>
          <div className="relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              user.credits >= 200 ? 'bg-gradient-to-r from-orange-400 to-red-500' :
              user.credits >= 100 ? 'bg-gradient-to-r from-blue-400 to-purple-500' :
              'bg-gradient-to-r from-green-400 to-blue-500'
            } text-white font-bold`}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            {user.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <h3 className={`font-medium ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
              {user.username}
            </h3>
            <p className={`text-sm ${userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {user.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className={`p-2 rounded-full ${userPreferences.theme.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-200`}
        >
          <MoreVertical size={20} className={userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-600'} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="text-center py-8">
            <p className={`${userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Start your conversation with {user.username}
            </p>
          </div>
        ) : (
          chatMessages.map((msg, index) => {
            const isOwn = msg.senderId === currentUser?.id;
            const showTime = index === 0 || 
              new Date(chatMessages[index - 1].timestamp).getTime() - new Date(msg.timestamp).getTime() > 300000;
            
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  isOwn 
                    ? 'bg-blue-600 text-white' 
                    : userPreferences.theme.isDark 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-white text-gray-900 border border-gray-200'
                } shadow-sm`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    isOwn 
                      ? 'text-blue-100' 
                      : userPreferences.theme.isDark 
                      ? 'text-gray-400' 
                      : 'text-gray-500'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className={`${userPreferences.theme.isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t p-4`}>
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={currentUser?.credits ? `Type a message... (${currentUser.credits} credits)` : 'No credits available'}
              disabled={!currentUser?.credits}
              className={`w-full px-4 py-2 rounded-full border ${
                userPreferences.theme.isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <button type="button">
                <Smile size={18} className={userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'} />
              </button>
              <button type="button">
                <Image size={18} className={userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'} />
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={!message.trim() || !currentUser?.credits}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-full transition-colors duration-200"
          >
            <Send size={20} />
          </button>
        </form>
        {!currentUser?.credits && (
          <p className="text-red-500 text-sm mt-2 text-center">
            You need credits to send messages. Tap the credit counter to earn more!
          </p>
        )}
      </div>
    </div>
  );
}