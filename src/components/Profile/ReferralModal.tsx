import React, { useState } from 'react';
import { X, Copy, Share, Gift, Check, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReferralModal({ isOpen, onClose }: ReferralModalProps) {
  const { generateReferralLink, userPreferences } = useApp();
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerateLink = () => {
    const link = generateReferralLink();
    setReferralLink(link);
  };

  const handleCopyLink = async () => {
    if (!referralLink) return;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!referralLink) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join AnonChat',
          text: 'Join me on AnonChat - the anonymous chat platform! Use my referral link to get started.',
          url: referralLink,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${
        userPreferences.theme.isDark ? 'bg-gray-800' : 'bg-white'
      } rounded-lg p-6 w-full max-w-md transition-colors duration-200`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold flex items-center space-x-2 ${
            userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'
          }`}>
            <Gift className="text-green-500" size={24} />
            <span>Invite Friends</span>
          </h2>
          <button
            onClick={onClose}
            className={`${userPreferences.theme.isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Referral Benefits */}
        <div className={`p-4 rounded-lg mb-6 ${
          userPreferences.theme.isDark ? 'bg-green-900 border border-green-700' : 'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-center space-x-2 mb-3">
            <Users className="text-green-500" size={20} />
            <h3 className={`font-bold ${userPreferences.theme.isDark ? 'text-green-200' : 'text-green-800'}`}>
              Referral Rewards
            </h3>
          </div>
          <div className="space-y-2">
            <div className={`flex items-center justify-between ${
              userPreferences.theme.isDark ? 'text-green-200' : 'text-green-700'
            }`}>
              <span className="text-sm">You earn:</span>
              <span className="font-bold">250 credits</span>
            </div>
            <div className={`flex items-center justify-between ${
              userPreferences.theme.isDark ? 'text-green-200' : 'text-green-700'
            }`}>
              <span className="text-sm">Friend gets:</span>
              <span className="font-bold">100 credits (signup bonus)</span>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className={`p-3 rounded-lg mb-6 ${
          userPreferences.theme.isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-800'
        }`}>
          <p className="text-sm">
            <strong>Requirements:</strong> Your friend must confirm their email address for you to receive the 250 credit bonus.
          </p>
        </div>

        {/* Generate Link */}
        {!referralLink ? (
          <button
            onClick={handleGenerateLink}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Gift size={20} />
            <span>Generate Referral Link</span>
          </button>
        ) : (
          <div className="space-y-4">
            {/* Referral Link Display */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Your Referral Link
              </label>
              <div className={`flex items-center space-x-2 p-3 border rounded-lg ${
                userPreferences.theme.isDark 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-gray-50 border-gray-300'
              }`}>
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className={`flex-1 bg-transparent text-sm ${
                    userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'
                  } focus:outline-none`}
                />
                <button
                  onClick={handleCopyLink}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    copied 
                      ? 'bg-green-600 text-white' 
                      : userPreferences.theme.isDark
                      ? 'bg-gray-600 hover:bg-gray-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleCopyLink}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors duration-200 ${
                  copied
                    ? 'bg-green-600 text-white'
                    : userPreferences.theme.isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Share size={16} />
                <span>Share</span>
              </button>
            </div>

            {/* Instructions */}
            <div className={`p-3 rounded-lg ${
              userPreferences.theme.isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <h4 className={`font-medium mb-2 ${
                userPreferences.theme.isDark ? 'text-white' : 'text-gray-900'
              }`}>
                How it works:
              </h4>
              <ol className={`text-sm space-y-1 ${
                userPreferences.theme.isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <li>1. Share your referral link with friends</li>
                <li>2. They sign up using your link</li>
                <li>3. They confirm their email address</li>
                <li>4. You both get credits!</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}