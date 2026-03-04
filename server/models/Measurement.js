const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  areaName: {
    type: String,
    required: [true, 'Area name is required'],
    trim: true
  },
  length: {
    type: Number,
    required: [true, 'Length is required'],
    min: [0.01, 'Length must be greater than 0']
  },
  width: {
    type: Number,
    required: [true, 'Width is required'],
    min: [0.01, 'Width must be greater than 0']
  },
  unit: {
    type: String,
    enum: ['meter', 'feet'],
    required: true,
    default: 'feet'
  },
  areaSqFt: {
    type: Number,
    default: 0
  },
  areaSqM: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Calculate area before saving
measurementSchema.pre('save', function(next) {
  try {
    if (this.unit === 'feet') {
      this.areaSqFt = this.length * this.width;
      this.areaSqM = this.areaSqFt * 0.092903;
    } else {
      this.areaSqM = this.length * this.width;
      this.areaSqFt = this.areaSqM * 10.7639;
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Measurement', measurementSchema);