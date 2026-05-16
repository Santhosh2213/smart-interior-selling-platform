const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Notification = require('../models/Notification');

// Store online users: userId -> { socketId, userData }
const onlineUsers = new Map();

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // ─── JWT Authentication Middleware ───────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication token missing'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));

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

  // ─── Connection Handler ───────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const { id: userId, name, role } = socket.user;
    console.log(`🔌 Connected: ${name} [${role}] (${socket.id})`);

    // Track online user
    onlineUsers.set(userId, {
      socketId: socket.id,
      userId,
      name,
      role,
      connectedAt: new Date()
    });

    // Personal + role rooms
    socket.join(`user:${userId}`);
    socket.join(`role:${role}`);

    // Broadcast this user's online status
    socket.broadcast.emit('user-online', { userId, name, role });

    // Send current online users list to the newly connected socket
    socket.emit('online-users', Array.from(onlineUsers.values()).map(u => ({
      userId: u.userId,
      name: u.name,
      role: u.role
    })));

    // ── Join a project chat room ──────────────────────────────────────────
    socket.on('join-project', ({ projectId }) => {
      socket.join(`project:${projectId}`);
      console.log(`${name} joined project room: ${projectId}`);
    });

    socket.on('leave-project', ({ projectId }) => {
      socket.leave(`project:${projectId}`);
    });

    // ── Private message (persisted to DB) ────────────────────────────────
    socket.on('private-message', async (data) => {
      try {
        const { recipientId, content, projectId } = data;
        if (!recipientId || !content?.trim()) return;

        // Upsert the Chat document
        let chat = await Chat.findOne({ projectId });
        if (!chat) {
          chat = await Chat.create({
            projectId,
            participants: [userId, recipientId]
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

        // Populate the last message for response
        await chat.populate('messages.senderId', 'name');
        const saved = chat.messages[chat.messages.length - 1];

        const payload = {
          _id: saved._id,
          senderId: userId,
          senderName: name,
          senderRole: role,
          receiverId: recipientId,
          message: content.trim(),
          projectId,
          createdAt: saved.createdAt,
          read: false
        };

        // Deliver to recipient (if online)
        socket.to(`user:${recipientId}`).emit('private-message', payload);
        // Confirm to sender
        socket.emit('message-sent', payload);

        // Offline notification
        if (!onlineUsers.has(recipientId)) {
          await Notification.create({
            userId: recipientId,
            type: 'NEW_MESSAGE',
            title: 'New Message',
            message: `${name} sent you a message`,
            relatedId: projectId,
            onModel: 'Project',
            data: { messageId: saved._id }
          });
        }
      } catch (err) {
        console.error('private-message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ── Typing indicator ─────────────────────────────────────────────────
    socket.on('typing', ({ recipientId, projectId, isTyping }) => {
      const payload = { userId, name, isTyping };
      if (recipientId) {
        socket.to(`user:${recipientId}`).emit('typing', payload);
      } else if (projectId) {
        socket.to(`project:${projectId}`).emit('typing', payload);
      }
    });

    // ── Read receipts ─────────────────────────────────────────────────────
    socket.on('message-read', async ({ projectId, senderId }) => {
      try {
        const chat = await Chat.findOne({ projectId });
        if (!chat) return;

        let changed = false;
        chat.messages.forEach(msg => {
          if (
            msg.receiverId.toString() === userId &&
            msg.senderId.toString() === senderId &&
            !msg.read
          ) {
            msg.read = true;
            msg.readAt = new Date();
            changed = true;
          }
        });
        if (changed) await chat.save();

        socket.to(`user:${senderId}`).emit('messages-read', {
          projectId,
          readBy: userId,
          readAt: new Date()
        });
      } catch (err) {
        console.error('message-read error:', err);
      }
    });

    // ── Disconnect ────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`🔌 Disconnected: ${name}`);
      onlineUsers.delete(userId);
      socket.broadcast.emit('user-offline', { userId, name, role });
    });
  });

  return io;
};

const getOnlineUsers = () => Array.from(onlineUsers.values());
const isUserOnline = (userId) => onlineUsers.has(userId);

module.exports = { initializeSocket, getOnlineUsers, isUserOnline };