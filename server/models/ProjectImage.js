const mongoose = require('mongoose');

const projectImageSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  annotations: [{
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    areaName: String,
    areaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Measurement'
    }
  }],
  isMain: {
    type: Boolean,
    default: false
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ProjectImage', projectImageSchema);