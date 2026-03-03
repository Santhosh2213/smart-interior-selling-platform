import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import socketService from '../services/socketService';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to socket
      socketService.connect();

      // Set up listeners
      const handleConnect = () => {
        console.log('Socket connected');
        setIsConnected(true);
      };

      const handleDisconnect = () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      };

      const handleOnlineUsers = (users) => {
        setOnlineUsers(users);
      };

      const handleNotification = (notification) => {
        console.log('New notification:', notification);
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      };

      const handleUserStatusChange = ({ userId, status }) => {
        setOnlineUsers(prev => 
          prev.map(u => u.userId === userId ? { ...u, status } : u)
        );
      };

      // Register listeners
      socketService.on('connect', handleConnect);
      socketService.on('disconnect', handleDisconnect);
      socketService.on('online-users', handleOnlineUsers);
      socketService.on('notification', handleNotification);
      socketService.on('user-status-changed', handleUserStatusChange);

      return () => {
        // Clean up listeners
        socketService.off('connect', handleConnect);
        socketService.off('disconnect', handleDisconnect);
        socketService.off('online-users', handleOnlineUsers);
        socketService.off('notification', handleNotification);
        socketService.off('user-status-changed', handleUserStatusChange);
        socketService.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  // Function to listen for custom events
  const on = (event, callback) => {
    socketService.on(event, callback);
  };

  // Function to emit events
  const emit = (event, data) => {
    socketService.emit(event, data);
  };

  // Function to join a project room
  const joinProjectRoom = (projectId) => {
    socketService.joinProjectRoom(projectId);
  };

  // Function to leave a project room
  const leaveProjectRoom = (projectId) => {
    socketService.leaveProjectRoom(projectId);
  };

  // Function to send a private message
  const sendMessage = (recipientId, content, projectId = null) => {
    socketService.sendPrivateMessage(recipientId, content, projectId);
  };

  // Function to send a project message
  const sendProjectMessage = (projectId, content, recipients = []) => {
    socketService.sendChatMessage(projectId, content, recipients);
  };

  // Function to send typing indicator
  const sendTyping = (recipientId, projectId, isTyping) => {
    socketService.sendTyping(recipientId, projectId, isTyping);
  };

  // Function to mark messages as read
  const markAsRead = (messageIds, senderId) => {
    socketService.markMessagesAsRead(messageIds, senderId);
  };

  // Function to reset unread count
  const resetUnreadCount = () => {
    setUnreadCount(0);
  };

  const value = {
    onlineUsers,
    notifications,
    unreadCount,
    isConnected,
    joinProjectRoom,
    leaveProjectRoom,
    sendMessage,
    sendProjectMessage,
    sendTyping,
    markAsRead,
    resetUnreadCount,
    on,        // Add this for custom event listeners
    emit       // Add this for custom events
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};