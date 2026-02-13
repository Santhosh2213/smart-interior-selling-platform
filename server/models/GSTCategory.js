const mongoose = require('mongoose');

const gstCategorySchema = new mongoose.Schema({
  materialCategory: {
    type: String,
    enum: ['tiles', 'wood', 'glass', 'paints', 'hardware', 'others'],
    required: true,
    unique: true
  },
  hsnCode: {
    type: String,
    required: true
  },
  cgst: {
    type: Number,
    required: true
  },
  sgst: {
    type: Number,
    required: true
  },
  igst: {
    type: Number,
    required: true
  },
  effectiveDate: {
    type: Date,
    default: Date.now
  },
  description: String
}, {
  timestamps: true
});

module.exports = mongoose.model('GSTCategory', gstCategorySchema);