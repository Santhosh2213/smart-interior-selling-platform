const mongoose = require('mongoose');

const designerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialization: [{
    type: String,
    enum: ['residential', 'commercial', 'industrial', 'landscape']
  }],
  experience: {
    type: Number,
    min: 0,
    max: 50
  },
  portfolio: [{
    title: String,
    description: String,
    imageUrl: String,
    projectDate: Date
  }],
  bio: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Designer', designerSchema);