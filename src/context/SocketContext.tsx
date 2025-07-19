import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useApp } from './AppContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connectionError: null,
});

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { currentUser } = useApp();

  useEffect(() => {
    if (!currentUser) {
      // Disconnect socket if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001', {
      auth: {
        userId: currentUser.id,
        username: currentUser.username,
        token: localStorage.getItem('authToken') || 'mock-token',
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Connected to server:', newSocket.id);
      setIsConnected(true);
      setConnectionError(null);
      
      // Join user's personal room for private messages
      newSocket.emit('join-user-room', currentUser.id);
      
      // Update user online status
      newSocket.emit('user-online', {
        userId: currentUser.id,
        username: currentUser.username,
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server disconnected the client, manual reconnection needed
        newSocket.connect();
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔥 Connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts');
      setConnectionError(null);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('🔥 Reconnection error:', error);
      setConnectionError('Failed to reconnect to server');
    });

    newSocket.on('reconnect_failed', () => {
      console.error('💀 Failed to reconnect to server');
      setConnectionError('Unable to connect to server. Please check your internet connection.');
    });

    // Handle authentication errors
    newSocket.on('auth_error', (error) => {
      console.error('🔐 Authentication error:', error);
      setConnectionError('Authentication failed. Please log in again.');
      // Could trigger logout here
    });

    setSocket(newSocket);

    // Cleanup on unmount or user change
    return () => {
      console.log('🧹 Cleaning up socket connection');
      if (currentUser) {
        newSocket.emit('user-offline', currentUser.id);
      }
      newSocket.disconnect();
    };
  }, [currentUser]);

  // Handle page visibility changes to update online status
  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        socket.emit('user-away', currentUser.id);
      } else {
        socket.emit('user-online', {
          userId: currentUser.id,
          username: currentUser.username,
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [socket, currentUser]);

  // Handle beforeunload to notify server of user going offline
  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleBeforeUnload = () => {
      socket.emit('user-offline', currentUser.id);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [socket, currentUser]);

  const value: SocketContextType = {
    socket,
    isConnected,
    connectionError,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextType {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

// Connection status hook for UI components
export function useConnectionStatus() {
  const { isConnected, connectionError } = useSocket();
  
  return {
    isConnected,
    connectionError,
    status: connectionError ? 'error' : isConnected ? 'connected' : 'connecting',
  };
}