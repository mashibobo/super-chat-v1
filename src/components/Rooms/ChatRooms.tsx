import React, { useState } from 'react';
import { Search, Plus, Users, Lock, Globe, Shield, Eye, Star, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RoomCategory } from '../../types';
import CreateRoomModal from './CreateRoomModal';
import SuperSecretRoomModal from './SuperSecretRoomModal';
import RoomChat from './RoomChat';

export default function ChatRooms() {
  const { chatRooms, currentUser, userPreferences } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuperSecretModal, setShowSuperSecretModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'public' | 'private' | 'super_secret'>('all');
  const [categoryFilter, setCategoryFilter] = useState<RoomCategory | 'all'>('all');

  const categories: { id: RoomCategory | 'all'; label: string; emoji: string }[] = [
    { id: 'all', label: 'All', emoji: '📝' },
    { id: 'general', label: 'General', emoji: '💬' },
    { id: 'gaming', label: 'Gaming', emoji: '🎮' },
    { id: 'study', label: 'Study', emoji: '📚' },
    { id: 'work', label: 'Work', emoji: '💼' },
    { id: 'entertainment', label: 'Entertainment', emoji: '🎉' },
    { id: 'support', label: 'Support', emoji: '🤝' },
    { id: 'other', label: 'Other', emoji: '🤔' },
  ];

  const filteredRooms = chatRooms
    .filter(room => {
      const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' ||
        (filter === 'public' && !room.isPrivate) ||
        (filter === 'private' && room.isPrivate && !room.isSuperSecret) ||
        (filter === 'super_secret' && room.isSuperSecret);
      const matchesCategory = categoryFilter === 'all' || room.category === categoryFilter;
      
      // Hide super secret rooms unless user is member or creator, or viewing super secret filter
      const canViewSuperSecret = !room.isSuperSecret || 
        room.members.some(m => m.id === currentUser?.id) ||
        room.creatorId === currentUser?.id ||
        filter === 'super_secret';
      
      return matchesSearch && matchesFilter && matchesCategory && canViewSuperSecret;
    })
    .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());

  const getCategoryEmoji = (category: RoomCategory) => {
    const categoryMap = categories.find(c => c.id === category);
    return categoryMap?.emoji || '🤔';
  };

  if (selectedRoom) {
    const room = chatRooms.find(r => r.id === selectedRoom);
    if (room) {
      return <RoomChat room={room} onBack={() => setSelectedRoom(null)} />;
    }
  }

  return (
    <div className={`h-full ${userPreferences.theme.isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      {/* Header */}
      <div className={`${userPreferences.theme.isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-bold ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
            Chat Rooms
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSuperSecretModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition-colors duration-200"
              title="Super Secret Room"
            >
              <Shield size={20} />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors duration-200"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
            userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-500'
          }`} size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search rooms..."
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              userPreferences.theme.isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
          />
        </div>

        {/* Category Filter */}
        <div className="flex space-x-2 overflow-x-auto pb-2 mb-4">
          {categories.map(({ id, label, emoji }) => (
            <button
              key={id}
              onClick={() => setCategoryFilter(id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                categoryFilter === id
                  ? 'bg-green-600 text-white'
                  : userPreferences.theme.isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'public', label: 'Public' },
            { id: 'private', label: 'Private' },
            { id: 'super_secret', label: 'Super Secret' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === id
                  ? 'bg-blue-600 text-white'
                  : userPreferences.theme.isDark
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Rooms List */}
      <div className="overflow-y-auto h-full pb-20">
        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <Users size={48} className={userPreferences.theme.isDark ? 'text-gray-600' : 'text-gray-400'} />
            <h3 className={`text-lg font-medium mt-4 ${userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {searchTerm ? 'No rooms found' : 'No rooms available'}
            </h3>
            <p className={`text-sm mt-2 ${userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm ? 'Try a different search term' : 'Create the first room!'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {filteredRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                className={`w-full p-4 rounded-xl text-left transition-all duration-200 transform hover:scale-[1.02] ${
                  userPreferences.theme.isDark 
                    ? 'hover:bg-gray-800 border-gray-700 bg-gray-800/50' 
                    : 'hover:bg-white hover:shadow-lg border-gray-100 bg-white/80'
                } border backdrop-blur-sm`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
                      room.isSuperSecret ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                      room.isPrivate ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-green-500 to-blue-500'
                    } text-white font-bold shadow-lg`}>
                      {getCategoryEmoji(room.category)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-bold text-lg ${
                          userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {room.name}
                        </h3>
                        {room.isSuperSecret ? (
                          <Shield size={16} className="text-purple-500" />
                        ) : room.isPrivate ? (
                          <Lock size={16} className="text-yellow-500" />
                        ) : (
                          <Globe size={16} className="text-green-500" />
                        )}
                      </div>
                      {room.description && (
                        <p className={`text-sm ${
                          userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {room.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {room.members.some(m => m.id === currentUser?.id) ? (
                    <div className="flex items-center space-x-2">
                      <button className="p-2 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition-colors">
                        <Star size={16} />
                      </button>
                      <button className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors">
                        <LogOut size={16} />
                      </button>
                    </div>
                  ) : (
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                      Join
                    </button>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Users size={14} />
                        <span className={userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'}>
                          {room.memberCount}
                        </span>
                      </div>
                      <div className={`flex items-center space-x-1 ${userPreferences.theme.isDark ? 'text-green-400' : 'text-green-600'}`}>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">{room.onlineCount} online</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        room.isSuperSecret 
                          ? 'bg-purple-100 text-purple-800' 
                          : room.isPrivate 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {room.isSuperSecret ? 'Super Secret' : room.isPrivate ? 'Private' : 'Public'}
                      </span>
                      {room.isSuperSecret && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          userPreferences.theme.isDark ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                        }`}>
                          ID: {room.roomId}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      {room.members.slice(0, 3).map((member, index) => (
                        <div
                          key={member.id}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 ${
                            userPreferences.theme.isDark ? 'border-gray-800' : 'border-white'
                          } ${
                            member.credits >= 200 ? 'bg-gradient-to-r from-orange-400 to-red-500' :
                            member.credits >= 100 ? 'bg-gradient-to-r from-blue-400 to-purple-500' :
                            'bg-gradient-to-r from-green-400 to-blue-500'
                          } shadow-lg`}
                        >
                          {member.username.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {room.memberCount > 3 && (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                          userPreferences.theme.isDark 
                            ? 'border-gray-800 bg-gray-600 text-gray-300' 
                            : 'border-white bg-gray-400 text-white'
                        } shadow-lg`}>
                          +{room.memberCount - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {room.members.some(m => m.id === currentUser?.id) && (
                  <div className={`mt-3 pt-3 border-t ${
                    userPreferences.theme.isDark ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        userPreferences.theme.isDark ? 'text-green-400' : 'text-green-600'
                      }`}>
                        ✓ You're a member
                      </span>
                      <span className={`text-xs ${
                        userPreferences.theme.isDark ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        Last active: {new Date(room.lastActivity).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Super Secret Room Modal */}
      {showSuperSecretModal && (
        <SuperSecretRoomModal
          isOpen={showSuperSecretModal}
          onClose={() => setShowSuperSecretModal(false)}
        />
      )}
    </div>
  );
}