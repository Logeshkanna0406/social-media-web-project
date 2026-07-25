import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType>({ socket: null, onlineUsers: [] });

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    const newSocket = io('/', {
      autoConnect: true,
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    if (user?.id) {
      newSocket.emit('register_user', user.id);
    }

    newSocket.on('user_online_status', ({ userId, status }) => {
      setOnlineUsers(prev => {
        if (status === 'online' && !prev.includes(userId)) {
          return [...prev, userId];
        } else if (status === 'offline') {
          return prev.filter(id => id !== userId);
        }
        return prev;
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
