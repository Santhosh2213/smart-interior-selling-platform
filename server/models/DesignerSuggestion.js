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
}, {
  timestamps: true
});

module.exports = mongoose.model('DesignerSuggestion', designerSuggestionSchema);