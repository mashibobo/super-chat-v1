import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Users, Settings, Shield, UserMinus, Ban, Crown, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChatRoom } from '../../types';

interface RoomChatProps {
  room: ChatRoom;
  onBack: () => void;
}

export default function RoomChat({ room, onBack }: RoomChatProps) {
  const { currentUser, messages, sendRoomMessage, kickUserFromRoom, banUserFromRoom, makeUserAdmin, userPreferences } = useApp();
  const [message, setMessage] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const roomMessages = messages.filter(msg => msg.roomId === room.id);

  const isCreator = currentUser?.id === room.creatorId;
  const isAdmin = currentUser?.id && room.admins.includes(currentUser.id);
  const canModerate = isCreator || isAdmin;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentUser) return;
    
    if (currentUser.credits < 1) {
      alert('You need at least 1 credit to send a message!');
      return;
    }
    
    sendRoomMessage(room.id, message.trim());
    setMessage('');
  };

  const handleKickUser = (userId: string) => {
    if (canModerate && userId !== currentUser?.id) {
      kickUserFromRoom(room.id, userId);
      setSelectedMember(null);
    }
  };

  const handleBanUser = (userId: string) => {
    if (canModerate && userId !== currentUser?.id) {
      banUserFromRoom(room.id, userId);
      setSelectedMember(null);
    }
  };

  const handleToggleAdmin = (userId: string) => {
    if (isCreator && userId !== currentUser?.id) {
      makeUserAdmin(room.id, userId);
      setSelectedMember(null);
    }
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
      <div className={`${userPreferences.theme.isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className={`p-1 rounded-full ${userPreferences.theme.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-200`}
            >
              <ArrowLeft size={20} className={userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-600'} />
            </button>
            <div>
              <div className="flex items-center space-x-2">
              <h3 className={`font-medium ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
                {room.name}
              </h3>
                {room.isSuperSecret && <Shield size={16} className="text-purple-500" />}
                {isCreator && <Crown size={16} className="text-yellow-500" />}
              </div>
              <p className={`text-sm ${userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {room.memberCount} members • {room.onlineCount} online
              </p>
              {room.isSuperSecret && (
                <p className={`text-xs ${userPreferences.theme.isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                  ID: {room.roomId}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowMembers(!showMembers)}
              className={`p-2 rounded-full ${userPreferences.theme.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-200`}
            >
              <Users size={20} className={userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-600'} />
            </button>
            {canModerate && (
              <button 
                onClick={() => alert('Room settings coming soon!')}
                className={`p-2 rounded-full ${userPreferences.theme.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-200`}
              >
                <Settings size={20} className={userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-600'} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {roomMessages.length === 0 ? (
          <div className="text-center py-8">
            <p className={`${userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Be the first to send a message in {room.name}!
            </p>
          </div>
        ) : (
          roomMessages.map((msg) => {
            const isOwn = msg.senderId === currentUser?.id;
            const sender = room.members.find(member => member.id === msg.senderId);
            const senderIsAdmin = sender && room.admins.includes(sender.id);
            const senderIsCreator = sender?.id === room.creatorId;
            
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  isOwn 
                    ? 'bg-blue-600 text-white' 
                    : userPreferences.theme.isDark 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-white text-gray-900 border border-gray-200'
                } shadow-sm`}>
                  {!isOwn && sender && (
                    <div className="flex items-center space-x-1 mb-1">
                      <p className={`text-xs font-medium ${
                        senderIsCreator ? 'text-yellow-400' :
                        senderIsAdmin ? 'text-blue-400' :
                        sender.credits >= 200 ? 'text-orange-400' :
                        sender.credits >= 100 ? 'text-purple-400' :
                        'text-green-400'
                      }`}>
                        {sender.username}
                      </p>
                      {senderIsCreator && <Crown size={12} className="text-yellow-400" />}
                      {senderIsAdmin && !senderIsCreator && <Shield size={12} className="text-blue-400" />}
                      {sender.credits >= 200 && <span className="text-xs">🔥</span>}
                    </div>
                  )}
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

      {/* Members Sidebar */}
      {showMembers && (
        <>
          <div className={`absolute right-0 top-0 h-full w-64 ${
            userPreferences.theme.isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border-l p-4 z-20 transition-colors duration-200`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-medium ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
                Members ({room.memberCount})
              </h3>
              <button
                onClick={() => setShowMembers(false)}
                className={`p-1 rounded-full ${userPreferences.theme.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-200`}
              >
                <X size={16} className={userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'} />
              </button>
            </div>
            <div className="space-y-2">
              {room.members.map((member) => {
                const memberIsAdmin = room.admins.includes(member.id);
                const memberIsCreator = member.id === room.creatorId;
                
                return (
                  <div key={member.id} className="relative">
                    <button
                      onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
                      className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 ${
                        userPreferences.theme.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        member.credits >= 200 ? 'bg-gradient-to-r from-orange-400 to-red-500' :
                        member.credits >= 100 ? 'bg-gradient-to-r from-blue-400 to-purple-500' :
                        'bg-gradient-to-r from-green-400 to-blue-500'
                      }`}>
                        {member.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center space-x-1">
                          <p className={`text-sm font-medium ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
                            {member.username}
                          </p>
                          {memberIsCreator && <Crown size={12} className="text-yellow-500" />}
                          {memberIsAdmin && !memberIsCreator && <Shield size={12} className="text-blue-500" />}
                          {member.credits >= 200 && <span className="text-xs">🔥</span>}
                        </div>
                        <p className={`text-xs ${userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {member.isOnline ? 'Online' : 'Offline'}
                          {memberIsCreator && ' • Creator'}
                          {memberIsAdmin && !memberIsCreator && ' • Admin'}
                        </p>
                      </div>
                    </button>

                    {/* Member Actions Menu */}
                    {selectedMember === member.id && canModerate && member.id !== currentUser?.id && (
                      <div className={`absolute right-0 top-full mt-1 w-48 ${
                        userPreferences.theme.isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                      } border rounded-lg shadow-lg z-30`}>
                        {isCreator && (
                          <button
                            onClick={() => handleToggleAdmin(member.id)}
                            className={`w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-blue-50 transition-colors duration-200 ${
                              userPreferences.theme.isDark ? 'hover:bg-blue-900 text-white' : 'text-gray-900'
                            }`}
                          >
                            <Shield size={16} />
                            <span>{memberIsAdmin ? 'Remove Admin' : 'Make Admin'}</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleKickUser(member.id)}
                          className={`w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-yellow-50 transition-colors duration-200 ${
                            userPreferences.theme.isDark ? 'hover:bg-yellow-900 text-white' : 'text-gray-900'
                          }`}
                        >
                          <UserMinus size={16} />
                          <span>Kick User</span>
                        </button>
                        <button
                          onClick={() => handleBanUser(member.id)}
                          className={`w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-red-50 transition-colors duration-200 ${
                            userPreferences.theme.isDark ? 'hover:bg-red-900 text-white' : 'text-gray-900'
                          }`}
                        >
                          <Ban size={16} />
                          <span>Ban User</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Overlay to close members panel */}
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-10"
            onClick={() => setShowMembers(false)}
          />
        </>
      )}

      {/* Click outside to close member actions */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-25"
          onClick={() => setSelectedMember(null)}
        />
      )}

      {/* Message Input */}
      <div className={`${userPreferences.theme.isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t p-4`}>
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <div className="flex-1">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={currentUser?.credits ? `Message ${room.name}... (${currentUser.credits} credits)` : 'No credits available'}
              disabled={!currentUser?.credits}
              className={`w-full px-4 py-2 rounded-full border ${
                userPreferences.theme.isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
            />
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