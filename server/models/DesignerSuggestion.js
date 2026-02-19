const mongoose = require('mongoose');

const materialRecommendationSchema = new mongoose.Schema({
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material'
  },
  materialName: {
    type: String,
    required: true
  },
  category: String,
  quantity: {
    type: Number,
    required: true,
    min: 0.01
  },
  unit: String,
  reason: {
    type: String,
    required: true
  },
  estimatedPrice: Number,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
});

const designSuggestionSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['layout', 'color', 'material', 'furniture', 'lighting', 'other'],
    default: 'other'
  },
  images: [{
    url: String,
    caption: String,
    isBeforeAfter: Boolean
  }],
  materialRecommendations: [materialRecommendationSchema],
  notes: String,
  status: {
    type: String,
    enum: ['draft', 'submitted', 'reviewed', 'approved', 'rejected'],
    default: 'draft'
  },
  feedback: String,
  reviewedAt: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DesignerSuggestion', designSuggestionSchema);