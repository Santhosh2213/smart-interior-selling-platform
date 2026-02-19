const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Material name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['tiles', 'wood', 'glass', 'paints', 'hardware', 'others'],
    required: true
  },
  subcategory: String,
  unit: {
    type: String,
    enum: ['sqft', 'sqm', 'piece', 'box', 'liter', 'kg'],  // Make sure 'piece' is included
    required: true
  },
  pricePerUnit: {
    type: Number,
    required: true,
    min: 0
  },
  gstRate: {
    type: Number,
    enum: [0, 5, 12, 18, 28],
    default: 18
  },
  hsnCode: String,
  image: String,
  images: [String],
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  minStockLevel: {
    type: Number,
    default: 0,
    min: 0
  },
  supplier: String,
  supplierContact: String,
  description: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Material', materialSchema);