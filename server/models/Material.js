const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add material name'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please add material category'],
    enum: ['tiles', 'wood', 'glass', 'paints', 'hardware', 'electrical', 'plumbing', 'other'],
    default: 'other'
  },
  description: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    required: [true, 'Please add unit of measurement'],
    enum: ['sqft', 'sqm', 'pieces', 'boxes', 'liters', 'kg', 'meters', 'feet'],
    default: 'pieces'
  },
  price: {
    type: Number,
    required: [true, 'Please add price'],
    min: 0
  },
  
  // GST related fields
  gstRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  gstCategory: {
    type: String,
    enum: ['tiles', 'wood', 'glass', 'paints', 'hardware', 'electrical', 'plumbing', 'other'],
    default: 'other'
  },
  
  // Stock management
  stockQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  minimumStock: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Seller reference
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  
  // Images
  images: [{
    url: String,
    publicId: String,
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Specifications
  specifications: {
    brand: String,
    model: String,
    color: String,
    size: String,
    finish: String,
    warranty: String
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
materialSchema.index({ sellerId: 1, category: 1 });
materialSchema.index({ name: 'text', description: 'text' });
materialSchema.index({ isActive: 1, isFeatured: 1 });

const Material = mongoose.model('Material', materialSchema);

module.exports = Material;