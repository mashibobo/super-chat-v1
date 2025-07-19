import React, { useState } from 'react';
import { Settings, Bell, Users, Bookmark, Shield, Moon, Sun, LogOut, Share, Copy, Gift } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import NotificationsModal from './NotificationsModal';
import SettingsModal from './SettingsModal';
import ReferralModal from './ReferralModal';

export default function Profile() {
  const { currentUser, confessions, friendRequests, logout, userPreferences, updatePreferences, markAllNotificationsAsRead } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showReferral, setShowReferral] = useState(false);

  if (!currentUser) return null;

  const userConfessions = confessions.filter(c => c.authorId === currentUser.id);
  const savedConfessions = confessions.filter(c => c.isSaved);
  const pendingRequests = friendRequests.filter(r => r.receiverId === currentUser.id && r.status === 'pending');

  const handleNotificationsClick = () => {
    setShowNotifications(true);
    markAllNotificationsAsRead();
  };

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleTheme = () => {
    updatePreferences({
      theme: {
        ...userPreferences.theme,
        isDark: !userPreferences.theme.isDark
      }
    });
  };

  const getCreditStatus = (credits: number) => {
    if (credits >= 1000) return { label: 'VIP Elite', color: 'from-yellow-400 to-orange-500', badge: '👑' };
    if (credits >= 500) return { label: 'VIP Gold', color: 'from-yellow-400 to-yellow-600', badge: '🏆' };
    if (credits >= 200) return { label: 'VIP Silver', color: 'from-gray-400 to-gray-600', badge: '🥈' };
    if (credits >= 100) return { label: 'Active User', color: 'from-blue-400 to-purple-500', badge: '⭐' };
    return { label: 'New User', color: 'from-green-400 to-blue-500', badge: '🌱' };
  };

  const creditStatus = getCreditStatus(currentUser.credits);

  return (
    <div className={`h-full ${userPreferences.theme.isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      {/* Header */}
      <div className={`${userPreferences.theme.isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-6`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
            Profile
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors duration-200 ${
                userPreferences.theme.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              {userPreferences.theme.isDark ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-gray-600" />
              )}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className={`p-2 rounded-full transition-colors duration-200 ${
                userPreferences.theme.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <Settings size={20} className={userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-600'} />
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex items-center space-x-4">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white bg-gradient-to-r ${creditStatus.color}`}>
            {currentUser.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className={`text-xl font-bold ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
                {currentUser.username}
              </h3>
              <span className="text-xl">{creditStatus.badge}</span>
            </div>
            <p className={`text-sm mb-2 ${userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {creditStatus.label} • Joined {formatJoinDate(currentUser.joinDate)}
            </p>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${creditStatus.color} text-white`}>
              {currentUser.credits} Credits
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <p className={`text-2xl font-bold ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
              {userConfessions.length}
            </p>
            <p className={`text-sm ${userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Confessions
            </p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
              {userConfessions.reduce((sum, c) => sum + c.likes, 0)}
            </p>
            <p className={`text-sm ${userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Likes
            </p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
              {savedConfessions.length}
            </p>
            <p className={`text-sm ${userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Saved
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-2">
        <button
          onClick={() => setShowReferral(true)}
          className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors duration-200 ${
            userPreferences.theme.isDark ? 'hover:bg-gray-800' : 'hover:bg-white hover:shadow-sm'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Gift size={20} className="text-green-500" />
            <span className={`font-medium ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
              Invite Friends
            </span>
          </div>
          <span className="text-green-500 text-sm font-medium">+250 credits</span>
        </button>

        <button
          onClick={handleNotificationsClick}
          className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors duration-200 ${
            userPreferences.theme.isDark ? 'hover:bg-gray-800' : 'hover:bg-white hover:shadow-sm'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Bell size={20} className={userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'} />
            <span className={`font-medium ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
              Notifications
            </span>
          </div>
          {pendingRequests.length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button className={`w-full flex items-center space-x-3 p-4 rounded-lg transition-colors duration-200 ${
          userPreferences.theme.isDark ? 'hover:bg-gray-800' : 'hover:bg-white hover:shadow-sm'
        }`}>
          <Bookmark size={20} className={userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'} />
          <div className="flex-1 flex items-center justify-between">
            <span className={`font-medium ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
              Saved Confessions
            </span>
            {savedConfessions.length > 0 && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                userPreferences.theme.isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                {savedConfessions.length}
              </span>
            )}
          </div>
        </button>

        <button className={`w-full flex items-center space-x-3 p-4 rounded-lg transition-colors duration-200 ${
          userPreferences.theme.isDark ? 'hover:bg-gray-800' : 'hover:bg-white hover:shadow-sm'
        }`}>
          <Shield size={20} className={userPreferences.theme.isDark ? 'text-gray-400' : 'text-gray-600'} />
          <span className={`font-medium ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
            Privacy & Safety
          </span>
        </button>
      </div>

      {/* Credit Earning Section */}
      <div className={`m-4 p-4 rounded-lg ${
        userPreferences.theme.isDark ? 'bg-gradient-to-r from-purple-900 to-blue-900' : 'bg-gradient-to-r from-purple-50 to-blue-50'
      }`}>
        <h3 className={`font-bold mb-2 ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
          Earn More Credits
        </h3>
        <div className="space-y-2">
          <p className={`text-sm ${userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            🎥 Watch ads: +25 credits
          </p>
          <p className={`text-sm ${userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            📅 Daily login: +10 credits
          </p>
          <p className={`text-sm ${userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            👥 Invite friends: +250 credits each
          </p>
          <p className={`text-sm ${userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            🎉 Special events: Bonus credits
          </p>
        </div>
      </div>

      {/* Logout */}
      <div className="p-4">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>

      {/* Modals */}
      {showReferral && (
        <ReferralModal
          isOpen={showReferral}
          onClose={() => setShowReferral(false)}
        />
      )}
      
      {showNotifications && (
        <NotificationsModal
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}
      
      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}