import { useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { Message } from '../types';

export function useRealTimeMessages() {
  const { addMessage, addRoomMessage, updateUserOnlineStatus, currentUser } = useApp();

  // Handle incoming private messages (will be replaced with Supabase realtime)
  const handlePrivateMessage = useCallback((message: Message) => {
    addMessage(message);
    
    // Show browser notification if app is in background
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`New message from ${message.senderUsername || 'Anonymous'}`, {
        body: message.content,
        icon: '/favicon.ico',
        tag: `message-${message.id}`,
      });
    }
  }, [addMessage]);

  // Handle incoming room messages (will be replaced with Supabase realtime)
  const handleRoomMessage = useCallback((message: Message) => {
    addRoomMessage(message);
    
    // Show notification for room messages if mentioned
    if (document.hidden && message.content.includes(`@${currentUser?.username}`)) {
      new Notification(`You were mentioned in ${message.roomName || 'a room'}`, {
        body: message.content,
        icon: '/favicon.ico',
        tag: `room-mention-${message.id}`,
      });
    }
  }, [addRoomMessage, currentUser?.username]);

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Send private message (will be replaced with Supabase)
  const sendPrivateMessage = useCallback((receiverId: string, content: string) => {
    if (!currentUser) return;
    console.log('Sending private message:', { receiverId, content });
  }, [currentUser]);

  // Send room message (will be replaced with Supabase)
  const sendRoomMessage = useCallback((roomId: string, content: string) => {
    if (!currentUser) return;
    console.log('Sending room message:', { roomId, content });
  }, [currentUser]);

  // Send typing indicator (will be replaced with Supabase)
  const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean) => {
    if (!currentUser) return;
    console.log('Typing indicator:', { conversationId, isTyping });
  }, [currentUser]);

  // Join room (will be replaced with Supabase)
  const joinRoom = useCallback((roomId: string) => {
    console.log('Joining room:', roomId);
  }, []);

  // Leave room (will be replaced with Supabase)
  const leaveRoom = useCallback((roomId: string) => {
    console.log('Leaving room:', roomId);
  }, []);

  return {
    sendPrivateMessage,
    sendRoomMessage,
    sendTypingIndicator,
    joinRoom,
    leaveRoom,
    isConnected: true, // Will be replaced with actual Supabase connection status
  };
}