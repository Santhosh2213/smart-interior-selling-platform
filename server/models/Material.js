const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['tiles', 'wood', 'glass', 'paints', 'hardware', 'others'],
    required: true
  },
  subcategory: String,
  unit: {
    type: String,
    enum: ['sqft', 'sqm', 'piece', 'box', 'liter', 'kg'],
    required: true
  },
  pricePerUnit: {
    type: Number,
    required: true
  },
  gstRate: {
    type: Number,
    enum: [0, 5, 12, 18, 28],
    default: 18
  },
  hsnCode: String,
  image: String,
  stock: {
    type: Number,
    default: 0
  },
  supplier: String,
  description: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Material', materialSchema);