const Quotation = require('../models/Quotation');
const Project = require('../models/Project');
const Customer = require('../models/Customer');
const Seller = require('../models/Seller');
const Material = require('../models/Material');

// @desc    Create new quotation
// @route   POST /api/quotations
// @access  Private (Seller only)
const createQuotation = async (req, res) => {
  try {
    const { projectId, items, laborCost, transportCost, discount, discountType, terms, notes } = req.body;

    console.log('Creating quotation for project:', projectId);

    // Get seller profile
    const seller = await Seller.findOne({ userId: req.user.id });
    if (!seller) {
      return res.status(404).json({
        success: false,
        error: 'Seller profile not found'
      });
    }

    // Get project details
    const project = await Project.findById(projectId).populate('customerId');
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Calculate quotation totals
    let subtotal = 0;
    let gstTotal = 0;
    const quotationItems = [];

    for (const item of items) {
      const material = await Material.findById(item.materialId);
      if (!material) {
        return res.status(404).json({
          success: false,
          error: `Material not found: ${item.materialId}`
        });
      }

      const itemSubtotal = material.pricePerUnit * item.quantity;
      const itemGst = itemSubtotal * (material.gstRate / 100);
      const itemTotal = itemSubtotal + itemGst;

      subtotal += itemSubtotal;
      gstTotal += itemGst;

      quotationItems.push({
        materialId: material._id,
        materialName: material.name,
        quantity: item.quantity,
        unit: material.unit,
        pricePerUnit: material.pricePerUnit,
        subtotal: itemSubtotal,
        gstRate: material.gstRate,
        gstAmount: itemGst,
        total: itemTotal
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (discount > 0) {
      if (discountType === 'percentage') {
        discountAmount = (subtotal + gstTotal) * (discount / 100);
      } else {
        discountAmount = discount;
      }
    }

    const total = subtotal + gstTotal + (laborCost || 0) + (transportCost || 0) - discountAmount;

    // Generate simple unique number
    const timestamp = Date.now();
    const random = Math.floor(1000 + Math.random() * 9000);
    const quotationNumber = `QT-${timestamp}-${random}`;

    console.log('Generated quotation number:', quotationNumber);

    // Create quotation
    const quotation = await Quotation.create({
      projectId: project._id,
      customerId: project.customerId._id,
      sellerId: seller._id,
      quotationNumber,
      items: quotationItems,
      subtotal,
      gstTotal,
      laborCost: laborCost || 0,
      transportCost: transportCost || 0,
      discount: discount || 0,
      discountType: discountType || 'percentage',
      total,
      status: 'draft',
      terms: terms || '1. All prices are subject to GST\n2. Delivery charges extra\n3. Payment terms: 50% advance, 50% before delivery',
      notes,
      version: 1
    });

    console.log('Quotation created successfully:', quotation._id, 'Number:', quotation.quotationNumber);

    // Update project
    project.status = 'quoted';
    project.quotations.push(quotation._id);
    await project.save();

    res.status(201).json({
      success: true,
      data: quotation,
      message: 'Quotation created successfully'
    });
  } catch (error) {
    console.error('❌ Create quotation error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate quotation number. Please try again.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// Helper function for retry
const createQuotationWithNumber = async (req, res, quotationNumber) => {
  try {
    const { projectId, items, laborCost, transportCost, discount, discountType, terms, notes } = req.body;

    const seller = await Seller.findOne({ userId: req.user.id });
    const project = await Project.findById(projectId).populate('customerId');
    
    // ... (same calculation logic as above) ...
    
    const quotation = await Quotation.create({
      projectId: project._id,
      customerId: project.customerId._id,
      sellerId: seller._id,
      quotationNumber,
      // ... rest of the fields
    });
    
    return res.status(201).json({
      success: true,
      data: quotation,
      message: 'Quotation created successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to create quotation after retry'
    });
  }
};

// @desc    Get all quotations for seller
// @route   GET /api/quotations/seller
// @access  Private (Seller)
const getSellerQuotations = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user.id });
    if (!seller) {
      return res.status(404).json({
        success: false,
        error: 'Seller profile not found'
      });
    }

    const quotations = await Quotation.find({ sellerId: seller._id })
      .populate({
        path: 'projectId',
        select: 'title description'
      })
      .populate({
        path: 'customerId',
        populate: {
          path: 'userId',
          select: 'name email phone'
        }
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: quotations.length,
      data: quotations
    });
  } catch (error) {
    console.error('❌ Get seller quotations error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Get quotations for customer
// @route   GET /api/quotations/customer
// @access  Private (Customer)
const getCustomerQuotations = async (req, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.user.id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer profile not found'
      });
    }

    const quotations = await Quotation.find({ customerId: customer._id })
      .populate({
        path: 'projectId',
        select: 'title description'
      })
      .populate({
        path: 'sellerId',
        populate: {
          path: 'userId',
          select: 'name businessName'
        }
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: quotations.length,
      data: quotations
    });
  } catch (error) {
    console.error('❌ Get customer quotations error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Get single quotation
// @route   GET /api/quotations/:id
// @access  Private
const getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate({
        path: 'projectId',
        select: 'title description measurements images'
      })
      .populate({
        path: 'customerId',
        populate: {
          path: 'userId',
          select: 'name email phone'
        }
      })
      .populate({
        path: 'sellerId',
        populate: {
          path: 'userId',
          select: 'name businessName'
        }
      })
      .populate('items.materialId');

    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: 'Quotation not found'
      });
    }

    // Check authorization
    const customer = await Customer.findOne({ userId: req.user.id });
    const seller = await Seller.findOne({ userId: req.user.id });

    const isCustomer = customer && quotation.customerId._id.toString() === customer._id.toString();
    const isSeller = seller && quotation.sellerId._id.toString() === seller._id.toString();

    if (!isCustomer && !isSeller) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this quotation'
      });
    }

    // Update status to viewed if customer views it
    if (isCustomer && quotation.status === 'sent') {
      quotation.status = 'viewed';
      await quotation.save();
    }

    res.status(200).json({
      success: true,
      data: quotation
    });
  } catch (error) {
    console.error('❌ Get quotation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Update quotation
// @route   PUT /api/quotations/:id
// @access  Private (Seller)
const updateQuotation = async (req, res) => {
  try {
    let quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: 'Quotation not found'
      });
    }

    // Check if seller owns this quotation
    const seller = await Seller.findOne({ userId: req.user.id });
    if (!seller || quotation.sellerId.toString() !== seller._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this quotation'
      });
    }

    // Only allow updates if quotation is in draft
    if (quotation.status !== 'draft' && quotation.status !== 'changes_requested') {
      return res.status(400).json({
        success: false,
        error: 'Cannot update quotation after it has been sent'
      });
    }

    quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: quotation
    });
  } catch (error) {
    console.error('❌ Update quotation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Send quotation to customer
// @route   PUT /api/quotations/:id/send
// @access  Private (Seller)
const sendQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: 'Quotation not found'
      });
    }

    // Check if seller owns this quotation
    const seller = await Seller.findOne({ userId: req.user.id });
    if (!seller || quotation.sellerId.toString() !== seller._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to send this quotation'
      });
    }

    quotation.status = 'sent';
    quotation.sentAt = Date.now();
    await quotation.save();

    // Update project status
    await Project.findByIdAndUpdate(quotation.projectId, {
      status: 'quoted'
    });

    res.status(200).json({
      success: true,
      data: quotation,
      message: 'Quotation sent to customer'
    });
  } catch (error) {
    console.error('❌ Send quotation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Accept quotation (customer)
// @route   PUT /api/quotations/:id/accept
// @access  Private (Customer)
const acceptQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: 'Quotation not found'
      });
    }

    // Check if customer owns this quotation
    const customer = await Customer.findOne({ userId: req.user.id });
    if (!customer || quotation.customerId.toString() !== customer._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to accept this quotation'
      });
    }

    if (!['sent', 'viewed'].includes(quotation.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot accept quotation with status: ${quotation.status}`
      });
    }

    quotation.status = 'accepted';
    quotation.acceptedAt = Date.now();
    await quotation.save();

    // Update project status
    await Project.findByIdAndUpdate(quotation.projectId, {
      status: 'approved'
    });

    res.status(200).json({
      success: true,
      data: quotation,
      message: 'Quotation accepted successfully'
    });
  } catch (error) {
    console.error('❌ Accept quotation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Reject quotation (customer)
// @route   PUT /api/quotations/:id/reject
// @access  Private (Customer)
const rejectQuotation = async (req, res) => {
  try {
    const { reason } = req.body;
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: 'Quotation not found'
      });
    }

    // Check if customer owns this quotation
    const customer = await Customer.findOne({ userId: req.user.id });
    if (!customer || quotation.customerId.toString() !== customer._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to reject this quotation'
      });
    }

    quotation.status = 'rejected';
    quotation.rejectedAt = Date.now();
    quotation.rejectionReason = reason || 'No reason provided';
    await quotation.save();

    // Update project status back to pending
    await Project.findByIdAndUpdate(quotation.projectId, {
      status: 'pending'
    });

    res.status(200).json({
      success: true,
      data: quotation,
      message: 'Quotation rejected'
    });
  } catch (error) {
    console.error('❌ Reject quotation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Request changes to quotation (customer)
// @route   PUT /api/quotations/:id/request-changes
// @access  Private (Customer)
const requestQuotationChanges = async (req, res) => {
  try {
    const { changeRequests } = req.body;
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: 'Quotation not found'
      });
    }

    // Check if customer owns this quotation
    const customer = await Customer.findOne({ userId: req.user.id });
    if (!customer || quotation.customerId.toString() !== customer._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to request changes'
      });
    }

    if (!['sent', 'viewed'].includes(quotation.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot request changes with status: ${quotation.status}`
      });
    }

    quotation.status = 'changes_requested';
    quotation.changeRequests = changeRequests || [];
    quotation.changeRequestedAt = Date.now();
    await quotation.save();

    res.status(200).json({
      success: true,
      data: quotation,
      message: 'Change requests sent to seller'
    });
  } catch (error) {
    console.error('❌ Request changes error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Delete quotation
// @route   DELETE /api/quotations/:id
// @access  Private (Seller)
const deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: 'Quotation not found'
      });
    }

    // Check if seller owns this quotation
    const seller = await Seller.findOne({ userId: req.user.id });
    if (!seller || quotation.sellerId.toString() !== seller._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this quotation'
      });
    }

    // Remove quotation from project
    await Project.findByIdAndUpdate(quotation.projectId, {
      $pull: { quotations: quotation._id }
    });

    await quotation.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('❌ Delete quotation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// EXPORT ALL FUNCTIONS - USING OBJECT EXPORT (NOT exports.functionName)
module.exports = {
  createQuotation,
  getSellerQuotations,
  getCustomerQuotations,
  getQuotationById,
  updateQuotation,
  sendQuotation,
  acceptQuotation,
  rejectQuotation,
  requestQuotationChanges,
  deleteQuotation
};