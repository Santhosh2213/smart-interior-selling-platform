const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
      const notifications = await Notification.find({ userId: req.user.id })
        .sort('-createdAt')
        .limit(50);
  
      const unreadCount = await Notification.countDocuments({
        userId: req.user.id,
        read: false
      });
  
      res.json({
        success: true,
        data: {
          notifications: notifications || [],
          unreadCount: unreadCount || 0
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        success: false, 
        error: 'Server Error' 
      });
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

    notification.read = true;
    notification.readAt = Date.now();
    await notification.save();

    res.json({ success: true, data: notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { read: true, readAt: Date.now() }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
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
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Create notification (internal use)
// @access  Internal
exports.createNotification = async (userId, title, message, type = 'info', link = null, metadata = null) => {
  try {
    await Notification.create({
      userId,
      title,
      message,
      type,
      link,
      metadata
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};