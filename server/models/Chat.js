const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  attachment: {
    url: String,
    type: String,
    filename: String,
    fileType: String,
    size: Number
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  // Add edit tracking
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  editHistory: [{
    message: String,
    editedAt: Date
  }],
  // Add delete tracking (soft delete)
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Add message status
  status: {
    type: String,
    enum: ['sending', 'sent', 'delivered', 'read'],
    default: 'sending'
  },
  projectContext: {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    projectName: String
  },
  reactions: [{
    emoji: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  replyTo: {
    messageId: mongoose.Schema.Types.ObjectId,
    message: String,
    senderName: String
  }
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    unique: true
  },
  projectName: {
    type: String,
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  messages: [messageSchema],
  lastMessage: {
    type: Date,
    default: Date.now
  },
  typingUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isTyping: Boolean,
    lastTypingAt: Date
  }]
}, {
  timestamps: true
});

chatSchema.index({ projectId: 1 });
chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessage: -1 });
chatSchema.index({ 'messages.createdAt': -1 });

module.exports = mongoose.model('Chat', chatSchema);