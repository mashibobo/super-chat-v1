import React, { useState } from 'react';
import { Search, Plus, MessageCircle, Clock, UserPlus, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ChatWindow from './ChatWindow';
import FriendRequestModal from './FriendRequestModal';
import AddFriendModal from './AddFriendModal';

export default function PrivateChat() {
  const { currentUser, users, messages, friendRequests, userPreferences } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);

  if (!currentUser) return null;

  // Get conversations with last message
  const conversations = users
    .filter(user => user.id !== currentUser.id)
    .map(user => {
      const userMessages = messages.filter(
        msg => 
          (msg.senderId === user.id && msg.receiverId === currentUser.id) ||
          (msg.senderId === currentUser.id && msg.receiverId === user.id)
      );
      const lastMessage = userMessages[userMessages.length - 1];
      
      return {
        user,
        lastMessage,
        unreadCount: userMessages.filter(msg => 
          msg.senderId === user.id && !msg.isRead
        ).length,
      };
    })
    .filter(conv => 
      conv.user.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
    });

  const pendingRequests = friendRequests.filter(req => 
    req.receiverId === currentUser.id && req.status === 'pending'
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  if (selectedChat) {
    const chatUser = users.find(u => u.id === selectedChat);
    if (chatUser) {
      return (
        <ChatWindow
          user={chatUser}
          onBack={() => setSelectedChat(null)}
        />
      );
    }
  }

  return (
    <div className={`h-full ${userPreferences.theme.isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      {/* Header */}
      <div className={`${userPreferences.theme.isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-bold ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
            Private Chats
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddFriend(true)}
              className="relative bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors duration-200"
            >
              <UserPlus size={20} />
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
            userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-500'
          }`} size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search conversations..."
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              userPreferences.theme.isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="overflow-y-auto h-full pb-20">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <MessageCircle size={48} className={userPreferences.theme.isDark ? 'text-gray-600' : 'text-gray-400'} />
            <h3 className={`text-lg font-medium mt-4 ${userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              No conversations yet
            </h3>
            <p className={`text-sm mt-2 ${userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Send friend requests to start chatting!
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map(({ user, lastMessage, unreadCount }) => (
              <button
                key={user.id}
                onClick={() => setSelectedChat(user.id)}
                className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                  userPreferences.theme.isDark 
                    ? 'hover:bg-gray-800 border-gray-700' 
                    : 'hover:bg-white hover:shadow-sm border-gray-100'
                } border`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-medium truncate ${
                          userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {user.username}
                        </h3>
                        {user.credits >= 200 && (
                          <span className="text-orange-500 text-xs">🔥</span>
                        )}
                      </div>
                      {lastMessage && (
                        <p className={`text-sm truncate mt-1 ${
                          userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {lastMessage.senderId === currentUser.id ? 'You: ' : ''}
                          {lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {lastMessage && (
                      <span className={`text-xs ${
                        userPreferences.theme.isDark ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {formatTime(lastMessage.timestamp)}
                      </span>
                    )}
                    {unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {unreadCount}
                      </span>
                    )}
                    {!user.isOnline && user.lastSeen && (
                      <div className="flex items-center space-x-1">
                        <Clock size={12} className={userPreferences.theme.isDark ? 'text-gray-500' : 'text-gray-400'} />
                        <span className={`text-xs ${userPreferences.theme.isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {formatTime(user.lastSeen)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Friend Requests Modal */}
      {showAddFriend && (
        <AddFriendModal
          isOpen={showAddFriend}
          onClose={() => setShowAddFriend(false)}
        />
      )}
      
      {showFriendRequests && (
        <FriendRequestModal
          isOpen={showFriendRequests}
          onClose={() => setShowFriendRequests(false)}
        />
      )}
    </div>
  );
}