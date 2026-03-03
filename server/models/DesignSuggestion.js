const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  areaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Measurement',
    required: true
  },
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    enum: ['sqft', 'sqm', 'pieces', 'boxes', 'liters', 'kg', 'meters', 'feet'],
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  estimatedCost: {
    type: Number,
    min: 0
  }
}, { _id: true });

const designImageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const changeRequestSchema = new mongoose.Schema({
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestType: {
    type: String,
    enum: ['material_change', 'design_change', 'theme_change', 'other'],
    default: 'design_change'
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'implemented', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  implementedAt: Date,
  implementedNotes: String
});

const designSuggestionSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  designerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Designer',
    required: true,
    index: true
  },
  version: {
    type: Number,
    default: 1
  },
  
  // Main content
  recommendations: [recommendationSchema],
  designNotes: {
    type: String,
    trim: true,
    maxlength: 5000
  },
  suggestedTheme: {
    type: String,
    trim: true
  },
  colorScheme: {
    primary: String,
    secondary: String,
    accent: String
  },
  estimatedTimeline: {
    designDays: { type: Number, default: 3 },
    materialProcurementDays: { type: Number, default: 5 },
    installationDays: { type: Number, default: 7 }
  },
  
  // Designer uploaded images
  designImages: [designImageSchema],
  
  // Status tracking
  status: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED', 'PENDING_CUSTOMER', 'CUSTOMER_REVIEWING', 
           'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'IMPLEMENTED'],
    default: 'DRAFT'
  },
  
  // Customer interaction
  customerResponse: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED'],
    default: 'PENDING'
  },
  customerResponseAt: Date,
  customerResponseNotes: String,
  customerViewedAt: Date,
  
  // Change requests from customer
  changeRequests: [changeRequestSchema],
  
  // Version history
  previousVersionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DesignSuggestion'
  },
  nextVersionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DesignSuggestion'
  },
  
  // Timestamps
  submittedAt: Date,
  customerNotifiedAt: Date,
  approvedAt: Date,
  rejectedAt: Date,
  
  // Metadata
  internalNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
designSuggestionSchema.index({ projectId: 1, status: 1 });
designSuggestionSchema.index({ designerId: 1, createdAt: -1 });
designSuggestionSchema.index({ status: 1, createdAt: -1 });
designSuggestionSchema.index({ customerResponse: 1 });

// Pre-save middleware
designSuggestionSchema.pre('save', function(next) {
  if (this.status === 'SUBMITTED' && !this.submittedAt) {
    this.submittedAt = new Date();
    this.status = 'PENDING_CUSTOMER';
    this.customerResponse = 'PENDING';
  }
  
  if (this.customerResponse === 'APPROVED' && !this.approvedAt) {
    this.approvedAt = new Date();
    this.status = 'APPROVED';
  }
  
  if (this.customerResponse === 'REJECTED' && !this.rejectedAt) {
    this.rejectedAt = new Date();
    this.status = 'REJECTED';
  }
  
  if (this.customerResponse === 'CHANGES_REQUESTED') {
    this.status = 'CHANGES_REQUESTED';
  }
  
  next();
});

// Methods
designSuggestionSchema.methods.calculateTotalCost = function() {
  return this.recommendations.reduce((total, rec) => {
    return total + (rec.estimatedCost || 0);
  }, 0);
};

designSuggestionSchema.methods.addChangeRequest = function(userId, requestType, description) {
  this.changeRequests.push({
    requestedBy: userId,
    requestType,
    description,
    status: 'pending'
  });
  this.status = 'CHANGES_REQUESTED';
  this.customerResponse = 'CHANGES_REQUESTED';
  this.customerResponseAt = new Date();
};

designSuggestionSchema.methods.implementChangeRequest = function(requestId, notes) {
  const request = this.changeRequests.id(requestId);
  if (request) {
    request.status = 'implemented';
    request.implementedAt = new Date();
    request.implementedNotes = notes;
  }
};

const DesignSuggestion = mongoose.model('DesignSuggestion', designSuggestionSchema);

module.exports = DesignSuggestion;