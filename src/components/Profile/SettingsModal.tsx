import React from 'react';
import { X, Moon, Sun, Bell, Shield, Globe, Type } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { userPreferences, updatePreferences } = useApp();

  if (!isOpen) return null;

  const toggleTheme = () => {
    updatePreferences({
      theme: {
        ...userPreferences.theme,
        isDark: !userPreferences.theme.isDark
      }
    });
  };

  const toggleNotification = (type: keyof typeof userPreferences.notifications) => {
    updatePreferences({
      notifications: {
        ...userPreferences.notifications,
        [type]: !userPreferences.notifications[type]
      }
    });
  };

  const togglePrivacy = (type: keyof typeof userPreferences.privacy) => {
    updatePreferences({
      privacy: {
        ...userPreferences.privacy,
        [type]: !userPreferences.privacy[type]
      }
    });
  };

  const updateFontSize = (size: 'small' | 'medium' | 'large') => {
    updatePreferences({
      theme: {
        ...userPreferences.theme,
        fontSize: size
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${
        userPreferences.theme.isDark ? 'bg-gray-800' : 'bg-white'
      } rounded-lg p-6 w-full max-w-lg transition-colors duration-200`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'}`}>
            Settings
          </h2>
          <button
            onClick={onClose}
            className={`${userPreferences.theme.isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6 max-h-96 overflow-y-auto">
          {/* Theme Settings */}
          <div>
            <h3 className={`text-lg font-medium mb-3 flex items-center space-x-2 ${
              userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {userPreferences.theme.isDark ? <Moon size={20} /> : <Sun size={20} />}
              <span>Appearance</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`${userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Dark Mode
                </span>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    userPreferences.theme.isDark ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      userPreferences.theme.isDark ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <span className={`block mb-2 ${userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Font Size
                </span>
                <div className="flex space-x-2">
                  {(['small', 'medium', 'large'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => updateFontSize(size)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                        userPreferences.theme.fontSize === size
                          ? 'bg-blue-600 text-white'
                          : userPreferences.theme.isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <h3 className={`text-lg font-medium mb-3 flex items-center space-x-2 ${
              userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <Bell size={20} />
              <span>Notifications</span>
            </h3>
            <div className="space-y-3">
              {Object.entries(userPreferences.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className={`${userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                  <button
                    onClick={() => toggleNotification(key as keyof typeof userPreferences.notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      value ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Settings */}
          <div>
            <h3 className={`text-lg font-medium mb-3 flex items-center space-x-2 ${
              userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <Shield size={20} />
              <span>Privacy</span>
            </h3>
            <div className="space-y-3">
              {Object.entries(userPreferences.privacy).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className={`${userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                  <button
                    onClick={() => togglePrivacy(key as keyof typeof userPreferences.privacy)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      value ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Language Settings */}
          <div>
            <h3 className={`text-lg font-medium mb-3 flex items-center space-x-2 ${
              userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <Globe size={20} />
              <span>Language</span>
            </h3>
            <select
              value={userPreferences.theme.language}
              onChange={(e) => updatePreferences({
                theme: { ...userPreferences.theme, language: e.target.value }
              })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                userPreferences.theme.isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}