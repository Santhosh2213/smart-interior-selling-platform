const mongoose = require('mongoose');

const designerSuggestionSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  designerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Designer',
    required: true
  },
  suggestions: [{
    type: String,
    trim: true
  }],
  // Customer interaction
  customerResponse: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED'],
    default: 'PENDING'
  },
  customerResponseAt: Date,
  customerResponseNotes: String,
  
  // For change requests
  changeRequests: [{
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String,
    requestedAt: Date,
    status: {
      type: String,
      enum: ['PENDING', 'IMPLEMENTED', 'REJECTED'],
      default: 'PENDING'
    }
  }],
  materialRecommendations: [{
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material'
    },
    materialName: String,
    reason: String,
    quantity: Number,
    unit: String,
    estimatedPrice: Number
  }],
  notes: String,
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft'
  }
},{  // Notification tracking
customerNotified: {
  type: Boolean,
  default: false
},
customerNotifiedAt: Date,
sellerNotified: {
  type: Boolean,
  default: false
},
sellerNotifiedAt: Date
}, {
timestamps: true
});


module.exports = mongoose.model('DesignerSuggestion', designerSuggestionSchema);