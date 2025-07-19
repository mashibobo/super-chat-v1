import React from 'react';
import { X, UserPlus, Flag, MessageCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface UserActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  userId: string;
}

export default function UserActionModal({ isOpen, onClose, username, userId }: UserActionModalProps) {
  const { currentUser, sendFriendRequest, userPreferences } = useApp();

  if (!isOpen || !currentUser || userId === currentUser.id) return null;

  const handleSendFriendRequest = () => {
    sendFriendRequest(userId);
    onClose();
  };

  const handleReport = () => {
    // Mock report functionality
    alert(`Reported user: ${username}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${
        userPreferences.theme.isDark ? 'bg-gray-800' : 'bg-white'
      } rounded-lg p-6 w-full max-w-sm transition-colors duration-200`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-lg font-bold ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
            {username}
          </h2>
          <button
            onClick={onClose}
            className={`${userPreferences.theme.isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleSendFriendRequest}
            className="w-full flex items-center space-x-3 p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
          >
            <UserPlus size={20} />
            <span>Send Friend Request</span>
          </button>

          <button
            className="w-full flex items-center space-x-3 p-3 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
          >
            <MessageCircle size={20} />
            <span>Send Message</span>
          </button>

          <button
            onClick={handleReport}
            className="w-full flex items-center space-x-3 p-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
          >
            <Flag size={20} />
            <span>Report User</span>
          </button>
        </div>
      </div>
    </div>
  );
}