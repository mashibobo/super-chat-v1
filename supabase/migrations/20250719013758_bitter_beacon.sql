/*
  # Initial Schema for Anonymous Chat Application

  1. New Tables
    - `users` - User accounts with credits system
    - `messages` - Private and room messages
    - `chat_rooms` - Chat rooms with privacy levels
    - `room_members` - Room membership tracking
    - `confessions` - Anonymous confessions
    - `confession_comments` - Comments on confessions
    - `confession_likes` - Likes on confessions and comments
    - `friend_requests` - Friend request system
    - `user_preferences` - User settings and preferences
    - `referral_links` - Referral system for credits

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure private messaging and room access
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  credits integer DEFAULT 100,
  is_online boolean DEFAULT false,
  last_seen timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES users(id) ON DELETE CASCADE,
  room_id uuid,
  content text NOT NULL,
  message_type text DEFAULT 'text',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id OR
    (room_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM room_members 
      WHERE room_id = messages.room_id AND user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Chat rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  creator_id uuid REFERENCES users(id) ON DELETE CASCADE,
  is_private boolean DEFAULT false,
  is_super_secret boolean DEFAULT false,
  password_hash text,
  room_id text UNIQUE,
  member_limit integer DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public rooms are visible to all"
  ON chat_rooms
  FOR SELECT
  TO authenticated
  USING (NOT is_private AND NOT is_super_secret);

CREATE POLICY "Private rooms visible to members"
  ON chat_rooms
  FOR SELECT
  TO authenticated
  USING (
    is_private AND NOT is_super_secret AND EXISTS (
      SELECT 1 FROM room_members 
      WHERE room_id = chat_rooms.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Super secret rooms visible to members only"
  ON chat_rooms
  FOR SELECT
  TO authenticated
  USING (
    is_super_secret AND EXISTS (
      SELECT 1 FROM room_members 
      WHERE room_id = chat_rooms.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create rooms"
  ON chat_rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

-- Room members table
CREATE TABLE IF NOT EXISTS room_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id uuid REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  is_admin boolean DEFAULT false,
  is_banned boolean DEFAULT false,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(room_id, user_id)
);

ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Room members can read membership"
  ON room_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM room_members rm 
      WHERE rm.room_id = room_members.room_id AND rm.user_id = auth.uid()
    )
  );

-- Confessions table
CREATE TABLE IF NOT EXISTS confessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  author_id uuid REFERENCES users(id) ON DELETE CASCADE,
  likes_count integer DEFAULT 0,
  is_edited boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE confessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Confessions are public"
  ON confessions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create confessions"
  ON confessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can edit own confessions"
  ON confessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own confessions"
  ON confessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Confession comments table
CREATE TABLE IF NOT EXISTS confession_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  confession_id uuid REFERENCES confessions(id) ON DELETE CASCADE,
  author_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE confession_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are public"
  ON confession_comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON confession_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Confession likes table
CREATE TABLE IF NOT EXISTS confession_likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  confession_id uuid REFERENCES confessions(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES confession_comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, confession_id),
  UNIQUE(user_id, comment_id),
  CHECK (
    (confession_id IS NOT NULL AND comment_id IS NULL) OR
    (confession_id IS NULL AND comment_id IS NOT NULL)
  )
);

ALTER TABLE confession_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their likes"
  ON confession_likes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Friend requests table
CREATE TABLE IF NOT EXISTS friend_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);

ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their friend requests"
  ON friend_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send friend requests"
  ON friend_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update received requests"
  ON friend_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  theme_dark boolean DEFAULT false,
  font_size text DEFAULT 'medium',
  language text DEFAULT 'en',
  notifications_messages boolean DEFAULT true,
  notifications_friend_requests boolean DEFAULT true,
  notifications_confessions boolean DEFAULT true,
  notifications_admin boolean DEFAULT true,
  privacy_show_online boolean DEFAULT true,
  privacy_allow_friend_requests boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Referral links table
CREATE TABLE IF NOT EXISTS referral_links (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  total_earned integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE referral_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their referral links"
  ON referral_links
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Referral uses table
CREATE TABLE IF NOT EXISTS referral_uses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_link_id uuid REFERENCES referral_links(id) ON DELETE CASCADE,
  used_by_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  credits_awarded integer DEFAULT 250,
  created_at timestamptz DEFAULT now(),
  UNIQUE(referral_link_id, used_by_user_id)
);

ALTER TABLE referral_uses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referral uses are visible to link owner"
  ON referral_uses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM referral_links 
      WHERE id = referral_link_id AND user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id, created_at);
CREATE INDEX IF NOT EXISTS idx_confessions_category ON confessions(category, created_at);
CREATE INDEX IF NOT EXISTS idx_confessions_author ON confessions(author_id, created_at);
CREATE INDEX IF NOT EXISTS idx_room_members_room ON room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_room_members_user ON room_members(user_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON chat_rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_confessions_updated_at BEFORE UPDATE ON confessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_friend_requests_updated_at BEFORE UPDATE ON friend_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();