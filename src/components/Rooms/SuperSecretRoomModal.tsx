import React, { useState } from 'react';
import { X, Shield, Plus, Key } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SuperSecretRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuperSecretRoomModal({ isOpen, onClose }: SuperSecretRoomModalProps) {
  const { joinSuperSecretRoom, userPreferences } = useApp();
  const [mode, setMode] = useState<'join' | 'create'>('join');
  const [formData, setFormData] = useState({
    roomId: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roomId.trim() || !formData.password.trim()) return;

    setIsLoading(true);
    setError('');
    
    const success = joinSuperSecretRoom(formData.roomId.trim().toUpperCase(), formData.password.trim());
    
    if (success) {
      onClose();
      setFormData({ roomId: '', password: '' });
    } else {
      setError('Invalid room ID or password. Please check and try again.');
    }
    
    setIsLoading(false);
  };

  const handleCreateRedirect = () => {
    onClose();
    // This would trigger the create room modal with super secret pre-selected
    // For now, we'll just close this modal
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${
        userPreferences.theme.isDark ? 'bg-gray-800' : 'bg-white'
      } rounded-lg p-6 w-full max-w-md transition-colors duration-200`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold flex items-center space-x-2 ${
            userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'
          }`}>
            <Shield className="text-purple-500" size={24} />
            <span>Super Secret Room</span>
          </h2>
          <button
            onClick={onClose}
            className={`${userPreferences.theme.isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Mode Selection */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setMode('join')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
              mode === 'join'
                ? 'bg-purple-600 text-white'
                : userPreferences.theme.isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Join Room
          </button>
          <button
            onClick={() => setMode('create')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
              mode === 'create'
                ? 'bg-purple-600 text-white'
                : userPreferences.theme.isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Create Room
          </button>
        </div>

        {mode === 'join' ? (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Room ID *
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
                placeholder="Enter 6-8 character room ID"
                required
                maxLength={8}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${
                userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Room Password *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 ${
                  userPreferences.theme.isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter room password"
                required
              />
            </div>

            {error && (
              <div className={`p-3 rounded-lg ${
                userPreferences.theme.isDark ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-800'
              }`}>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className={`p-3 rounded-lg ${
              userPreferences.theme.isDark ? 'bg-purple-900 text-purple-200' : 'bg-purple-50 text-purple-800'
            }`}>
              <p className="text-sm">
                🔒 Super Secret Rooms are completely hidden from public view. Only members can see and access them.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.roomId.trim() || !formData.password.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Key size={20} />
              <span>{isLoading ? 'Joining...' : 'Join Super Secret Room'}</span>
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-2 border-dashed ${
              userPreferences.theme.isDark ? 'border-gray-600' : 'border-gray-300'
            }`}>
              <div className="text-center">
                <Plus size={48} className={`mx-auto mb-4 ${
                  userPreferences.theme.isDark ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <h3 className={`font-medium mb-2 ${
                  userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Create Super Secret Room
                </h3>
                <p className={`text-sm mb-4 ${
                  userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Create a completely hidden room that only you and invited members can access.
                </p>
                <div className="space-y-2 text-sm">
                  <div className={`flex items-center justify-between ${
                    userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <span>Cost:</span>
                    <span className="font-medium">150 credits</span>
                  </div>
                  <div className={`flex items-center justify-between ${
                    userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <span>Visibility:</span>
                    <span className="font-medium">Completely Hidden</span>
                  </div>
                  <div className={`flex items-center justify-between ${
                    userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <span>Access:</span>
                    <span className="font-medium">Room ID + Password</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateRedirect}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Plus size={20} />
              <span>Create Super Secret Room</span>
            </button>

            <div className={`p-3 rounded-lg ${
              userPreferences.theme.isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-50 text-yellow-800'
            }`}>
              <p className="text-sm">
                💡 Tip: Share the Room ID and password only with people you trust. These rooms are completely invisible to everyone else.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}