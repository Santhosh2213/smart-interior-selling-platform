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
<<<<<<< HEAD
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
=======
  const [isConnected, setIsConnected] = useState(false);
>>>>>>> b95e7b1a961b67a7b891dd014314da41665e1d1c

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to socket
      socketService.connect();

      // Set up listeners
<<<<<<< HEAD
=======
      const handleConnect = () => {
        console.log('Socket connected');
        setIsConnected(true);
      };

      const handleDisconnect = () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      };

>>>>>>> b95e7b1a961b67a7b891dd014314da41665e1d1c
      const handleOnlineUsers = (users) => {
        setOnlineUsers(users);
      };

<<<<<<< HEAD
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
=======
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
>>>>>>> b95e7b1a961b67a7b891dd014314da41665e1d1c
        socketService.disconnect();
      };
    }
  }, [isAuthenticated, user]);

<<<<<<< HEAD
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

=======
  // Function to join a project room
>>>>>>> b95e7b1a961b67a7b891dd014314da41665e1d1c
  const joinProjectRoom = (projectId) => {
    socketService.joinProjectRoom(projectId);
  };

<<<<<<< HEAD
=======
  // Function to leave a project room
>>>>>>> b95e7b1a961b67a7b891dd014314da41665e1d1c
  const leaveProjectRoom = (projectId) => {
    socketService.leaveProjectRoom(projectId);
  };

<<<<<<< HEAD
=======
  // Function to send a private message
>>>>>>> b95e7b1a961b67a7b891dd014314da41665e1d1c
  const sendMessage = (recipientId, content, projectId = null) => {
    socketService.sendPrivateMessage(recipientId, content, projectId);
  };

<<<<<<< HEAD
=======
  // Function to send a project message
>>>>>>> b95e7b1a961b67a7b891dd014314da41665e1d1c
  const sendProjectMessage = (projectId, content, recipients = []) => {
    socketService.sendChatMessage(projectId, content, recipients);
  };

<<<<<<< HEAD
=======
  // Function to send typing indicator
>>>>>>> b95e7b1a961b67a7b891dd014314da41665e1d1c
  const sendTyping = (recipientId, projectId, isTyping) => {
    socketService.sendTyping(recipientId, projectId, isTyping);
  };

<<<<<<< HEAD
=======
  // Function to mark messages as read
>>>>>>> b95e7b1a961b67a7b891dd014314da41665e1d1c
  const markAsRead = (messageIds, senderId) => {
    socketService.markMessagesAsRead(messageIds, senderId);
  };

<<<<<<< HEAD
  const resetUnreadCount = () => {
    setUnreadCount(0);
=======
  // Function to listen for custom events
  const on = (event, callback) => {
    socketService.on(event, callback);
  };

  // Function to emit custom events
  const emit = (event, data) => {
    socketService.emit(event, data);
>>>>>>> b95e7b1a961b67a7b891dd014314da41665e1d1c
  };

  const value = {
    onlineUsers,
<<<<<<< HEAD
    notifications,
    unreadCount,
    isConnected: socketService.isConnected(),
=======
    isConnected,
>>>>>>> b95e7b1a961b67a7b891dd014314da41665e1d1c
    joinProjectRoom,
    leaveProjectRoom,
    sendMessage,
    sendProjectMessage,
    sendTyping,
    markAsRead,
<<<<<<< HEAD
    resetUnreadCount
=======
    on,
    emit
>>>>>>> b95e7b1a961b67a7b891dd014314da41665e1d1c
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};