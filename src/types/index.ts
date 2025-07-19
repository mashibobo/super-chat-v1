export interface User {
  id: string;
  username: string;
  email: string;
  credits: number;
  joinDate: string;
  isOnline: boolean;
  lastSeen?: string;
  profilePicture?: string;
  isBlocked?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  roomId?: string;
  content: string;
  type: 'text' | 'image';
  timestamp: string;
  isRead: boolean;
  imageUrl?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  category: RoomCategory;
  creatorId: string;
  isPrivate: boolean;
  isSuperSecret: boolean;
  password?: string;
  roomId?: string;
  memberLimit: number;
  memberCount: number;
  onlineCount: number;
  members: User[];
  admins: string[];
  bannedUsers: string[];
  createdAt: string;
  lastActivity: string;
}

export type RoomCategory = 'general' | 'gaming' | 'study' | 'work' | 'entertainment' | 'support' | 'other';

export interface Confession {
  id: string;
  title: string;
  content: string;
  category: ConfessionCategory;
  authorId: string;
  authorUsername: string;
  timestamp: string;
  likes: number;
  comments: ConfessionComment[];
  isLiked: boolean;
  isSaved: boolean;
  isEdited: boolean;
}

export interface ConfessionComment {
  id: string;
  confessionId: string;
  authorId: string;
  authorUsername: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  mentions: string[];
}

export type ConfessionCategory = 'work' | 'family' | 'school' | 'relationships' | 'health' | 'entertainment' | 'other';

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  senderUsername: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'friend_request' | 'message' | 'admin' | 'system' | 'referral_bonus';
  title: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface ReferralLink {
  id: string;
  userId: string;
  code: string;
  createdAt: string;
  usedBy: string[];
  totalEarned: number;
}

export interface ThemeSettings {
  isDark: boolean;
  fontSize: 'small' | 'medium' | 'large';
  language: string;
}

export interface UserPreferences {
  theme: ThemeSettings;
  notifications: {
    messages: boolean;
    friendRequests: boolean;
    confessions: boolean;
    admin: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    allowFriendRequests: boolean;
  };
}