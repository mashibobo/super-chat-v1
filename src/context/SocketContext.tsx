import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useApp } from './AppContext';

interface SocketContextType {
  isConnected: boolean;
  connectionError: string | null;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  connectionError: null,
});

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { currentUser } = useApp();

  useEffect(() => {
    if (!currentUser) {
      setIsConnected(false);
      return;
    }

    // Simulate connection for now - will be replaced with Supabase realtime
    setIsConnected(true);
    setConnectionError(null);

    return () => {
      setIsConnected(false);
    };
  }, [currentUser]);

  const value: SocketContextType = {
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