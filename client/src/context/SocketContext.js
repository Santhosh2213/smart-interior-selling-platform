import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import socketService from '../services/socketService';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    socketService.connect();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onOnlineUsers = (users) => setOnlineUsers(users);
    const onUserOnline = ({ userId, name, role }) => {
      setOnlineUsers(prev => {
        if (prev.find(u => u.userId === userId)) return prev;
        return [...prev, { userId, name, role }];
      });
    };
    const onUserOffline = ({ userId }) => {
      setOnlineUsers(prev => prev.filter(u => u.userId !== userId));
    };

    socketService.on('connect', onConnect);
    socketService.on('disconnect', onDisconnect);
    socketService.on('online-users', onOnlineUsers);
    socketService.on('user-online', onUserOnline);
    socketService.on('user-offline', onUserOffline);

    return () => {
      socketService.off('connect', onConnect);
      socketService.off('disconnect', onDisconnect);
      socketService.off('online-users', onOnlineUsers);
      socketService.off('user-online', onUserOnline);
      socketService.off('user-offline', onUserOffline);
      socketService.disconnect();
    };
  }, [isAuthenticated, user]);

  // Add this to see connection status
useEffect(() => {
  console.log('Socket connection status:', isConnected);
}, [isConnected]);

  // ── Helpers exposed to the rest of the app ──────────────────────────────
  const joinProjectRoom = useCallback((projectId) => {
    socketService.joinProjectRoom(projectId);
  }, []);

  const leaveProjectRoom = useCallback((projectId) => {
    socketService.leaveProjectRoom(projectId);
  }, []);

  const sendMessage = useCallback((recipientId, content, projectId = null) => {
    socketService.sendPrivateMessage(recipientId, content, projectId);
  }, []);

  const sendTyping = useCallback((recipientId, projectId, isTyping) => {
    socketService.sendTyping(recipientId, projectId, isTyping);
  }, []);

  const markAsRead = useCallback((projectId, senderId) => {
    socketService.markMessagesAsRead(projectId, senderId);
  }, []);

  const on = useCallback((event, cb) => socketService.on(event, cb), []);
  const off = useCallback((event, cb) => socketService.off(event, cb), []);
  const emit = useCallback((event, data) => socketService.emit(event, data), []);

  const isOnline = useCallback((userId) => {
    return onlineUsers.some(u => u.userId === userId);
  }, [onlineUsers]);

  return (
    <SocketContext.Provider value={{
      onlineUsers,
      isConnected,
      isOnline,
      joinProjectRoom,
      leaveProjectRoom,
      sendMessage,
      sendTyping,
      markAsRead,
      on,
      off,
      emit
    }}>
      {children}
    </SocketContext.Provider>
  );
};