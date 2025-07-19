import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { Message } from '../types';

export function useSupabaseRealtime() {
  const { currentUser, addMessage, addRoomMessage, updateUserOnlineStatus } = useApp();

  // Subscribe to real-time messages
  useEffect(() => {
    if (!currentUser) return;

    // Subscribe to private messages
    const privateMessagesChannel = supabase
      .channel('private-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUser.id}`,
        },
        (payload) => {
          const newMessage: Message = {
            id: payload.new.id,
            senderId: payload.new.sender_id,
            receiverId: payload.new.receiver_id,
            content: payload.new.content,
            type: payload.new.message_type as 'text' | 'image',
            timestamp: payload.new.created_at,
            isRead: payload.new.is_read,
          };
          
          addMessage(newMessage);
          
          // Show notification
          if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('New message', {
              body: newMessage.content,
              icon: '/favicon.ico',
            });
          }
        }
      )
      .subscribe();

    // Subscribe to room messages for rooms user is in
    const roomMessagesChannel = supabase
      .channel('room-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'room_id=neq.null',
        },
        (payload) => {
          const newMessage: Message = {
            id: payload.new.id,
            senderId: payload.new.sender_id,
            roomId: payload.new.room_id,
            content: payload.new.content,
            type: payload.new.message_type as 'text' | 'image',
            timestamp: payload.new.created_at,
            isRead: payload.new.is_read,
          };
          
          addRoomMessage(newMessage);
        }
      )
      .subscribe();

    // Subscribe to user presence
    const presenceChannel = supabase
      .channel('user-presence')
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        // Handle presence updates
        Object.keys(state).forEach(userId => {
          const userPresence = state[userId][0];
          updateUserOnlineStatus(userId, userPresence.online, userPresence.last_seen);
        });
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        updateUserOnlineStatus(key, true);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        updateUserOnlineStatus(key, false, new Date().toISOString());
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track current user presence
          await presenceChannel.track({
            user_id: currentUser.id,
            username: currentUser.username,
            online: true,
            last_seen: new Date().toISOString(),
          });
        }
      });

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(privateMessagesChannel);
      supabase.removeChannel(roomMessagesChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [currentUser, addMessage, addRoomMessage, updateUserOnlineStatus]);

  // Send private message
  const sendPrivateMessage = useCallback(async (receiverId: string, content: string) => {
    if (!currentUser) return false;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUser.id,
          receiver_id: receiverId,
          content,
          message_type: 'text',
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending private message:', error);
      return false;
    }
  }, [currentUser]);

  // Send room message
  const sendRoomMessage = useCallback(async (roomId: string, content: string) => {
    if (!currentUser) return false;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUser.id,
          room_id: roomId,
          content,
          message_type: 'text',
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending room message:', error);
      return false;
    }
  }, [currentUser]);

  // Get conversation messages
  const getConversationMessages = useCallback(async (userId: string, limit = 50) => {
    if (!currentUser) return [];

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(username),
          receiver:users!receiver_id(username)
        `)
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      return [];
    }
  }, [currentUser]);

  // Get room messages
  const getRoomMessages = useCallback(async (roomId: string, limit = 50) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(username)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching room messages:', error);
      return [];
    }
  }, []);

  return {
    sendPrivateMessage,
    sendRoomMessage,
    getConversationMessages,
    getRoomMessages,
  };
}