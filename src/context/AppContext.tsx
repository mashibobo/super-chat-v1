import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Message, ChatRoom, Confession, FriendRequest, Notification, UserPreferences, ReferralLink, RoomCategory } from '../types';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  messages: Message[];
  chatRooms: ChatRoom[];
  confessions: Confession[];
  friendRequests: FriendRequest[];
  notifications: Notification[];
  referralLinks: ReferralLink[];
  userPreferences: UserPreferences;
  
  // Auth functions
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Message functions
  sendMessage: (receiverId: string, content: string, type?: 'text' | 'image') => void;
  sendRoomMessage: (roomId: string, content: string) => void;
  
  // Friend functions
  sendFriendRequest: (userId: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  declineFriendRequest: (requestId: string) => void;
  
  // Room functions
  createRoom: (name: string, category: RoomCategory, isPrivate: boolean, isSuperSecret: boolean, password?: string, roomId?: string) => boolean;
  joinRoom: (roomId: string, password?: string) => boolean;
  joinSuperSecretRoom: (roomId: string, password: string) => boolean;
  kickUserFromRoom: (roomId: string, userId: string) => void;
  banUserFromRoom: (roomId: string, userId: string) => void;
  makeUserAdmin: (roomId: string, userId: string) => void;
  
  // Confession functions
  createConfession: (title: string, content: string, category: string) => void;
  editConfession: (confessionId: string, title: string, content: string) => void;
  deleteConfession: (confessionId: string) => void;
  likeConfession: (confessionId: string) => void;
  saveConfession: (confessionId: string) => void;
  addComment: (confessionId: string, content: string) => void;
  likeComment: (confessionId: string, commentId: string) => void;
  addFriendByUsername: (username: string) => boolean;
  
  // Referral functions
  generateReferralLink: () => string;
  useReferralCode: (code: string) => boolean;
  
  // Notification functions
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Settings
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  updateCredits: (amount: number) => void;
  
  // Real-time message functions
  addMessage: (message: Message) => void;
  addRoomMessage: (message: Message) => void;
  updateUserOnlineStatus: (userId: string, isOnline: boolean, lastSeen?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    username: 'current_user',
    email: 'user@example.com',
    credits: 150,
    joinDate: '2024-01-15',
    isOnline: true,
  },
  {
    id: '2',
    username: 'friend_user_1',
    email: 'friend1@example.com',
    credits: 75,
    joinDate: '2024-01-10',
    isOnline: true,
  },
  {
    id: '3',
    username: 'friend_user_2',
    email: 'friend2@example.com',
    credits: 200,
    joinDate: '2024-01-05',
    isOnline: false,
    lastSeen: '2024-01-20T10:30:00Z',
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '2',
    receiverId: '1',
    content: 'Hey! How are you doing?',
    type: 'text',
    timestamp: '2024-01-20T10:30:00Z',
    isRead: true,
  },
  {
    id: '2',
    senderId: '1',
    receiverId: '2',
    content: 'I\'m doing great! Thanks for asking 😊',
    type: 'text',
    timestamp: '2024-01-20T10:32:00Z',
    isRead: true,
  },
];

const mockChatRooms: ChatRoom[] = [
  {
    id: '1',
    name: 'General Chat',
    description: 'A place for general discussions',
    category: 'general',
    creatorId: '1',
    isPrivate: false,
    isSuperSecret: false,
    memberLimit: 100,
    memberCount: 25,
    onlineCount: 8,
    members: mockUsers,
    admins: ['1'],
    bannedUsers: [],
    createdAt: '2024-01-15T10:00:00Z',
    lastActivity: '2024-01-20T15:30:00Z',
  },
];

