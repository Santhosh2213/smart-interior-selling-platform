const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  materialName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.01
  },
  unit: {
    type: String,
    required: true
  },
  pricePerUnit: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  gstRate: {
    type: Number,
    required: true
  },
  gstAmount: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
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
    default: () => new Date(+new Date() + 30*24*60*60*1000) // 30 days from now
  },
  terms: {
    type: String,
    default: '1. All prices are subject to GST\n2. Delivery charges extra\n3. Payment terms: 50% advance, 50% before delivery'
  },
  notes: String,
  pdfUrl: String,
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Generate quotation number before saving
quotationSchema.pre('save', async function(next) {
  try {
    if (!this.quotationNumber) {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      
      // Find the last quotation to get the next sequence number
      const lastQuotation = await this.constructor.findOne({}, {}, { sort: { 'createdAt': -1 } });
      
      let sequence = 1;
      if (lastQuotation && lastQuotation.quotationNumber) {
        // Extract the sequence number from the last quotation number
        const parts = lastQuotation.quotationNumber.split('-');
        if (parts.length === 3) {
          const lastSequence = parseInt(parts[2]);
          if (!isNaN(lastSequence)) {
            sequence = lastSequence + 1;
          }
        }
      }
      
      this.quotationNumber = `QT-${year}${month}-${sequence.toString().padStart(4, '0')}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Quotation', quotationSchema);