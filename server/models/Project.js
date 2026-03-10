const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a project title'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'quoting', 'quoted', 'approved', 'rejected', 'completed', 'cancelled', 'PENDING_DESIGN', 'DESIGN_COMPLETED'],
    default: 'draft'
  },
  measurementUnit: {
    type: String,
    enum: ['meter', 'feet'],
    default: 'feet'
  },
  totalArea: {
    type: Number,
    default: 0
  },
  images: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProjectImage'
  }],
  measurements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Measurement'
  }],
  quotations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation'
  }],
  
  // Reference to design suggestion
  designSuggestionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DesignSuggestion',
    sparse: true
  },
  
  // Designer fields - UPDATED for better workflow
  assignedDesigner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Designer'
  },
  designerId: {  // Alias for assignedDesigner (for consistency)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Designer'
  },
  designerAssignedAt: Date,
  designerNotes: String,
  designerReviewed: {
    type: Boolean,
    default: false
  },
  designerReviewedAt: Date,
  
  // Designer suggestions - FIXED SYNTAX
  designerSuggestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DesignerSuggestion'
  }],
  
  // Legacy field for backward compatibility (optional)
  designerSuggestionsLegacy: {
    suggestions: [String],
    materialRecommendations: [{
      materialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material'
      },
      materialName: String,
      reason: String,
      quantity: Number,
      unit: String
    }],
    notes: String,
    createdAt: Date,
    designerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Designer'
    }
  },
  
  // Seller fields
  assignedSeller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller'
  },
  sellerId: {  // Alias for assignedSeller
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller'
  },
  sellerAssignedAt: Date,
  
  // Customer feedback
  customerFeedback: String,
  customerRating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  // Timestamps
  submittedAt: Date,
  quotedAt: Date,
  approvedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  rejectedAt: Date
}, {
  timestamps: true
});

// Pre-save middleware to ensure consistency between assignedDesigner and designerId
projectSchema.pre('save', function(next) {
  if (this.assignedDesigner && !this.designerId) {
    this.designerId = this.assignedDesigner;
  }
  if (this.designerId && !this.assignedDesigner) {
    this.assignedDesigner = this.designerId;
  }
  
  if (this.assignedSeller && !this.sellerId) {
    this.sellerId = this.assignedSeller;
  }
  if (this.sellerId && !this.assignedSeller) {
    this.assignedSeller = this.sellerId;
  }
  
  next();
});

// Index for faster queries
projectSchema.index({ customerId: 1, createdAt: -1 });
projectSchema.index({ assignedDesigner: 1, status: 1 });
projectSchema.index({ assignedSeller: 1, status: 1 });
projectSchema.index({ status: 1, createdAt: -1 });
projectSchema.index({ designSuggestionId: 1 });

module.exports = mongoose.model('Project', projectSchema);