const mockConfessions: Confession[] = [
  {
    id: '1',
    title: 'Work Stress',
    content: 'I\'ve been feeling overwhelmed at work lately...',
    category: 'work',
    authorId: '2',
    authorUsername: 'friend_user_1',
    timestamp: '2024-01-20T14:30:00Z',
    likes: 5,
    comments: [],
    isLiked: false,
    isSaved: false,
    isEdited: false,
  },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(mockUsers[0]);
  const [users] = useState<User[]>(mockUsers);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(mockChatRooms);
  const [confessions, setConfessions] = useState<Confession[]>(mockConfessions);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    theme: {
      isDark: false,
      fontSize: 'medium',
      language: 'en',
    },
    notifications: {
      messages: true,
      friendRequests: true,
      confessions: true,
      admin: true,
    },
    privacy: {
      showOnlineStatus: true,
      allowFriendRequests: true,
    },
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    // Mock registration
    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      credits: 100,
      joinDate: new Date().toISOString(),
      isOnline: true,
    };
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const sendMessage = (receiverId: string, content: string, type: 'text' | 'image' = 'text') => {
    if (!currentUser || currentUser.credits < 1) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId,
      content,
      type,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    
    setMessages(prev => [...prev, newMessage]);
    updateCredits(-1);
  };

  const sendRoomMessage = (roomId: string, content: string) => {
    if (!currentUser || currentUser.credits < 1) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      roomId,
      content,
      type: 'text',
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    
    setMessages(prev => [...prev, newMessage]);
    updateCredits(-1);
  };

  const sendFriendRequest = (userId: string) => {
    if (!currentUser) return;
    
    const newRequest: FriendRequest = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: userId,
      senderUsername: currentUser.username,
      status: 'pending',
      timestamp: new Date().toISOString(),
    };
    
    setFriendRequests(prev => [...prev, newRequest]);
  };

  const acceptFriendRequest = (requestId: string) => {
    setFriendRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status: 'accepted' as const } : req
      )
    );
  };

  const declineFriendRequest = (requestId: string) => {
    setFriendRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status: 'declined' as const } : req
      )
    );
  };

  const createRoom = (name: string, category: RoomCategory, isPrivate: boolean, isSuperSecret: boolean, password?: string, roomId?: string): boolean => {
    if (!currentUser) return false;
    
    let cost = 50; // Public room
    if (isPrivate && !isSuperSecret) cost = 25; // Private room
    if (isSuperSecret) cost = 150; // Super secret room
    
    if (currentUser.credits < cost) return false;
    
    const newRoom: ChatRoom = {
      id: Date.now().toString(),
      name,
      description: '',
      category,
      creatorId: currentUser.id,
      isPrivate,
      isSuperSecret,
      password,
      roomId: isSuperSecret ? (roomId || generateRoomId()) : undefined,
      memberLimit: 100,
      memberCount: 1,
      onlineCount: 1,
      members: [currentUser],
      admins: [currentUser.id],
      bannedUsers: [],
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    };
    
    setChatRooms(prev => [...prev, newRoom]);
    updateCredits(-cost);
    return true;
  };

  const generateRoomId = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const joinRoom = (roomId: string, password?: string): boolean => {
    // Mock room joining
    return true;
  };

  const joinSuperSecretRoom = (roomId: string, password: string): boolean => {
    const room = chatRooms.find(r => r.roomId === roomId && r.isSuperSecret);
    if (!room || !currentUser) return false;
    
    if (room.password !== password) return false;
    if (room.bannedUsers.includes(currentUser.id)) return false;
    if (room.members.some(m => m.id === currentUser.id)) return true;
    
    setChatRooms(prev => prev.map(r => 
      r.id === room.id 
        ? { ...r, members: [...r.members, currentUser], memberCount: r.memberCount + 1, onlineCount: r.onlineCount + 1 }
        : r
    ));
    
    return true;
  };

  const kickUserFromRoom = (roomId: string, userId: string) => {
    if (!currentUser) return;
    
    setChatRooms(prev => prev.map(room => {
      if (room.id === roomId && (room.creatorId === currentUser.id || room.admins.includes(currentUser.id))) {
        return {
          ...room,
          members: room.members.filter(m => m.id !== userId),
          memberCount: room.memberCount - 1,
          onlineCount: Math.max(0, room.onlineCount - 1),
        };
      }
      return room;
    }));
  };

  const banUserFromRoom = (roomId: string, userId: string) => {
    if (!currentUser) return;
    
    setChatRooms(prev => prev.map(room => {
      if (room.id === roomId && (room.creatorId === currentUser.id || room.admins.includes(currentUser.id))) {
        return {
          ...room,
          members: room.members.filter(m => m.id !== userId),
          bannedUsers: [...room.bannedUsers, userId],
          memberCount: room.memberCount - 1,
          onlineCount: Math.max(0, room.onlineCount - 1),
        };
      }
      return room;
    }));
  };

  const makeUserAdmin = (roomId: string, userId: string) => {
    if (!currentUser) return;
    
    setChatRooms(prev => prev.map(room => {
      if (room.id === roomId && room.creatorId === currentUser.id) {
        return {
          ...room,
          admins: room.admins.includes(userId) 
            ? room.admins.filter(id => id !== userId)
            : [...room.admins, userId],
        };
      }
      return room;
    }));
  };

  const createConfession = (title: string, content: string, category: string) => {
    if (!currentUser) return;
    
    const newConfession: Confession = {
      id: Date.now().toString(),
      title,
      content,
      category: category as any,
      authorId: currentUser.id,
      authorUsername: currentUser.username,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: [],
      isLiked: false,
      isSaved: false,
      isEdited: false,
    };
    
    setConfessions(prev => [...prev, newConfession]);
  };

  const editConfession = (confessionId: string, title: string, content: string) => {
    if (!currentUser) return;
    
    setConfessions(prev => prev.map(conf => 
      conf.id === confessionId && conf.authorId === currentUser.id
        ? { ...conf, title, content, isEdited: true }
        : conf
    ));
  };

  const deleteConfession = (confessionId: string) => {
    if (!currentUser) return;
    
    setConfessions(prev => prev.filter(conf => 
      !(conf.id === confessionId && conf.authorId === currentUser.id)
    ));
  };

  const likeConfession = (confessionId: string) => {
    setConfessions(prev => 
      prev.map(conf => 
        conf.id === confessionId 
          ? { ...conf, likes: conf.isLiked ? conf.likes - 1 : conf.likes + 1, isLiked: !conf.isLiked }
          : conf
      )
    );
  };

  const saveConfession = (confessionId: string) => {
    setConfessions(prev => 
      prev.map(conf => 
        conf.id === confessionId ? { ...conf, isSaved: !conf.isSaved } : conf
      )
    );
  };

  const addComment = (confessionId: string, content: string) => {
    if (!currentUser) return;
    
    // Extract mentions from content
    const mentions = content.match(/@(\w+)/g)?.map(mention => mention.slice(1)) || [];
    
    const newComment = {
      id: Date.now().toString(),
      confessionId,
      authorId: currentUser.id,
      authorUsername: currentUser.username,
      content,
      timestamp: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      mentions,
    };
    
    setConfessions(prev => prev.map(conf => 
      conf.id === confessionId 
        ? { ...conf, comments: [...conf.comments, newComment] }
        : conf
    ));
  };

  const likeComment = (confessionId: string, commentId: string) => {
    setConfessions(prev => prev.map(conf => 
      conf.id === confessionId 
        ? {
            ...conf,
            comments: conf.comments.map(comment =>
              comment.id === commentId
                ? {
                    ...comment,
                    likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                    isLiked: !comment.isLiked
                  }
                : comment
            )
          }
        : conf
    ));
  };

  const addFriendByUsername = (username: string): boolean => {
    if (!currentUser) return false;
    
    const targetUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!targetUser || targetUser.id === currentUser.id) return false;
    
    // Check if request already exists
    const existingRequest = friendRequests.find(r => 
      r.senderId === currentUser.id && r.receiverId === targetUser.id
    );
    if (existingRequest) return false;
    
    sendFriendRequest(targetUser.id);
    return true;
  };

  const generateReferralLink = (): string => {
    if (!currentUser) return '';
    
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const newReferralLink: ReferralLink = {
      id: Date.now().toString(),
      userId: currentUser.id,
      code,
      createdAt: new Date().toISOString(),
      usedBy: [],
      totalEarned: 0,
    };
    
    setReferralLinks(prev => [...prev, newReferralLink]);
    return `${window.location.origin}/invite/${code}`;
  };

  const useReferralCode = (code: string): boolean => {
    if (!currentUser) return false;
    
    const referralLink = referralLinks.find(r => r.code === code);
    if (!referralLink || referralLink.usedBy.includes(currentUser.id)) return false;
    
    // Award credits to referrer
    const referrer = users.find(u => u.id === referralLink.userId);
    if (referrer) {
      // Update referrer credits (mock)
      setReferralLinks(prev => prev.map(r => 
        r.id === referralLink.id 
          ? { ...r, usedBy: [...r.usedBy, currentUser.id], totalEarned: r.totalEarned + 250 }
          : r
      ));
      
      // Add notification to referrer
      const notification: Notification = {
        id: Date.now().toString(),
        userId: referralLink.userId,
        type: 'referral_bonus',
        title: 'Referral Bonus Earned!',
        content: `Congratulations! You earned 250 credits because ${currentUser.username} joined using your referral link.`,
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      
      setNotifications(prev => [...prev, notification]);
      return true;
    }
    
    return false;
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    ));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
  };

  const updatePreferences = (preferences: Partial<UserPreferences>) => {
    setUserPreferences(prev => ({ ...prev, ...preferences }));
  };

  const updateCredits = (amount: number) => {
    if (!currentUser) return;
    setCurrentUser(prev => prev ? { ...prev, credits: Math.max(0, prev.credits + amount) } : null);
  };
  
  // Real-time message functions
  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };
  
  const addRoomMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };
  
  const updateUserOnlineStatus = (userId: string, isOnline: boolean, lastSeen?: string) => {
    // Update user online status in the users array
    // This would typically update the database in a real implementation
    console.log(`User ${userId} is now ${isOnline ? 'online' : 'offline'}${lastSeen ? ` (last seen: ${lastSeen})` : ''}`);
  };

  const value: AppContextType = {
    currentUser,
    users,
    messages,
    chatRooms,
    confessions,
    friendRequests,
    notifications,
    referralLinks,
    userPreferences,
    login,
    register,
    logout,
    sendMessage,
    sendRoomMessage,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    createRoom,
    joinRoom,
    joinSuperSecretRoom,
    kickUserFromRoom,
    banUserFromRoom,
    makeUserAdmin,
    createConfession,
    editConfession,
    deleteConfession,
    likeConfession,
    saveConfession,
    addComment,
    likeComment,
    addFriendByUsername,
    generateReferralLink,
    useReferralCode,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    updatePreferences,
    updateCredits,
    addMessage,
    addRoomMessage,
    updateUserOnlineStatus,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}