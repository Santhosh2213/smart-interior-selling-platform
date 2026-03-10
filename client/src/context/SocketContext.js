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

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to socket
      socketService.connect();

      // Set up listeners
      const handleOnlineUsers = (users) => {
        setOnlineUsers(users);
      };

      const handlePrivateMessage = (message) => {
        // Show notification
        showNotification('New Message', message.content);
        
        // Update unread count
        setUnreadCount(prev => prev + 1);
        
        // Emit event for chat components
        window.dispatchEvent(new CustomEvent('new-message', { detail: message }));
      };

      const handleUserStatusChange = ({ userId, status }) => {
        setOnlineUsers(prev => 
          prev.map(u => u.userId === userId ? { ...u, status } : u)
        );
      };

      // Register listeners
      socketService.on('online-users-updated', handleOnlineUsers);
      socketService.on('private-message', handlePrivateMessage);
      socketService.on('user-status-changed', handleUserStatusChange);

      return () => {
        // Clean up listeners
        socketService.off('online-users-updated', handleOnlineUsers);
        socketService.off('private-message', handlePrivateMessage);
        socketService.off('user-status-changed', handleUserStatusChange);
        socketService.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  const showNotification = (title, body) => {
    // Check if browser supports notifications
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      });
    }
  };

  const joinProjectRoom = (projectId) => {
    socketService.joinProjectRoom(projectId);
  };

  const leaveProjectRoom = (projectId) => {
    socketService.leaveProjectRoom(projectId);
  };

  const sendMessage = (recipientId, content, projectId = null) => {
    socketService.sendPrivateMessage(recipientId, content, projectId);
  };

  const sendProjectMessage = (projectId, content, recipients = []) => {
    socketService.sendChatMessage(projectId, content, recipients);
  };

  const sendTyping = (recipientId, projectId, isTyping) => {
    socketService.sendTyping(recipientId, projectId, isTyping);
  };

  const markAsRead = (messageIds, senderId) => {
    socketService.markMessagesAsRead(messageIds, senderId);
  };

  const resetUnreadCount = () => {
    setUnreadCount(0);
  };

  const value = {
    onlineUsers,
    notifications,
    unreadCount,
    isConnected: socketService.isConnected(),
    joinProjectRoom,
    leaveProjectRoom,
    sendMessage,
    sendProjectMessage,
    sendTyping,
    markAsRead,
    resetUnreadCount
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};