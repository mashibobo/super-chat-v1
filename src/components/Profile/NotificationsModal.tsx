import React from 'react';
import { X, Bell, UserPlus, MessageSquare, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const { notifications, friendRequests, currentUser, acceptFriendRequest, declineFriendRequest, userPreferences } = useApp();

  if (!isOpen || !currentUser) return null;

  const pendingRequests = friendRequests.filter(r => r.receiverId === currentUser.id && r.status === 'pending');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return <UserPlus size={20} className="text-blue-500" />;
      case 'message':
        return <MessageSquare size={20} className="text-green-500" />;
      case 'admin':
        return <Shield size={20} className="text-purple-500" />;
      default:
        return <Bell size={20} className="text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInHours = (now.getTime() - notifTime.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${
        userPreferences.theme.isDark ? 'bg-gray-800' : 'bg-white'
      } rounded-lg p-6 w-full max-w-md transition-colors duration-200`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
            Notifications
          </h2>
          <button
            onClick={onClose}
            className={`${userPreferences.theme.isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* Friend Requests */}
          {pendingRequests.length > 0 && (
            <div>
              <h3 className={`text-sm font-medium mb-2 ${userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Friend Requests
              </h3>
              <div className="space-y-2">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`p-3 rounded-lg border ${
                      userPreferences.theme.isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <UserPlus size={20} className="text-blue-500" />
                        <div>
                          <p className={`font-medium ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
                            {request.senderUsername}
                          </p>
                          <p className={`text-sm ${userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Wants to be friends
                          </p>
                        </div>
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
                ))}
              </div>
            </div>
          )}

          {/* Other Notifications */}
          {notifications.length > 0 ? (
            <div>
              <h3 className={`text-sm font-medium mb-2 ${userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Recent Activity
              </h3>
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg transition-colors duration-200 ${
                      notification.isRead 
                        ? userPreferences.theme.isDark ? 'bg-gray-700' : 'bg-gray-50'
                        : userPreferences.theme.isDark ? 'bg-blue-900' : 'bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <p className={`font-medium ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
                          {notification.title}
                        </p>
                        <p className={`text-sm mt-1 ${userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {notification.content}
                        </p>
                        <p className={`text-xs mt-2 ${userPreferences.theme.isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          {formatTimeAgo(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell size={48} className={`mx-auto mb-4 ${userPreferences.theme.isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`${userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No notifications yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}