import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ConfessionCategory } from '../../types';

interface CreateConfessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateConfessionModal({ isOpen, onClose }: CreateConfessionModalProps) {
  const { createConfession, userPreferences } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'other' as ConfessionCategory,
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const categories: { id: ConfessionCategory; label: string; emoji: string }[] = [
    { id: 'work', label: 'Work', emoji: '💼' },
    { id: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
    { id: 'school', label: 'School', emoji: '🎓' },
    { id: 'relationships', label: 'Relationships', emoji: '💕' },
    { id: 'health', label: 'Health', emoji: '🏥' },
    { id: 'entertainment', label: 'Entertainment', emoji: '🎉' },
    { id: 'other', label: 'Other', emoji: '🤔' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    setIsLoading(true);
    
    createConfession(formData.title.trim(), formData.content.trim(), formData.category);
    
    onClose();
    setFormData({ title: '', content: '', category: 'other' });
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${
        userPreferences.theme.isDark ? 'bg-gray-800' : 'bg-white'
      } rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto transition-colors duration-200`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
            Share Your Story
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
                      ? 'border-purple-500 bg-purple-50'
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
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 ${
                userPreferences.theme.isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Give your confession a title"
              required
              maxLength={100}
            />
            <p className={`text-xs mt-1 ${userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {formData.title.length}/100 characters
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Your Story *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 ${
                userPreferences.theme.isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Share what's on your mind..."
              rows={6}
              required
              maxLength={1000}
            />
            <p className={`text-xs mt-1 ${userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {formData.content.length}/1000 characters
            </p>
          </div>

          <div className={`p-3 rounded-lg ${
            userPreferences.theme.isDark ? 'bg-purple-900 text-purple-200' : 'bg-purple-50 text-purple-800'
          }`}>
            <p className="text-sm">
              💜 Your username will be shown with this confession. Others can view your profile and send you friend requests.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !formData.title.trim() || !formData.content.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {isLoading ? 'Sharing...' : 'Share Confession'}
          </button>
        </form>
      </div>
    </div>
  );
}