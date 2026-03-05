import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.isConnected = false;
  }

  // Get token from localStorage
  getToken() {
    return localStorage.getItem('token');
  }

  // Connect to socket server
  connect() {
    const token = this.getToken();
    
    if (!token) {
      console.log('No token available for socket connection');
      return;
    }

    if (this.socket && this.socket.connected) {
      console.log('Socket already connected');
      return;
    }

    console.log('Connecting to socket server...');

    this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000
    });

    this.setupEventHandlers();
  }

  // Set up default event handlers
  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('reconnect-success');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Server disconnected, don't reconnect
        this.socket = null;
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('Max reconnection attempts reached');
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

    // Listen for notifications
    this.socket.on('notification', (notification) => {
      console.log('New notification received:', notification);
      this.emit('notification', notification);
    });

    // Listen for private messages
    this.socket.on('private-message', (message) => {
      console.log('Private message received:', message);
      this.emit('private-message', message);
    });

    // Listen for typing indicators
    this.socket.on('typing', (data) => {
      this.emit('typing', data);
    });

    // Listen for message sent confirmation
    this.socket.on('message-sent', (message) => {
      this.emit('message-sent', message);
    });

    // Listen for read receipts
    this.socket.on('messages-read', (data) => {
      this.emit('messages-read', data);
    });

    // Listen for customer online (for designers/sellers)
    this.socket.on('customer-online', (customer) => {
      this.emit('customer-status-changed', { ...customer, status: 'online' });
    });
  }

  // Join a project room
  joinProjectRoom(projectId) {
    if (this.socket && this.socket.connected) {
      console.log('Joining project room:', projectId);
      this.socket.emit('join-project', { projectId });
    } else {
      console.warn('Cannot join project room: socket not connected');
    }
  }

  // Leave a project room
  leaveProjectRoom(projectId) {
    if (this.socket && this.socket.connected) {
      console.log('Leaving project room:', projectId);
      this.socket.emit('leave-project', { projectId });
    }
  }

  // Send private message
  sendPrivateMessage(recipientId, content, projectId = null) {
    if (this.socket && this.socket.connected) {
      console.log('Sending private message to:', recipientId);
      this.socket.emit('private-message', { recipientId, content, projectId });
    } else {
      console.warn('Cannot send message: socket not connected');
    }
  }

  // Send chat message (project-specific)
  sendChatMessage(projectId, content, recipients = []) {
    if (this.socket && this.socket.connected) {
      console.log('Sending chat message to project:', projectId);
      this.socket.emit('chat-message', { projectId, content, recipients });
    }
  }

  // Send typing indicator
  sendTyping(recipientId, projectId, isTyping) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('typing', { recipientId, projectId, isTyping });
    }
  }

  // Mark messages as read
  markMessagesAsRead(messageIds, senderId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('message-read', { messageIds, senderId });
    }
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
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Check if connected
  isSocketConnected() {
    return this.socket && this.socket.connected;
  }

  // Get socket ID
  getSocketId() {
    return this.socket?.id;
  }

  // Reconnect manually
  reconnect() {
    this.disconnect();
    this.connect();
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;