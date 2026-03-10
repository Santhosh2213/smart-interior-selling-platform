import io from 'socket.io-client';
import authService from './authService'; // Import default instead of named export

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Connect to socket server
  connect() {
    const token = getToken();
    
    if (!token) {
      console.error('No token available for socket connection');
      return;
    }

    this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    this.setupEventHandlers();
  }

  // Set up default event handlers
  setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
      this.reconnectAttempts = 0;
      this.emit('reconnect-success');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected, don't reconnect
        this.socket = null;
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.emit('reconnect-failed');
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Listen for online users
    this.socket.on('online-users', (users) => {
      this.emit('online-users-updated', users);
    });

    // Listen for user online/offline events
    this.socket.on('user-online', (user) => {
      this.emit('user-status-changed', { ...user, status: 'online' });
    });

    this.socket.on('user-offline', (user) => {
      this.emit('user-status-changed', { ...user, status: 'offline' });
    });

    // Listen for customer online (for designers/sellers)
    this.socket.on('customer-online', (customer) => {
      this.emit('customer-status-changed', { ...customer, status: 'online' });
    });
  }

  // Join a project room
  joinProjectRoom(projectId) {
    if (this.socket) {
      this.socket.emit('join-project', { projectId });
    }
  }

  // Leave a project room
  leaveProjectRoom(projectId) {
    if (this.socket) {
      this.socket.emit('leave-project', { projectId });
    }
  }

  // Send private message
  sendPrivateMessage(recipientId, content, projectId = null) {
    if (this.socket) {
      this.socket.emit('private-message', { recipientId, content, projectId });
    }
  }

  // Send chat message (project-specific)
  sendChatMessage(projectId, content, recipients = []) {
    if (this.socket) {
      this.socket.emit('chat-message', { projectId, content, recipients });
    }
  }

  // Send typing indicator
  sendTyping(recipientId, projectId, isTyping) {
    if (this.socket) {
      this.socket.emit('typing', { recipientId, projectId, isTyping });
    }
  }

  // Mark messages as read
  markMessagesAsRead(messageIds, senderId) {
    if (this.socket) {
      this.socket.emit('message-read', { messageIds, senderId });
    }
  }

  // Listen for private messages
  onPrivateMessage(callback) {
    this.on('private-message', callback);
  }

  // Listen for chat messages
  onChatMessage(callback) {
    this.on('chat-message', callback);
  }

  // Listen for typing indicators
  onTyping(callback) {
    this.on('typing', callback);
  }

  // Listen for message sent confirmation
  onMessageSent(callback) {
    this.on('message-sent', callback);
  }

  // Listen for read receipts
  onMessagesRead(callback) {
    this.on('messages-read', callback);
  }

  // Generic event listener
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
    
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Emit custom event
  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Check if connected
  isConnected() {
    return this.socket && this.socket.connected;
  }

  // Get socket ID
  getSocketId() {
    return this.socket?.id;
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;