import React, { useState } from 'react';
import { X, Lock, Globe, Shield, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RoomCategory } from '../../types';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
  const { currentUser, createRoom, userPreferences } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general' as RoomCategory,
    isPrivate: false,
    isSuperSecret: false,
    password: '',
    roomId: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !currentUser) return null;

  let cost = 50; // Public room
  if (formData.isPrivate && !formData.isSuperSecret) cost = 25; // Private room
  if (formData.isSuperSecret) cost = 150; // Super secret room
  
  const canAfford = currentUser.credits >= cost;

  const categories: { id: RoomCategory; label: string; emoji: string }[] = [
    { id: 'general', label: 'General', emoji: '💬' },
    { id: 'gaming', label: 'Gaming', emoji: '🎮' },
    { id: 'study', label: 'Study', emoji: '📚' },
    { id: 'work', label: 'Work', emoji: '💼' },
    { id: 'entertainment', label: 'Entertainment', emoji: '🎉' },
    { id: 'support', label: 'Support', emoji: '🤝' },
    { id: 'other', label: 'Other', emoji: '🤔' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAfford || !formData.name.trim()) return;

    setIsLoading(true);
    
    const success = createRoom(
      formData.name.trim(),
      formData.category,
      formData.isPrivate,
      formData.isSuperSecret,
      (formData.isPrivate || formData.isSuperSecret) ? formData.password : undefined,
      formData.isSuperSecret && formData.roomId ? formData.roomId : undefined
    );
    
    if (success) {
      onClose();
      setFormData({ 
        name: '', 
        description: '', 
        category: 'general', 
        isPrivate: false, 
        isSuperSecret: false, 
        password: '', 
        roomId: '' 
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${
        userPreferences.theme.isDark ? 'bg-gray-800' : 'bg-white'
      } rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto transition-colors duration-200`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
            Create Chat Room
          </h2>
          <button
            onClick={onClose}
            className={`${userPreferences.theme.isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Room Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                userPreferences.theme.isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Enter room name"
              required
              maxLength={50}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(({ id, label, emoji }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: id })}
                  className={`flex items-center space-x-2 p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                    formData.category === id
                      ? 'border-blue-500 bg-blue-50'
                      : userPreferences.theme.isDark
                      ? 'border-gray-600 hover:border-gray-500 bg-gray-700'
                      : 'border-gray-300 hover:border-gray-400 bg-white'
                  }`}
                >
                  <span className="text-lg">{emoji}</span>
                  <span className={`text-sm font-medium ${
                    userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                userPreferences.theme.isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Describe your room (optional)"
              rows={3}
              maxLength={200}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Room Type
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isPrivate: false, isSuperSecret: false, password: '', roomId: '' })}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                  !formData.isPrivate && !formData.isSuperSecret
                    ? 'border-blue-500 bg-blue-50'
                    : userPreferences.theme.isDark
                    ? 'border-gray-600 hover:border-gray-500'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Globe size={20} className="text-green-500" />
                  <div>
                    <h3 className={`font-medium ${
                      userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Public Room (50 credits)
                    </h3>
                    <p className={`text-sm ${
                      userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Anyone can find and join
                    </p>
                  </div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isPrivate: true, isSuperSecret: false, roomId: '' })}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                  formData.isPrivate && !formData.isSuperSecret
                    ? 'border-blue-500 bg-blue-50'
                    : userPreferences.theme.isDark
                    ? 'border-gray-600 hover:border-gray-500'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Lock size={20} className="text-yellow-500" />
                  <div>
                    <h3 className={`font-medium ${
                      userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Private Room (25 credits)
                    </h3>
                    <p className={`text-sm ${
                      userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Invite only with password
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, isPrivate: true, isSuperSecret: true })}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                  formData.isSuperSecret
                    ? 'border-purple-500 bg-purple-50'
                    : userPreferences.theme.isDark
                    ? 'border-gray-600 hover:border-gray-500'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Shield size={20} className="text-purple-500" />
                  <div>
                    <h3 className={`font-medium ${
                      userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Super Secret Room (150 credits)
                    </h3>
                    <p className={`text-sm ${
                      userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Hidden from public, requires room ID
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {formData.isSuperSecret && (
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Custom Room ID (optional)
              </label>
              <input
                type="text"
                value={formData.roomId}
                onChange={(e) => setFormData({ ...formData, roomId: e.target.value.toUpperCase() })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 ${
                  userPreferences.theme.isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Leave empty for auto-generated ID"
                maxLength={8}
              />
            </div>
          )}

          {(formData.isPrivate || formData.isSuperSecret) && (
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Room Password
              </label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  userPreferences.theme.isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Set a password for your room"
                required
                maxLength={20}
              />
            </div>
          )}

          {!canAfford && (
            <div className={`p-3 rounded-lg flex items-center space-x-2 ${
              userPreferences.theme.isDark ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-800'
            }`}>
              <AlertCircle size={20} />
              <p className="text-sm">
                You need {cost} credits to create this room. You have {currentUser.credits} credits.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !canAfford || !formData.name.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {isLoading ? 'Creating...' : `Create Room (${cost} credits)`}
          </button>
        </form>
      </div>
    </div>
  );
}