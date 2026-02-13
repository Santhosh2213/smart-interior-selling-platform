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
  publicId: String,
  annotations: [{
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    areaName: String,
    areaSqFt: Number,
    areaSqM: Number
  }],
  isMain: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ProjectImage', projectImageSchema);