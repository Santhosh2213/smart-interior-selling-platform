const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'DESIGN_SUBMITTED',
      'DESIGN_APPROVED',
      'DESIGN_REJECTED',
      'DESIGN_CHANGES_REQUESTED',
      'DESIGN_UPDATED',
      'NEW_MESSAGE',
      'QUOTATION_CREATED',
      'QUOTATION_ACCEPTED',
      'PROJECT_UPDATE',
      'PROJECT_SUBMITTED'  // Add this missing enum value
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'onModel'
  },
  onModel: {
    type: String,
    enum: ['Project', 'DesignSuggestion', 'Quotation', 'Chat']
  },
  actionUrl: String,
  actionText: String,
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  data: mongoose.Schema.Types.Mixed,
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30*24*60*60*1000) // 30 days
  }
}, {
  timestamps: true
});

// Index for cleanup
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);