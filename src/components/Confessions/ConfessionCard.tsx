import React, { useState } from 'react';
import { Heart, MessageSquare, Bookmark, Share2, Flag, User, Edit, Trash2, Send, UserPlus, AlertTriangle, ThumbsUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Confession } from '../../types';
import UserActionModal from './UserActionModal';

interface ConfessionCardProps {
  confession: Confession;
}

export default function ConfessionCard({ confession }: ConfessionCardProps) {
  const { currentUser, likeConfession, saveConfession, sendFriendRequest, editConfession, deleteConfession, addComment, likeComment, userPreferences } = useApp();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(confession.title);
  const [editContent, setEditContent] = useState(confession.content);
  const [showUserActions, setShowUserActions] = useState(false);

  const isOwner = currentUser?.id === confession.authorId;

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryEmoji = (category: string) => {
    const emojis = {
      work: '💼',
      family: '👨‍👩‍👧‍👦',
      school: '🎓',
      relationships: '💕',
      health: '🏥',
      entertainment: '🎉',
      other: '🤔',
    };
    return emojis[category as keyof typeof emojis] || '🤔';
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    addComment(confession.id, newComment.trim());
    setNewComment('');
  };

  const handleEdit = () => {
    if (isEditing) {
      editConfession(confession.id, editTitle.trim(), editContent.trim());
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this confession? This action cannot be undone.')) {
      deleteConfession(confession.id);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(confession.title);
    setEditContent(confession.content);
  };

  return (
    <div className={`${
      userPreferences.theme.isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border rounded-lg p-4 transition-colors duration-200`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowUserActions(true)}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-all duration-200 hover:scale-105 ${
              'bg-gradient-to-r from-purple-400 to-pink-500'
            }`}
          >
            {confession.authorUsername.charAt(0).toUpperCase()}
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowUserActions(true)}
                className={`font-medium hover:underline ${
                  userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                {confession.authorUsername}
              </button>
              <span className="text-lg">{getCategoryEmoji(confession.category)}</span>
              {confession.isEdited && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  userPreferences.theme.isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                }`}>
                  edited
                </span>
              )}
            </div>
            <p className={`text-sm ${userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {formatTimeAgo(confession.timestamp)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {isOwner && (
            <>
              <button
                onClick={handleEdit}
                className={`p-1 rounded-full ${
                  userPreferences.theme.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } transition-colors duration-200`}
                title="Edit confession"
              >
                <Edit size={16} className={userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'} />
              </button>
              <button
                onClick={handleDelete}
                className={`p-1 rounded-full ${
                  userPreferences.theme.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } transition-colors duration-200`}
                title="Delete confession"
              >
                <Trash2 size={16} className="text-red-500" />
              </button>
            </>
          )}
          <button className={`p-1 rounded-full ${
            userPreferences.theme.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          } transition-colors duration-200`}>
            <Flag size={16} className={userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 ${
                userPreferences.theme.isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Confession title"
              maxLength={100}
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 ${
                userPreferences.theme.isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Share your story..."
              rows={4}
              maxLength={1000}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                disabled={!editTitle.trim() || !editContent.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancelEdit}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  userPreferences.theme.isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 className={`font-bold text-lg mb-2 ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
              {confession.title}
            </h3>
            <p className={`${userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
              {confession.content}
            </p>
          </>
        )}
      </div>

      {!isEditing && (
        <>
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => likeConfession(confession.id)}
            className={`flex items-center space-x-2 transition-all duration-200 hover:scale-105 ${
              confession.isLiked 
                ? 'text-red-500' 
                : userPreferences.theme.isDark 
                ? 'text-gray-400 hover:text-red-400' 
                : 'text-gray-600 hover:text-red-500'
            }`}
          >
            <Heart size={20} fill={confession.isLiked ? 'currentColor' : 'none'} />
            <span className="text-sm font-medium">{confession.likes}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center space-x-2 transition-colors duration-200 ${
              userPreferences.theme.isDark 
                ? 'text-gray-400 hover:text-blue-400' 
                : 'text-gray-600 hover:text-blue-500'
            }`}
          >
            <MessageSquare size={20} />
            <span className="text-sm font-medium">{confession.comments.length}</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => saveConfession(confession.id)}
            className={`p-2 rounded-full transition-all duration-200 hover:scale-105 ${
              confession.isSaved
                ? userPreferences.theme.isDark
                  ? 'text-yellow-400 bg-yellow-900'
                  : 'text-yellow-500 bg-yellow-50'
                : userPreferences.theme.isDark
                ? 'text-gray-400 hover:text-yellow-400 hover:bg-gray-700'
                : 'text-gray-600 hover:text-yellow-500 hover:bg-gray-100'
            }`}
          >
            <Bookmark size={18} fill={confession.isSaved ? 'currentColor' : 'none'} />
          </button>
          
          <button className={`p-2 rounded-full transition-colors duration-200 ${
            userPreferences.theme.isDark 
              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}>
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className={`mt-4 pt-4 border-t ${userPreferences.theme.isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="space-y-3 mb-4">
            {confession.comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                  'bg-gradient-to-r from-blue-400 to-purple-500'
                }`}>
                  {comment.authorUsername.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <button className={`text-sm font-medium hover:underline ${
                      userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {comment.authorUsername}
                    </button>
                    <span className={`text-xs ${userPreferences.theme.isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {formatTimeAgo(comment.timestamp)}
                    </span>
                  </div>
                  <div className="mt-1">
                    <p className={`text-sm ${userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {comment.content.split(/(@\w+)/g).map((part, index) => 
                        part.startsWith('@') ? (
                          <span key={index} className="text-blue-500 font-medium">
                            {part}
                          </span>
                        ) : (
                          <span key={index}>{part}</span>
                        )
                      )}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <button
                        onClick={() => likeComment(confession.id, comment.id)}
                        className={`flex items-center space-x-1 text-xs transition-colors duration-200 ${
                          comment.isLiked 
                            ? 'text-blue-500' 
                            : userPreferences.theme.isDark 
                            ? 'text-gray-400 hover:text-blue-400' 
                            : 'text-gray-600 hover:text-blue-500'
                        }`}
                      >
                        <ThumbsUp size={14} fill={comment.isLiked ? 'currentColor' : 'none'} />
                        <span>{comment.likes}</span>
                      </button>
                      <button
                        onClick={() => setNewComment(`@${comment.authorUsername} `)}
                        className={`text-xs transition-colors duration-200 ${
                          userPreferences.theme.isDark 
                            ? 'text-gray-400 hover:text-gray-200' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex space-x-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 ${
                userPreferences.theme.isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors duration-200"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
        </>
      )}

      {/* User Actions Modal */}
      {showUserActions && (
        <UserActionModal
          isOpen={showUserActions}
          onClose={() => setShowUserActions(false)}
          username={confession.authorUsername}
          userId={confession.authorId}
        />
      )}
    </div>
  );
}