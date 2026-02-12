// Key Models Structure

// 1. User Model (Base for all roles)
{
  name: String,
  email: String,
  phone: String,
  password: String,
  role: ['customer', 'seller', 'designer'],
  isVerified: Boolean,
  createdAt: Date
}

// 2. Customer Model
{
  userId: ObjectId,
  address: [{
    type: String,
    street: String,
    city: String,
    state: String,
    pincode: String
  }],
  projects: [ObjectId],
  totalOrders: Number,
  lifetimeValue: Number
}

// 3. Seller Model (Single record)
{
  userId: ObjectId,
  businessName: String,
  gstNumber: String,
  bankDetails: {
    accountName: String,
    accountNumber: String,
    ifscCode: String,
    upiId: String
  },
  businessAddress: String,
  logo: String,
  settings: {
    quotationPrefix: String,
    invoicePrefix: String,
    defaultGST: Object
  }
}

// 4. Designer Model (Single record)
{
  userId: ObjectId,
  portfolio: String,
  specialization: [String],
  experience: Number
}

// 5. Project Model
{
  customerId: ObjectId,
  projectName: String,
  description: String,
  status: ['draft', 'pending_quote', 'quoted', 'approved', 'completed'],
  images: [ObjectId],
  measurements: [ObjectId],
  selectedMaterials: [ObjectId],
  quotationId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

// 6. ProjectImage Model
{
  projectId: ObjectId,
  imageUrl: String,
  cloudinaryId: String,
  annotations: [{
    area: {
      coordinates: [Number],
      width: Number,
      height: Number
    },
    measurementId: ObjectId
  }]
}

// 7. Measurement Model
{
  projectId: ObjectId,
  imageId: ObjectId,
  areaName: String, // 'Wall 1', 'Floor', etc.
  unit: ['meter', 'feet'],
  length: Number,
  width: Number,
  height: Number,
  totalArea: Number, // Calculated
  materialId: ObjectId
}

// 8. GSTCategory Model
{
  materialCategory: String, // 'tiles', 'wood', 'glass'
  hsnCode: String,
  cgst: Number,
  sgst: Number,
  igst: Number,
  description: String
}

// 9. Material Model
{
  name: String,
  category: String, // tiles, wood, etc.
  brand: String,
  model: String,
  unitPrice: Number,
  unitType: ['sqft', 'sqm', 'piece', 'meter'],
  gstCategoryId: ObjectId,
  images: [String],
  stock: Number,
  description: String,
  isActive: Boolean
}

// 10. Quotation Model
{
  projectId: ObjectId,
  customerId: ObjectId,
  quoteNumber: String,
  version: Number,
  items: [{
    materialId: ObjectId,
    areaName: String,
    quantity: Number,
    unitPrice: Number,
    baseAmount: Number,
    gstAmount: Number,
    totalAmount: Number
  }],
  subtotal: Number,
  gstTotal: Number,
  discount: Number,
  transportCharges: Number,
  grandTotal: Number,
  status: ['draft', 'sent', 'viewed', 'edited', 'accepted', 'rejected'],
  validUntil: Date,
  notes: String,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

// 11. QuotationVersion Model (Edit history)
{
  quotationId: ObjectId,
  version: Number,
  changes: Object,
  modifiedBy: ObjectId, // Customer or Seller
  modifiedAt: Date
}

// 12. Order Model
{
  quotationId: ObjectId,
  orderNumber: String,
  customerId: ObjectId,
  items: Array,
  totalAmount: Number,
  paymentStatus: ['pending', 'partial', 'paid'],
  orderStatus: ['confirmed', 'processing', 'shipped', 'delivered'],
  deliveryDate: Date,
  trackingId: String,
  createdAt: Date
}

// 13. Invoice Model
{
  orderId: ObjectId,
  invoiceNumber: String,
  gstInvoiceNumber: String,
  items: Array,
  subtotal: Number,
  gstBreakdown: [{
    rate: Number,
    amount: Number,
    cgst: Number,
    sgst: Number
  }],
  totalAmount: Number,
  paymentId: ObjectId,
  invoiceDate: Date,
  dueDate: Date,
  pdfUrl: String
}