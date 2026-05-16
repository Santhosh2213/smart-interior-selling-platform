const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = require('./app');
const server = http.createServer(app);

// ✅ Socket.IO Configuration with proper CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST']
  },
  path: '/socket.io/',
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

// Make io accessible in routes
app.set('io', io);

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication token missing'));
    }
    
    const jwt = require('jsonwebtoken');
    const User = require('./models/User');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new Error('User not found'));
    }
    
    socket.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    };
    next();
  } catch (error) {
    console.error('Socket auth error:', error.message);
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket) => {
  const { id: userId, name, role } = socket.user;
  console.log(`🔌 Connected: ${name} [${role}] (${socket.id})`);
  
  // Join user room
  socket.join(`user:${userId}`);
  socket.join(`role:${role}`);
  
  // Handle join project
  socket.on('join-project', ({ projectId }) => {
    socket.join(`project:${projectId}`);
    console.log(`${name} joined project room: ${projectId}`);
  });
  
  socket.on('leave-project', ({ projectId }) => {
    socket.leave(`project:${projectId}`);
    console.log(`${name} left project room: ${projectId}`);
  });
  
  // Handle private message
  socket.on('private-message', async (data) => {
    try {
      const { recipientId, content, projectId } = data;
      if (!recipientId || !content?.trim()) return;
      
      const Chat = require('./models/Chat');
      const User = require('./models/User');
      
      let chat = await Chat.findOne({ projectId });
      if (!chat) {
        chat = await Chat.create({
          projectId,
          participants: [userId, recipientId],
          projectName: projectId
        });
      }
      
      const newMsg = {
        senderId: userId,
        receiverId: recipientId,
        message: content.trim(),
        read: false
      };
      chat.messages.push(newMsg);
      chat.lastMessage = Date.now();
      await chat.save();
      
      const sender = await User.findById(userId);
      const payload = {
        _id: newMsg._id,
        senderId: userId,
        senderName: sender?.name || name,
        senderRole: role,
        receiverId: recipientId,
        message: content.trim(),
        projectId,
        createdAt: newMsg.createdAt,
        read: false
      };
      
      io.to(`user:${recipientId}`).emit('private-message', payload);
      socket.emit('message-sent', payload);
      
    } catch (err) {
      console.error('private-message error:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
  
  // Handle typing indicator
  socket.on('typing', ({ recipientId, projectId, isTyping }) => {
    const payload = { userId, name, isTyping };
    if (recipientId) {
      socket.to(`user:${recipientId}`).emit('typing', payload);
    } else if (projectId) {
      socket.to(`project:${projectId}`).emit('typing', payload);
    }
  });
  
  // Handle message read
  socket.on('message-read', async ({ projectId, senderId }) => {
    try {
      const Chat = require('./models/Chat');
      const chat = await Chat.findOne({ projectId });
      if (!chat) return;
      
      let changed = false;
      chat.messages.forEach(msg => {
        if (msg.receiverId.toString() === userId && msg.senderId.toString() === senderId && !msg.read) {
          msg.read = true;
          msg.readAt = new Date();
          changed = true;
        }
      });
      if (changed) await chat.save();
      
      io.to(`user:${senderId}`).emit('messages-read', {
        projectId,
        readBy: userId,
        readAt: new Date()
      });
    } catch (err) {
      console.error('message-read error:', err);
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`🔌 Disconnected: ${name}`);
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.IO ready on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});