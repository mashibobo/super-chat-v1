import { useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useApp } from '../context/AppContext';
import { Message } from '../types';

export function useRealTimeMessages() {
  const { socket } = useSocket();
  const { addMessage, addRoomMessage, updateUserOnlineStatus, currentUser } = useApp();

  // Handle incoming private messages
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

  // Handle incoming room messages
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

  // Handle user status updates
  const handleUserStatusUpdate = useCallback(({ userId, isOnline, lastSeen }: {
    userId: string;
    isOnline: boolean;
    lastSeen?: string;
  }) => {
    updateUserOnlineStatus(userId, isOnline, lastSeen);
  }, [updateUserOnlineStatus]);

  // Handle typing indicators
  const handleTypingIndicator = useCallback(({ userId, isTyping, conversationId }: {
    userId: string;
    isTyping: boolean;
    conversationId: string;
  }) => {
    // Implement typing indicator logic
    console.log(`User ${userId} is ${isTyping ? 'typing' : 'not typing'} in ${conversationId}`);
  }, []);

  // Handle message delivery confirmations
  const handleMessageDelivered = useCallback(({ messageId, deliveredAt }: {
    messageId: string;
    deliveredAt: string;
  }) => {
    // Update message delivery status
    console.log(`Message ${messageId} delivered at ${deliveredAt}`);
  }, []);

  // Handle message read confirmations
  const handleMessageRead = useCallback(({ messageId, readAt }: {
    messageId: string;
    readAt: string;
  }) => {
    // Update message read status
    console.log(`Message ${messageId} read at ${readAt}`);
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Set up event listeners
    socket.on('new-private-message', handlePrivateMessage);
    socket.on('new-room-message', handleRoomMessage);
    socket.on('user-status-update', handleUserStatusUpdate);
    socket.on('user-typing', handleTypingIndicator);
    socket.on('message-delivered', handleMessageDelivered);
    socket.on('message-read', handleMessageRead);

    // Handle connection events
    socket.on('connect', () => {
      console.log('Connected to server');
      if (currentUser) {
        socket.emit('user-online', currentUser.id);
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off('new-private-message', handlePrivateMessage);
      socket.off('new-room-message', handleRoomMessage);
      socket.off('user-status-update', handleUserStatusUpdate);
      socket.off('user-typing', handleTypingIndicator);
      socket.off('message-delivered', handleMessageDelivered);
      socket.off('message-read', handleMessageRead);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
    };
  }, [
    socket,
    currentUser,
    handlePrivateMessage,
    handleRoomMessage,
    handleUserStatusUpdate,
    handleTypingIndicator,
    handleMessageDelivered,
    handleMessageRead,
  ]);

  // Send private message
  const sendPrivateMessage = useCallback((receiverId: string, content: string) => {
    if (!socket || !currentUser) return;

    const messageData = {
      receiverId,
      content,
      senderId: currentUser.id,
      senderUsername: currentUser.username,
      timestamp: new Date().toISOString(),
    };

    socket.emit('send-private-message', messageData);
  }, [socket, currentUser]);

  // Send room message
  const sendRoomMessage = useCallback((roomId: string, content: string) => {
    if (!socket || !currentUser) return;

    const messageData = {
      roomId,
      content,
      senderId: currentUser.id,
      senderUsername: currentUser.username,
      timestamp: new Date().toISOString(),
    };

    socket.emit('send-room-message', messageData);
  }, [socket, currentUser]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean) => {
    if (!socket || !currentUser) return;

    socket.emit('typing', {
      conversationId,
      userId: currentUser.id,
      isTyping,
    });
  }, [socket, currentUser]);

  // Join room
  const joinRoom = useCallback((roomId: string) => {
    if (!socket) return;
    socket.emit('join-room', roomId);
  }, [socket]);

  // Leave room
  const leaveRoom = useCallback((roomId: string) => {
    if (!socket) return;
    socket.emit('leave-room', roomId);
  }, [socket]);

  return {
    sendPrivateMessage,
    sendRoomMessage,
    sendTypingIndicator,
    joinRoom,
    leaveRoom,
    isConnected: socket?.connected || false,
  };
}