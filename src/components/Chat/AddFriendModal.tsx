import React, { useState } from 'react';
import { X, UserPlus, Users, Search, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddFriendModal({ isOpen, onClose }: AddFriendModalProps) {
  const { currentUser, friendRequests, addFriendByUsername, acceptFriendRequest, declineFriendRequest, userPreferences } = useApp();
  const [activeTab, setActiveTab] = useState<'add' | 'requests'>('add');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  if (!isOpen || !currentUser) return null;

  const pendingRequests = friendRequests.filter(req => 
    req.receiverId === currentUser.id && req.status === 'pending'
  );

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    const success = addFriendByUsername(username.trim());
    if (success) {
      setMessage('Friend request sent successfully!');
      setMessageType('success');
      setUsername('');
    } else {
      setMessage('User not found or request already sent');
      setMessageType('error');
    }

    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${
        userPreferences.theme.isDark ? 'bg-gray-800' : 'bg-white'
      } rounded-lg p-6 w-full max-w-md transition-colors duration-200`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
            Friends
          </h2>
          <button
            onClick={onClose}
            className={`${userPreferences.theme.isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'add'
                ? 'bg-blue-600 text-white'
                : userPreferences.theme.isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Add Friend
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 relative ${
              activeTab === 'requests'
                ? 'bg-blue-600 text-white'
                : userPreferences.theme.isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Requests
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'add' ? (
          <div className="space-y-4">
            <form onSubmit={handleAddFriend} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Username
                </label>
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} size={20} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                      userPreferences.theme.isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter username to add as friend"
                    required
                  />
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded-lg flex items-center space-x-2 ${
                  messageType === 'success'
                    ? userPreferences.theme.isDark ? 'bg-green-900 text-green-200' : 'bg-green-50 text-green-800'
                    : userPreferences.theme.isDark ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-800'
                }`}>
                  {messageType === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                  <p className="text-sm">{message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!username.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <UserPlus size={20} />
                <span>Send Friend Request</span>
              </button>
            </form>

            <div className={`p-3 rounded-lg ${
              userPreferences.theme.isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-800'
            }`}>
              <p className="text-sm">
                💡 Tip: You can also send friend requests by clicking on usernames in confessions or chat rooms!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8">
                <Users size={48} className={`mx-auto mb-4 ${userPreferences.theme.isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`${userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No pending friend requests
                </p>
              </div>
            ) : (
              pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className={`p-3 rounded-lg border ${
                    userPreferences.theme.isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
                  } transition-colors duration-200`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-medium ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
                        {request.senderUsername}
                      </h3>
                      <p className={`text-sm ${userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Wants to be friends
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => acceptFriendRequest(request.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => declineFriendRequest(request.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}