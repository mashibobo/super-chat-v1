# Real-Time Chat Implementation Plan

## 1. Backend Technology Stack

### Recommended: Node.js + Socket.IO + Express
```javascript
// Server setup example
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join user to their personal room
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
  });
  
  // Handle private messages
  socket.on('send-private-message', (data) => {
    const { receiverId, message, senderId } = data;
    
    // Save to database
    saveMessage(data);
    
    // Send to receiver
    socket.to(`user-${receiverId}`).emit('new-private-message', {
      id: generateId(),
      senderId,
      content: message,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle room messages
  socket.on('join-room', (roomId) => {
    socket.join(`room-${roomId}`);
  });
  
  socket.on('send-room-message', (data) => {
    const { roomId, message, senderId } = data;
    
    // Save to database
    saveRoomMessage(data);
    
    // Broadcast to room
    socket.to(`room-${roomId}`).emit('new-room-message', {
      id: generateId(),
      senderId,
      content: message,
      timestamp: new Date().toISOString()
    });
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
```

## 2. Database Schema (PostgreSQL/MongoDB)

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  credits INTEGER DEFAULT 100,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  room_id UUID REFERENCES chat_rooms(id),
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast message retrieval
CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id, created_at);
CREATE INDEX idx_messages_room ON messages(room_id, created_at);
```

### Chat Rooms Table
```sql
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  creator_id UUID REFERENCES users(id),
  is_private BOOLEAN DEFAULT false,
  is_super_secret BOOLEAN DEFAULT false,
  password_hash VARCHAR(255),
  room_id VARCHAR(8) UNIQUE,
  member_limit INTEGER DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 3. Frontend Socket.IO Integration

### Install Dependencies
```bash
npm install socket.io-client
```

### Socket Context
```typescript
// src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useApp } from './AppContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { currentUser } = useApp();

  useEffect(() => {
    if (currentUser) {
      const newSocket = io('http://localhost:3001', {
        auth: {
          userId: currentUser.id,
          token: localStorage.getItem('authToken')
        }
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        newSocket.emit('join-user-room', currentUser.id);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [currentUser]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
```

## 4. Message Handling Hook

```typescript
// src/hooks/useRealTimeMessages.ts
import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useApp } from '../context/AppContext';

export function useRealTimeMessages() {
  const { socket } = useSocket();
  const { addMessage, addRoomMessage, updateUserOnlineStatus } = useApp();

  useEffect(() => {
    if (!socket) return;

    // Listen for private messages
    socket.on('new-private-message', (message) => {
      addMessage(message);
      // Show notification if app is in background
      if (document.hidden) {
        new Notification(`New message from ${message.senderUsername}`, {
          body: message.content,
          icon: '/icon.png'
        });
      }
    });

    // Listen for room messages
    socket.on('new-room-message', (message) => {
      addRoomMessage(message);
    });

    // Listen for user status updates
    socket.on('user-status-update', ({ userId, isOnline }) => {
      updateUserOnlineStatus(userId, isOnline);
    });

    // Listen for typing indicators
    socket.on('user-typing', ({ userId, isTyping }) => {
      // Handle typing indicator
    });

    return () => {
      socket.off('new-private-message');
      socket.off('new-room-message');
      socket.off('user-status-update');
      socket.off('user-typing');
    };
  }, [socket, addMessage, addRoomMessage, updateUserOnlineStatus]);
}
```

## 5. Performance Optimizations

### Message Pagination
```typescript
// Implement infinite scrolling for message history
const useMessagePagination = (conversationId: string) => {
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadMoreMessages = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/messages/${conversationId}?before=${messages[0]?.id}&limit=20`);
      const newMessages = await response.json();
      
      if (newMessages.length < 20) {
        setHasMore(false);
      }
      
      setMessages(prev => [...newMessages, ...prev]);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  return { messages, loadMoreMessages, hasMore, loading };
};
```

### Message Caching
```typescript
// Use React Query for message caching
import { useQuery, useQueryClient } from 'react-query';

const useMessages = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useQuery(
    ['messages', conversationId],
    () => fetchMessages(conversationId),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    }
  );
};
```

## 6. Security Considerations

### Authentication & Authorization
```typescript
// JWT token validation middleware
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
};

io.use(authenticateSocket);
```

### Rate Limiting
```typescript
// Implement rate limiting for messages
const rateLimiter = new Map();

const checkRateLimit = (userId) => {
  const now = Date.now();
  const userLimit = rateLimiter.get(userId) || { count: 0, resetTime: now + 60000 };
  
  if (now > userLimit.resetTime) {
    userLimit.count = 0;
    userLimit.resetTime = now + 60000;
  }
  
  if (userLimit.count >= 30) { // 30 messages per minute
    return false;
  }
  
  userLimit.count++;
  rateLimiter.set(userId, userLimit);
  return true;
};
```

## 7. Deployment Architecture

### Recommended Stack:
- **Frontend**: Vercel/Netlify
- **Backend**: Railway/Render/DigitalOcean
- **Database**: Supabase/PlanetScale/Railway PostgreSQL
- **Redis**: For session management and caching
- **CDN**: Cloudflare for static assets

### Scaling Considerations:
1. **Horizontal Scaling**: Use Redis adapter for Socket.IO
2. **Database Optimization**: Read replicas, connection pooling
3. **Caching**: Redis for frequently accessed data
4. **Load Balancing**: Nginx or cloud load balancers

## 8. Monitoring & Analytics

```typescript
// Add performance monitoring
socket.on('message-sent', (data) => {
  // Track message delivery time
  const startTime = Date.now();
  
  socket.emit('message-delivered', data, (ack) => {
    const deliveryTime = Date.now() - startTime;
    analytics.track('message_delivery_time', { time: deliveryTime });
  });
});
```

## Next Steps

1. Set up Socket.IO server with Express
2. Implement user authentication with JWT
3. Create database schema and migrations
4. Integrate Socket.IO client in React app
5. Implement real-time message handling
6. Add typing indicators and online status
7. Implement message persistence and history
8. Add push notifications for mobile
9. Optimize for performance and scalability
10. Deploy and monitor

This architecture will provide a robust, scalable real-time chat experience similar to WhatsApp while maintaining the anonymous features of your application.