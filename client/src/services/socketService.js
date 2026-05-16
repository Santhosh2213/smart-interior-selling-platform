import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  connect() {
    const token = this.getToken();
    if (!token) {
      console.warn('No token – socket not connecting');
      return;
    }

    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    // IMPORTANT: Match your backend port (5000, not 8080)
    const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    console.log('Connecting to socket at:', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      withCredentials: true,
      // Critical: Don't add extra path that becomes namespace
      path: '/socket.io/'
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully, ID:', this.socket.id);
      this.isConnected = true;
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connect error:', err.message);
      console.error('Full error details:', err);
      this.isConnected = false;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('error', (err) => {
      console.error('Socket error:', err);
    });
  }

  joinProjectRoom(projectId) {
    if (this.socket?.connected) {
      this.socket.emit('join-project', { projectId });
      console.log(`Joined project room: ${projectId}`);
    } else {
      console.warn('Socket not connected - cannot join room');
      this.fallbackJoinProject(projectId);
    }
  }

  // Fallback: call REST API to at least record the user wants to join
  async fallbackJoinProject(projectId) {
    try {
      const token = this.getToken();
      await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/chat/join-project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ projectId })
      });
    } catch (error) {
      console.error('Fallback join project failed:', error);
    }
  }

  leaveProjectRoom(projectId) {
    if (this.socket?.connected) {
      this.socket.emit('leave-project', { projectId });
    }
  }

  sendPrivateMessage(recipientId, content, projectId = null) {
    if (this.socket?.connected) {
      console.log(`Sending message to ${recipientId}: ${content}`);
      this.socket.emit('private-message', { recipientId, content, projectId });
    } else {
      console.warn('Socket not connected – using REST fallback');
      this.sendViaRest(recipientId, content, projectId);
    }
  }

  async sendViaRest(recipientId, content, projectId) {
    try {
      const token = this.getToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId,
          receiverId: recipientId,
          message: content
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message via REST');
      }
      
      const data = await response.json();
      console.log('Message sent via REST fallback:', data);
      
      if (this.onMessageSentCallback) {
        this.onMessageSentCallback(data.data);
      }
    } catch (error) {
      console.error('REST fallback failed:', error);
    }
  }

  setOnMessageSent(callback) {
    this.onMessageSentCallback = callback;
  }

  sendTyping(recipientId, projectId, isTyping) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { recipientId, projectId, isTyping });
    }
  }

  markMessagesAsRead(projectId, senderId) {
    if (this.socket?.connected) {
      this.socket.emit('message-read', { projectId, senderId });
    } else {
      // Fallback to REST
      this.markAsReadViaRest(projectId);
    }
  }

  async markAsReadViaRest(projectId) {
    try {
      const token = this.getToken();
      await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/chat/read/${projectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Mark as read fallback failed:', error);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      console.warn(`Cannot listen to ${event}: socket not initialized`);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`Cannot emit ${event}: socket not connected`);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  isSocketConnected() {
    return this.socket?.connected || false;
  }
}

const socketService = new SocketService();
export default socketService;