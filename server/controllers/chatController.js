const Chat = require('../models/Chat');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get user conversations
// @route   GET /api/chat/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id
    })
      .populate({
        path: 'projectId',
        select: 'title'
      })
      .populate({
        path: 'participants',
        select: 'name avatar role',
        match: { _id: { $ne: req.user.id } }
      })
      .sort('-lastMessage')
      .lean();

    // Format conversations
    const conversations = chats.map(chat => ({
      _id: chat._id,
      projectId: chat.projectId,
      otherUser: chat.participants[0] || null,
      lastMessage: chat.messages[chat.messages.length - 1],
      unreadCount: chat.messages.filter(m => 
        !m.read && m.receiverId.toString() === req.user.id
      ).length,
      updatedAt: chat.lastMessage
    }));

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get messages for a project
// @route   GET /api/chat/project/:projectId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { projectId } = req.params;

    let chat = await Chat.findOne({ projectId })
      .populate('messages.senderId', 'name avatar')
      .populate('messages.receiverId', 'name avatar');

    if (!chat) {
      // Create chat if it doesn't exist
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      // Get participants (customer and seller)
      const customer = await User.findById(project.customerId);
      const seller = await User.findOne({ role: 'seller' });

      chat = await Chat.create({
        projectId,
        participants: [customer._id, seller._id]
      });

      chat = await Chat.findById(chat._id)
        .populate('messages.senderId', 'name avatar')
        .populate('messages.receiverId', 'name avatar');
    }

    res.json({
      success: true,
      data: chat.messages || []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Send message
// @route   POST /api/chat
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { projectId, receiverId, message, attachment } = req.body;

    let chat = await Chat.findOne({ projectId });

    if (!chat) {
      chat = await Chat.create({
        projectId,
        participants: [req.user.id, receiverId]
      });
    }

    const newMessage = {
      senderId: req.user.id,
      receiverId,
      message,
      attachment,
      read: false
    };

    chat.messages.push(newMessage);
    chat.lastMessage = Date.now();
    
    // Ensure both participants are in the array
    if (!chat.participants.includes(req.user.id)) {
      chat.participants.push(req.user.id);
    }
    if (!chat.participants.includes(receiverId)) {
      chat.participants.push(receiverId);
    }

    await chat.save();

    const populatedChat = await Chat.findById(chat._id)
      .populate('messages.senderId', 'name avatar')
      .populate('messages.receiverId', 'name avatar');

    const sentMessage = populatedChat.messages[populatedChat.messages.length - 1];

    res.status(201).json({
      success: true,
      data: sentMessage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/read/:projectId
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const { projectId } = req.params;

    const chat = await Chat.findOne({ projectId });

    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }

    let updated = false;
    chat.messages.forEach(msg => {
      if (msg.receiverId.toString() === req.user.id && !msg.read) {
        msg.read = true;
        msg.readAt = Date.now();
        updated = true;
      }
    });

    if (updated) {
      await chat.save();
    }

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};