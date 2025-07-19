import React, { useState } from 'react';
import { Plus, Filter, Heart, MessageSquare, Bookmark, TrendingUp, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ConfessionCategory } from '../../types';
import CreateConfessionModal from './CreateConfessionModal';
import ConfessionCard from './ConfessionCard';

export default function Confessions() {
  const { confessions, userPreferences } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ConfessionCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'likes' | 'comments' | 'trending'>('recent');

  const categories: { id: ConfessionCategory | 'all'; label: string; emoji: string }[] = [
    { id: 'all', label: 'All', emoji: '📝' },
    { id: 'work', label: 'Work', emoji: '💼' },
    { id: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
    { id: 'school', label: 'School', emoji: '🎓' },
    { id: 'relationships', label: 'Love', emoji: '💕' },
    { id: 'health', label: 'Health', emoji: '🏥' },
    { id: 'entertainment', label: 'Fun', emoji: '🎉' },
    { id: 'other', label: 'Other', emoji: '🤔' },
  ];

  const sortOptions = [
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'likes', label: 'Most Liked', icon: Heart },
    { id: 'comments', label: 'Most Comments', icon: MessageSquare },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
  ];

  const filteredConfessions = confessions
    .filter(confession => selectedCategory === 'all' || confession.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'likes':
          return b.likes - a.likes;
        case 'comments':
          return b.comments.length - a.comments.length;
        case 'trending':
          // Simple trending algorithm: likes + comments in last 24h
          const aScore = a.likes + a.comments.length;
          const bScore = b.likes + b.comments.length;
          return bScore - aScore;
        case 'recent':
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });

  return (
    <div className={`h-full ${userPreferences.theme.isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      {/* Header */}
      <div className={`${userPreferences.theme.isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4 space-y-4`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-xl font-bold ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
            Confessions
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition-colors duration-200"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Categories */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map(({ id, label, emoji }) => (
            <button
              key={id}
              onClick={() => setSelectedCategory(id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                selectedCategory === id
                  ? 'bg-purple-600 text-white'
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

        {/* Sort Options */}
        <div className="flex space-x-2 overflow-x-auto">
          {sortOptions.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSortBy(id as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                sortBy === id
                  ? 'bg-blue-600 text-white'
                  : userPreferences.theme.isDark
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Confessions List */}
      <div className="overflow-y-auto h-full pb-20">
        {filteredConfessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <Heart size={48} className={userPreferences.theme.isDark ? 'text-gray-600' : 'text-gray-400'} />
            <h3 className={`text-lg font-medium mt-4 ${userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              No confessions found
            </h3>
            <p className={`text-sm mt-2 ${userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Be the first to share something!
            </p>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {filteredConfessions.map((confession) => (
              <ConfessionCard key={confession.id} confession={confession} />
            ))}
          </div>
        )}
      </div>

      {/* Create Confession Modal */}
      {showCreateModal && (
        <CreateConfessionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}