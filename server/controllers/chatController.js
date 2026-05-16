const Chat = require('../models/Chat');
const Project = require('../models/Project');
const User = require('../models/User');
const Quotation = require('../models/Quotation');
const DesignSuggestion = require('../models/DesignSuggestion');
const Seller = require('../models/Seller');
const Designer = require('../models/Designer');

// @desc  Get all conversations for the current user (SIMPLIFIED - NO FILTERING FIRST)
// @route GET /api/chat/conversations
// @access Private
exports.getConversations = async (req, res) => {
  try {
    console.log('=== getConversations called ===');
    console.log('User:', req.user.id, 'Role:', req.user.role);
    
    // First, find all projects where this user is involved
    let userProjects = [];
    
    if (req.user.role === 'customer') {
      // Get customer profile
      const customer = await require('../models/Customer').findOne({ userId: req.user.id });
      if (customer) {
        userProjects = await Project.find({ customerId: customer._id });
      }
    } 
    else if (req.user.role === 'seller') {
      const seller = await Seller.findOne({ userId: req.user.id });
      if (seller) {
        userProjects = await Project.find({ assignedSeller: seller._id });
      }
    } 
    else if (req.user.role === 'designer') {
      const designer = await Designer.findOne({ userId: req.user.id });
      if (designer) {
        userProjects = await Project.find({ assignedDesigner: designer._id });
      }
    }
    
    console.log('User projects found:', userProjects.length);
    
    // Build conversations from projects
    const conversations = [];
    
    for (const project of userProjects) {
      // Find or create chat for this project
      let chat = await Chat.findOne({ projectId: project._id });
      
      if (!chat) {
        // Create chat if it doesn't exist
        const participants = [];
        
        // Add customer
        if (project.customerId) {
          const customer = await require('../models/Customer').findById(project.customerId);
          if (customer && customer.userId) {
            participants.push(customer.userId);
          }
        }
        
        // Add seller
        if (project.assignedSeller) {
          const seller = await Seller.findById(project.assignedSeller);
          if (seller && seller.userId) {
            participants.push(seller.userId);
          }
        }
        
        // Add designer
        if (project.assignedDesigner) {
          const designer = await Designer.findById(project.assignedDesigner);
          if (designer && designer.userId) {
            participants.push(designer.userId);
          }
        }
        
        chat = await Chat.create({
          projectId: project._id,
          projectName: project.title,
          participants: participants
        });
        console.log(`Created new chat for project: ${project.title}`);
      }
      
      // Get other participant (not the current user)
      const otherParticipantId = chat.participants.find(
        p => p.toString() !== req.user.id
      );
      
      let otherUser = null;
      if (otherParticipantId) {
        otherUser = await User.findById(otherParticipantId).select('name role email avatar');
      }
      
      const msgs = chat.messages || [];
      const lastMsg = msgs[msgs.length - 1] || null;
      const unread = msgs.filter(
        m => m.receiverId && m.receiverId.toString() === req.user.id && !m.read
      ).length;
      
      conversations.push({
        _id: chat._id,
        projectId: {
          _id: project._id,
          title: project.title,
          status: project.status
        },
        otherUser: otherUser,
        lastMessage: lastMsg,
        unreadCount: unread,
        updatedAt: chat.lastMessage
      });
    }
    
    // Sort by last message time
    conversations.sort((a, b) => 
      new Date(b.lastMessage?.createdAt || b.updatedAt) - 
      new Date(a.lastMessage?.createdAt || a.updatedAt)
    );
    
    console.log(`Returning ${conversations.length} conversations`);
    res.json({ success: true, data: conversations });
    
  } catch (err) {
    console.error('getConversations error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc  Get messages for a specific project chat
// @route GET /api/chat/project/:projectId
// @access Private
exports.getMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    let chat = await Chat.findOne({ projectId })
      .populate('messages.senderId', 'name role email avatar')
      .populate('messages.receiverId', 'name role email avatar');
    
    if (!chat) {
      // Create chat if it doesn't exist
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }
      
      const participants = [];
      
      if (project.customerId) {
        const customer = await require('../models/Customer').findById(project.customerId);
        if (customer && customer.userId) participants.push(customer.userId);
      }
      if (project.assignedSeller) {
        const seller = await Seller.findById(project.assignedSeller);
        if (seller && seller.userId) participants.push(seller.userId);
      }
      if (project.assignedDesigner) {
        const designer = await Designer.findById(project.assignedDesigner);
        if (designer && designer.userId) participants.push(designer.userId);
      }
      
      chat = await Chat.create({
        projectId,
        projectName: project.title,
        participants
      });
      
      chat = await Chat.findById(chat._id)
        .populate('messages.senderId', 'name role email avatar')
        .populate('messages.receiverId', 'name role email avatar');
    }
    
    // Mark messages as read
    let marked = false;
    chat.messages.forEach(msg => {
      const receiverIdStr = msg.receiverId?._id?.toString() || msg.receiverId?.toString();
      if (receiverIdStr === req.user.id && !msg.read) {
        msg.read = true;
        msg.readAt = Date.now();
        marked = true;
      }
    });
    if (marked) await chat.save();
    
    res.json({ success: true, data: chat.messages || [], projectName: chat.projectName });
    
  } catch (err) {
    console.error('getMessages error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc  Send a message
// @route POST /api/chat
// @access Private
exports.sendMessage = async (req, res) => {
  try {
    const { projectId, receiverId, message } = req.body;
    
    if (!projectId || !receiverId || !message?.trim()) {
      return res.status(400).json({ success: false, error: 'projectId, receiverId and message are required' });
    }
    
    let chat = await Chat.findOne({ projectId });
    
    if (!chat) {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }
      
      const participants = [req.user.id, receiverId];
      
      chat = await Chat.create({
        projectId,
        projectName: project.title,
        participants
      });
    }
    
    const newMsg = {
      senderId: req.user.id,
      receiverId,
      message: message.trim(),
      read: false,
      projectContext: {
        projectId,
        projectName: chat.projectName
      }
    };
    
    chat.messages.push(newMsg);
    chat.lastMessage = Date.now();
    
    if (!chat.participants.map(String).includes(String(req.user.id))) {
      chat.participants.push(req.user.id);
    }
    if (!chat.participants.map(String).includes(String(receiverId))) {
      chat.participants.push(receiverId);
    }
    
    await chat.save();
    
    const populated = await Chat.findById(chat._id)
      .populate('messages.senderId', 'name role avatar')
      .populate('messages.receiverId', 'name role avatar');
    
    const sent = populated.messages[populated.messages.length - 1];
    const sender = await User.findById(req.user.id);
    
    const payload = {
      _id: sent._id,
      senderId: req.user.id,
      senderName: sender?.name || req.user.name,
      senderRole: req.user.role,
      senderAvatar: sender?.avatar,
      receiverId,
      message: message.trim(),
      projectId,
      projectName: chat.projectName,
      createdAt: sent.createdAt,
      read: false
    };
    
    // Emit via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${receiverId}`).emit('private-message', payload);
      io.to(`user:${req.user.id}`).emit('message-sent', payload);
    }
    
    res.status(201).json({ success: true, data: sent });
    
  } catch (err) {
    console.error('sendMessage error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc  Mark messages as read
// @route PUT /api/chat/read/:projectId
// @access Private
exports.markAsRead = async (req, res) => {
  try {
    const { projectId } = req.params;
    const chat = await Chat.findOne({ projectId });
    
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }
    
    let changed = false;
    chat.messages.forEach(msg => {
      const receiverIdStr = msg.receiverId?.toString();
      if (receiverIdStr === req.user.id && !msg.read) {
        msg.read = true;
        msg.readAt = Date.now();
        changed = true;
      }
    });
    
    if (changed) await chat.save();
    res.json({ success: true, message: 'Messages marked as read' });
    
  } catch (err) {
    console.error('markAsRead error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc  Get customers for seller (SIMPLIFIED - all customers with projects)
// @route GET /api/chat/seller/customers
// @access Private (seller only)
exports.getSellerCustomers = async (req, res) => {
  try {
    console.log('=== getSellerCustomers called ===');
    
    const seller = await Seller.findOne({ userId: req.user.id });
    if (!seller) {
      return res.status(404).json({ success: false, error: 'Seller profile not found' });
    }
    
    // Get all projects assigned to this seller
    const projects = await Project.find({ 
      assignedSeller: seller._id 
    }).populate('customerId');
    
    console.log(`Found ${projects.length} projects for seller`);
    
    const customers = [];
    
    for (const project of projects) {
      if (project.customerId) {
        const customerUser = await User.findById(project.customerId.userId);
        
        if (customerUser) {
          // Find or create chat
          let chat = await Chat.findOne({ projectId: project._id });
          
          if (!chat) {
            chat = await Chat.create({
              projectId: project._id,
              projectName: project.title,
              participants: [customerUser._id, req.user.id]
            });
          }
          
          const msgs = chat.messages || [];
          const lastMsg = msgs[msgs.length - 1] || null;
          const unreadCount = msgs.filter(
            m => m.receiverId?.toString() === req.user.id && !m.read
          ).length;
          
          customers.push({
            chatId: chat._id,
            projectId: project._id,
            projectName: project.title,
            customer: {
              _id: customerUser._id,
              name: customerUser.name,
              email: customerUser.email,
              avatar: customerUser.avatar,
              role: customerUser.role
            },
            lastMessage: lastMsg,
            unreadCount: unreadCount
          });
        }
      }
    }
    
    console.log(`Returning ${customers.length} customers for seller`);
    res.json({ success: true, data: customers });
    
  } catch (err) {
    console.error('getSellerCustomers error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc  Get customers for designer (SIMPLIFIED)
// @route GET /api/chat/designer/customers
// @access Private (designer only)
exports.getDesignerCustomers = async (req, res) => {
  try {
    console.log('=== getDesignerCustomers called ===');
    
    const designer = await Designer.findOne({ userId: req.user.id });
    if (!designer) {
      return res.status(404).json({ success: false, error: 'Designer profile not found' });
    }
    
    const projects = await Project.find({ 
      assignedDesigner: designer._id 
    }).populate('customerId');
    
    console.log(`Found ${projects.length} projects for designer`);
    
    const customers = [];
    
    for (const project of projects) {
      if (project.customerId) {
        const customerUser = await User.findById(project.customerId.userId);
        
        if (customerUser) {
          let chat = await Chat.findOne({ projectId: project._id });
          
          if (!chat) {
            chat = await Chat.create({
              projectId: project._id,
              projectName: project.title,
              participants: [customerUser._id, req.user.id]
            });
          }
          
          const msgs = chat.messages || [];
          const lastMsg = msgs[msgs.length - 1] || null;
          const unreadCount = msgs.filter(
            m => m.receiverId?.toString() === req.user.id && !m.read
          ).length;
          
          customers.push({
            chatId: chat._id,
            projectId: project._id,
            projectName: project.title,
            customer: {
              _id: customerUser._id,
              name: customerUser.name,
              email: customerUser.email,
              avatar: customerUser.avatar,
              role: customerUser.role
            },
            lastMessage: lastMsg,
            unreadCount: unreadCount
          });
        }
      }
    }
    
    console.log(`Returning ${customers.length} customers for designer`);
    res.json({ success: true, data: customers });
    
  } catch (err) {
    console.error('getDesignerCustomers error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc  Edit a message
// @route PUT /api/chat/message/:messageId
// @access Private
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message content is required' });
    }
    
    // Find chat containing this message
    const chat = await Chat.findOne({ 'messages._id': messageId });
    
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }
    
    // Find the message
    const msg = chat.messages.id(messageId);
    
    if (!msg) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }
    
    // Check if user is the sender
    if (msg.senderId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Can only edit your own messages' });
    }
    
    // Check if message is old (optional: limit edit time window)
    const messageAge = Date.now() - new Date(msg.createdAt).getTime();
    const MAX_EDIT_TIME = 5 * 60 * 1000; // 5 minutes
    
    if (messageAge > MAX_EDIT_TIME) {
      return res.status(400).json({ success: false, error: 'Messages can only be edited within 5 minutes' });
    }
    
    // Save edit history
    if (!msg.editHistory) msg.editHistory = [];
    msg.editHistory.push({
      message: msg.message,
      editedAt: new Date()
    });
    
    // Update message
    msg.message = message.trim();
    msg.edited = true;
    msg.editedAt = new Date();
    
    await chat.save();
    
    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${msg.receiverId}`).emit('message-edited', {
        messageId: msg._id,
        message: msg.message,
        editedAt: msg.editedAt,
        projectId: chat.projectId
      });
      io.to(`user:${msg.senderId}`).emit('message-edited', {
        messageId: msg._id,
        message: msg.message,
        editedAt: msg.editedAt,
        projectId: chat.projectId
      });
    }
    
    res.json({ success: true, data: msg });
    
  } catch (err) {
    console.error('editMessage error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc  Delete a message (soft delete)
// @route DELETE /api/chat/message/:messageId
// @access Private
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { deleteForEveryone = false } = req.body;
    
    // Find chat containing this message
    const chat = await Chat.findOne({ 'messages._id': messageId });
    
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }
    
    // Find the message
    const msg = chat.messages.id(messageId);
    
    if (!msg) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }
    
    // Check if user is the sender
    if (msg.senderId.toString() !== req.user.id && !deleteForEveryone) {
      return res.status(403).json({ success: false, error: 'Can only delete your own messages' });
    }
    
    if (deleteForEveryone) {
      // Delete for everyone - mark as deleted
      msg.deleted = true;
      msg.deletedAt = new Date();
      msg.message = 'This message was deleted';
    } else {
      // Delete for me only
      if (!msg.deletedFor) msg.deletedFor = [];
      msg.deletedFor.push(req.user.id);
    }
    
    await chat.save();
    
    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      const deleteEvent = deleteForEveryone ? 'message-deleted-for-everyone' : 'message-deleted-for-me';
      io.to(`user:${msg.receiverId}`).emit(deleteEvent, {
        messageId: msg._id,
        deletedFor: deleteForEveryone ? 'everyone' : 'me',
        projectId: chat.projectId
      });
      io.to(`user:${msg.senderId}`).emit(deleteEvent, {
        messageId: msg._id,
        deletedFor: deleteForEveryone ? 'everyone' : 'me',
        projectId: chat.projectId
      });
    }
    
    res.json({ success: true, message: 'Message deleted successfully' });
    
  } catch (err) {
    console.error('deleteMessage error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc  Get conversations for designer (ALL projects - no assignment needed)
// @route GET /api/chat/designer/conversations
// @access Private (designer only)
exports.getDesignerConversations = async (req, res) => {
  try {
    console.log('=== getDesignerConversations called ===');
    console.log('User:', req.user.id, 'Role:', req.user.role);
    
    // Get designer profile
    const Designer = require('../models/Designer');
    const designer = await Designer.findOne({ userId: req.user.id });
    
    if (!designer) {
      return res.status(404).json({ success: false, error: 'Designer profile not found' });
    }
    
    // ✅ FIX: Get ALL projects - not just assigned ones
    // Designers should see all projects to discuss requirements
    const projects = await Project.find({})
      .populate('customerId')
      .sort('-createdAt');
    
    console.log(`Found ${projects.length} total projects for designer view`);
    
    const conversations = [];
    const processedKeys = new Set();
    
    for (const project of projects) {
      if (!project.customerId) continue;
      
      // Get customer user
      const Customer = require('../models/Customer');
      const customer = await Customer.findById(project.customerId);
      if (!customer) continue;
      
      const customerUser = await User.findById(customer.userId);
      if (!customerUser) continue;
      
      // Find or create chat for this project
      let chat = await Chat.findOne({ projectId: project._id });
      
      if (!chat) {
        // Create chat with all participants
        const participants = [customerUser._id, req.user.id];
        
        // Add seller if exists
        if (project.assignedSeller) {
          const Seller = require('../models/Seller');
          const seller = await Seller.findById(project.assignedSeller);
          if (seller && seller.userId) {
            participants.push(seller.userId);
          }
        }
        
        chat = await Chat.create({
          projectId: project._id,
          projectName: project.title,
          participants: participants
        });
        console.log(`Created new chat for project: ${project.title}`);
      }
      
      // Get other participants (excluding current user)
      const otherParticipants = chat.participants.filter(
        p => p.toString() !== req.user.id
      );
      
      // For each other participant, create a conversation entry
      for (const participantId of otherParticipants) {
        const otherUser = await User.findById(participantId).select('name role email avatar');
        
        if (otherUser) {
          const key = `${project._id}-${otherUser._id}`;
          if (!processedKeys.has(key)) {
            processedKeys.add(key);
            
            const msgs = chat.messages || [];
            const lastMsg = msgs[msgs.length - 1] || null;
            const unread = msgs.filter(
              m => m.receiverId && m.receiverId.toString() === req.user.id && !m.read
            ).length;
            
            conversations.push({
              _id: chat._id,
              projectId: {
                _id: project._id,
                title: project.title,
                status: project.status
              },
              otherUser: otherUser,
              lastMessage: lastMsg,
              unreadCount: unread,
              updatedAt: chat.lastMessage,
              role: otherUser.role
            });
          }
        }
      }
    }
    
    // Sort by last message time
    conversations.sort((a, b) => 
      new Date(b.lastMessage?.createdAt || b.updatedAt) - 
      new Date(a.lastMessage?.createdAt || a.updatedAt)
    );
    
    console.log(`Returning ${conversations.length} conversations for designer`);
    res.json({ success: true, data: conversations });
    
  } catch (err) {
    console.error('getDesignerConversations error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc  Get conversations for seller (ALL projects - no assignment needed)
// @route GET /api/chat/seller/conversations
// @access Private (seller only)
exports.getSellerConversations = async (req, res) => {
  try {
    console.log('=== getSellerConversations called ===');
    console.log('User:', req.user.id, 'Role:', req.user.role);
    
    // Get seller profile
    const Seller = require('../models/Seller');
    const seller = await Seller.findOne({ userId: req.user.id });
    
    if (!seller) {
      return res.status(404).json({ success: false, error: 'Seller profile not found' });
    }
    
    // ✅ FIX: Get ALL projects - sellers should see all customers
    const projects = await Project.find({})
      .populate('customerId')
      .sort('-createdAt');
    
    console.log(`Found ${projects.length} total projects for seller view`);
    
    const conversations = [];
    const processedKeys = new Set();
    
    for (const project of projects) {
      if (!project.customerId) continue;
      
      // Get customer user
      const Customer = require('../models/Customer');
      const customer = await Customer.findById(project.customerId);
      if (!customer) continue;
      
      const customerUser = await User.findById(customer.userId);
      if (!customerUser) continue;
      
      // Find or create chat
      let chat = await Chat.findOne({ projectId: project._id });
      
      if (!chat) {
        const participants = [customerUser._id, req.user.id];
        
        // Add designer if exists
        if (project.assignedDesigner) {
          const Designer = require('../models/Designer');
          const designer = await Designer.findById(project.assignedDesigner);
          if (designer && designer.userId) {
            participants.push(designer.userId);
          }
        }
        
        chat = await Chat.create({
          projectId: project._id,
          projectName: project.title,
          participants: participants
        });
        console.log(`Created new chat for project: ${project.title}`);
      }
      
      // Check if seller is in participants
      if (!chat.participants.map(String).includes(req.user.id)) {
        chat.participants.push(req.user.id);
        await chat.save();
      }
      
      const key = `${project._id}-${customerUser._id}`;
      if (!processedKeys.has(key)) {
        processedKeys.add(key);
        
        const msgs = chat.messages || [];
        const lastMsg = msgs[msgs.length - 1] || null;
        const unread = msgs.filter(
          m => m.receiverId && m.receiverId.toString() === req.user.id && !m.read
        ).length;
        
        conversations.push({
          _id: chat._id,
          projectId: {
            _id: project._id,
            title: project.title,
            status: project.status
          },
          otherUser: customerUser,
          lastMessage: lastMsg,
          unreadCount: unread,
          updatedAt: chat.lastMessage,
          role: 'customer'
        });
      }
    }
    
    conversations.sort((a, b) => 
      new Date(b.lastMessage?.createdAt || b.updatedAt) - 
      new Date(a.lastMessage?.createdAt || a.updatedAt)
    );
    
    console.log(`Returning ${conversations.length} conversations for seller`);
    res.json({ success: true, data: conversations });
    
  } catch (err) {
    console.error('getSellerConversations error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};