import React from 'react';
import { X, Check, UserPlus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface FriendRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FriendRequestModal({ isOpen, onClose }: FriendRequestModalProps) {
  const { currentUser, friendRequests, acceptFriendRequest, declineFriendRequest, userPreferences } = useApp();

  if (!isOpen || !currentUser) return null;

  const pendingRequests = friendRequests.filter(req => 
    req.receiverId === currentUser.id && req.status === 'pending'
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${
        userPreferences.theme.isDark ? 'bg-gray-800' : 'bg-white'
      } rounded-lg p-6 w-full max-w-md transition-colors duration-200`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
            Friend Requests
          </h2>
          <button
            onClick={onClose}
            className={`${userPreferences.theme.isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
          >
            <X size={24} />
          </button>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="text-center py-8">
            <UserPlus size={48} className={`mx-auto mb-4 ${userPreferences.theme.isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`${userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No pending friend requests
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {pendingRequests.map((request) => (
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
                      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full transition-colors duration-200"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => declineFriendRequest(request.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors duration-200"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}