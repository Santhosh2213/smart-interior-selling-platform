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
    enum: ['sqft', 'sqm', 'pieces', 'boxes', 'liters', 'kg'],
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

const designSuggestionSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  designerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  recommendations: [recommendationSchema],
  
  // Design notes and suggestions
  designNotes: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  
  // Overall design theme/style suggestion
  suggestedTheme: {
    type: String,
    trim: true
  },
  
  // Color scheme suggestions
  colorScheme: {
    primary: String,
    secondary: String,
    accent: String
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED'],
    default: 'DRAFT',
    index: true
  },
  
  // Version control for revisions
  version: {
    type: Number,
    default: 1
  },
  
  // Reference to previous version (if revision)
  previousVersionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DesignSuggestion'
  },
  
  // Designer notes (internal)
  internalNotes: {
    type: String,
    trim: true
  },
  
  // Estimated timeline
  estimatedTimeline: {
    designDays: Number,
    materialProcurementDays: Number,
    installationDays: Number
  },
  
  // Additional files/references
  referenceImages: [{
    url: String,
    publicId: String,
    description: String
  }],
  
  // Metadata
  submittedAt: Date,
  reviewedAt: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: String
}, {
  timestamps: true
});

// Indexes for better query performance
designSuggestionSchema.index({ projectId: 1, status: 1 });
designSuggestionSchema.index({ designerId: 1, createdAt: -1 });
designSuggestionSchema.index({ status: 1, createdAt: -1 });

// Pre-save middleware to update timestamps
designSuggestionSchema.pre('save', function(next) {
  if (this.status === 'SUBMITTED' && !this.submittedAt) {
    this.submittedAt = new Date();
  }
  next();
});

// Method to calculate total estimated cost
designSuggestionSchema.methods.calculateTotalCost = function() {
  return this.recommendations.reduce((total, rec) => {
    return total + (rec.estimatedCost || 0);
  }, 0);
};

// Static method to find projects waiting for design
designSuggestionSchema.statics.findPendingProjects = function() {
  return this.find({ status: 'SUBMITTED' })
    .populate('projectId')
    .populate('designerId', 'name email')
    .sort('-submittedAt');
};

const DesignSuggestion = mongoose.model('DesignSuggestion', designSuggestionSchema);

module.exports = DesignSuggestion;