const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Store online users
const onlineUsers = new Map(); // userId -> { socketId, userData }

// Initialize Socket.IO
const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST']
    },
    // Connection settings
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      // Attach user data to socket
      socket.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      };
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Handle connections
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.name} (${socket.id})`);
    
    // Add to online users
    onlineUsers.set(socket.user.id, {
      socketId: socket.id,
      userId: socket.user.id,
      name: socket.user.name,
      role: socket.user.role,
      connectedAt: new Date()
    });

    // Join user to their personal room
    socket.join(`user:${socket.user.id}`);
    
    // Join role-based room
    socket.join(`role:${socket.user.role}`);

    // Broadcast online status to relevant users
    broadcastOnlineStatus(io, socket);

    // Handle private messages
    socket.on('private-message', async (data) => {
      await handlePrivateMessage(io, socket, data);
    });

    // Handle chat messages (project-specific)
    socket.on('chat-message', async (data) => {
      await handleChatMessage(io, socket, data);
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      handleTypingIndicator(io, socket, data);
    });

    // Handle read receipts
    socket.on('message-read', (data) => {
      handleReadReceipt(io, socket, data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.name}`);
      
      // Remove from online users
      onlineUsers.delete(socket.user.id);
      
      // Notify others
      socket.broadcast.emit('user-offline', {
        userId: socket.user.id,
        name: socket.user.name
      });
    });
  });

  return io;
};

// Broadcast online status to relevant users
const broadcastOnlineStatus = (io, socket) => {
  // For designers/sellers - notify when customer comes online
  if (socket.user.role === 'customer') {
    // Notify assigned designer and seller
    socket.to(`role:designer`).to(`role:seller`).emit('customer-online', {
      userId: socket.user.id,
      name: socket.user.name
    });
  }
  
  // Send current online users to the newly connected user
  const onlineUsersList = Array.from(onlineUsers.values()).map(u => ({
    userId: u.userId,
    name: u.name,
    role: u.role
  }));
  
  socket.emit('online-users', onlineUsersList);
};

// Handle private messages
const handlePrivateMessage = async (io, socket, data) => {
  try {
    const { recipientId, content, projectId } = data;
    
    const message = {
      id: Date.now().toString(),
      senderId: socket.user.id,
      senderName: socket.user.name,
      senderRole: socket.user.role,
      recipientId,
      content,
      projectId,
      timestamp: new Date(),
      read: false
    };

    // Save to database (you'll need a Message model)
    // const savedMessage = await Message.create(message);

    // Send to recipient if online
    socket.to(`user:${recipientId}`).emit('private-message', message);
    
    // Also send back to sender for confirmation
    socket.emit('message-sent', message);

    // If recipient is offline, store as notification
    if (!onlineUsers.has(recipientId)) {
      // Create notification in database
      const Notification = require('../models/Notification');
      await Notification.create({
        userId: recipientId,
        type: 'NEW_MESSAGE',
        title: 'New Message',
        message: `${socket.user.name} sent you a message`,
        relatedId: projectId,
        onModel: 'Project',
        data: { messageId: message.id }
      });
    }
  } catch (error) {
    console.error('Error handling private message:', error);
    socket.emit('error', { message: 'Failed to send message' });
  }
};

// Handle project-specific chat messages
const handleChatMessage = async (io, socket, data) => {
  try {
    const { projectId, content, recipients } = data;
    
    const message = {
      id: Date.now().toString(),
      senderId: socket.user.id,
      senderName: socket.user.name,
      senderRole: socket.user.role,
      content,
      projectId,
      timestamp: new Date()
    };

    // Save to database
    // await ChatMessage.create(message);

    // Broadcast to project room
    io.to(`project:${projectId}`).emit('chat-message', message);

    // Notify offline users
    if (recipients) {
      for (const recipientId of recipients) {
        if (!onlineUsers.has(recipientId)) {
          const Notification = require('../models/Notification');
          await Notification.create({
            userId: recipientId,
            type: 'PROJECT_MESSAGE',
            title: 'New Project Message',
            message: `${socket.user.name} commented on project`,
            relatedId: projectId,
            onModel: 'Project'
          });
        }
      }
    }
  } catch (error) {
    console.error('Error handling chat message:', error);
  }
};

// Handle typing indicators
const handleTypingIndicator = (io, socket, data) => {
  const { recipientId, projectId, isTyping } = data;
  
  if (recipientId) {
    // Private chat typing
    socket.to(`user:${recipientId}`).emit('typing', {
      userId: socket.user.id,
      name: socket.user.name,
      isTyping
    });
  } else if (projectId) {
    // Project chat typing
    socket.to(`project:${projectId}`).emit('typing', {
      userId: socket.user.id,
      name: socket.user.name,
      isTyping
    });
  }
};

// Handle read receipts
const handleReadReceipt = (io, socket, data) => {
  const { messageIds, senderId } = data;
  
  // Notify sender that messages were read
  socket.to(`user:${senderId}`).emit('messages-read', {
    messageIds,
    readBy: socket.user.id,
    readAt: new Date()
  });
};

// Helper function to join project room
const joinProjectRoom = (socket, projectId) => {
  socket.join(`project:${projectId}`);
  console.log(`User ${socket.user.name} joined project room: ${projectId}`);
};

// Helper function to leave project room
const leaveProjectRoom = (socket, projectId) => {
  socket.leave(`project:${projectId}`);
};

// Get online users
const getOnlineUsers = () => {
  return Array.from(onlineUsers.values());
};

// Check if user is online
const isUserOnline = (userId) => {
  return onlineUsers.has(userId);
};

module.exports = {
  initializeSocket,
  joinProjectRoom,
  leaveProjectRoom,
  getOnlineUsers,
  isUserOnline
};