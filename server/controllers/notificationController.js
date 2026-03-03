const Notification = require('../models/Notification');

// Create notification helper
const createNotification = async (userId, type, title, message, relatedId, onModel, actionUrl = null, data = null) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      relatedId,
      onModel,
      actionUrl,
      data
    });
    
    // Emit socket event for real-time notification
    const io = require('../server').io;
    if (io) {
      io.to(`user:${userId}`).emit('notification', notification);
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      userId: req.user.id,
      expiresAt: { $gt: new Date() }
    })
    .sort('-createdAt')
    .limit(100);
    
    const unreadCount = notifications.filter(n => !n.isRead).length;
    
    res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }
    
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
    
    res.json({ success: true, data: notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }
    
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    
    await notification.deleteOne();
    
    res.json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Export helper
exports.createNotification = createNotification;