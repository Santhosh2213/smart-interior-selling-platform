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
        // You can handle notifications here or let the NotificationBell component handle it
      };

      // Register listeners
      socketService.on('connect', handleConnect);
      socketService.on('disconnect', handleDisconnect);
      socketService.on('online-users', handleOnlineUsers);
      socketService.on('notification', handleNotification);

      return () => {
        // Clean up listeners
        socketService.off('connect', handleConnect);
        socketService.off('disconnect', handleDisconnect);
        socketService.off('online-users', handleOnlineUsers);
        socketService.off('notification', handleNotification);
        socketService.disconnect();
      };
    }
  }, [isAuthenticated, user]);

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

  // Function to listen for custom events
  const on = (event, callback) => {
    socketService.on(event, callback);
  };

  // Function to emit custom events
  const emit = (event, data) => {
    socketService.emit(event, data);
  };

  const value = {
    onlineUsers,
    isConnected,
    joinProjectRoom,
    leaveProjectRoom,
    sendMessage,
    sendProjectMessage,
    sendTyping,
    markAsRead,
    on,
    emit
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};