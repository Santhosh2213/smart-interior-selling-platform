const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  materialName: String,
  quantity: {
    type: Number,
    required: true,
    min: 0.01
  },
  unit: String,
  pricePerUnit: Number,
  subtotal: Number,
  gstRate: Number,
  gstAmount: Number,
  total: Number
});

const quotationSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  quotationNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: [quotationItemSchema],
  subtotal: {
    type: Number,
    default: 0
  },
  gstTotal: {
    type: Number,
    default: 0
  },
  laborCost: {
    type: Number,
    default: 0
  },
  transportCost: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  total: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'revised'],
    default: 'draft'
  },
  validUntil: {
    type: Date,
    required: true
  },
  terms: String,
  notes: String,
  pdfUrl: String,
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Generate quotation number
quotationSchema.pre('save', async function(next) {
  if (!this.quotationNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const count = await this.constructor.countDocuments();
    this.quotationNumber = `QT-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Quotation', quotationSchema);