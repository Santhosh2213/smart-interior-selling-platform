const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a project title']
  },
  description: String,
  status: {
    type: String,
    enum: ['draft', 'pending', 'quoting', 'quoted', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'draft'
  },
  measurementUnit: {
    type: String,
    enum: ['meter', 'feet'],
    default: 'feet'
  },
  totalArea: {
    type: Number,
    default: 0
  },
  images: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProjectImage'
  }],
  measurements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Measurement'
  }],
  quotations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation'
  }],
  assignedDesigner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Designer'
  },
  assignedSeller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller'
  },
  submittedAt: Date,
  quotedAt: Date,
  approvedAt: Date,
  completedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);