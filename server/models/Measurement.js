const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  areaName: {
    type: String,
    required: true
  },
  length: {
    type: Number,
    required: true
  },
  width: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: ['meter', 'feet'],
    required: true
  },
  areaSqFt: Number,
  areaSqM: Number,
  notes: String
}, {
  timestamps: true
});

// Calculate area before saving
measurementSchema.pre('save', function(next) {
  if (this.unit === 'feet') {
    this.areaSqFt = this.length * this.width;
    this.areaSqM = this.areaSqFt * 0.092903;
  } else {
    this.areaSqM = this.length * this.width;
    this.areaSqFt = this.areaSqM * 10.7639;
  }
  next();
});

module.exports = mongoose.model('Measurement', measurementSchema);