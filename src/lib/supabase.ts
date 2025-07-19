import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL and Anon Key are required. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database types (will be generated from Supabase)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string;
          credits: number;
          created_at: string;
          updated_at: string;
          is_online: boolean;
          last_seen: string | null;
        };
        Insert: {
          id?: string;
          username: string;
          email: string;
          credits?: number;
          created_at?: string;
          updated_at?: string;
          is_online?: boolean;
          last_seen?: string | null;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          credits?: number;
          created_at?: string;
          updated_at?: string;
          is_online?: boolean;
          last_seen?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string | null;
          room_id: string | null;
          content: string;
          message_type: string;
          created_at: string;
          is_read: boolean;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id?: string | null;
          room_id?: string | null;
          content: string;
          message_type?: string;
          created_at?: string;
          is_read?: boolean;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string | null;
          room_id?: string | null;
          content?: string;
          message_type?: string;
          created_at?: string;
          is_read?: boolean;
        };
      };
      chat_rooms: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          creator_id: string;
          is_private: boolean;
          is_super_secret: boolean;
          password_hash: string | null;
          room_id: string | null;
          member_limit: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category: string;
          creator_id: string;
          is_private?: boolean;
          is_super_secret?: boolean;
          password_hash?: string | null;
          room_id?: string | null;
          member_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string;
          creator_id?: string;
          is_private?: boolean;
          is_super_secret?: boolean;
          password_hash?: string | null;
          room_id?: string | null;
          member_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      confessions: {
        Row: {
          id: string;
          title: string;
          content: string;
          category: string;
          author_id: string;
          created_at: string;
          updated_at: string;
          likes_count: number;
          is_edited: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          category: string;
          author_id: string;
          created_at?: string;
          updated_at?: string;
          likes_count?: number;
          is_edited?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          category?: string;
          author_id?: string;
          created_at?: string;
          updated_at?: string;
          likes_count?: number;
          is_edited?: boolean;
        };
      };
    };
  };
}