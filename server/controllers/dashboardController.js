const Project = require('../models/Project');
const Quotation = require('../models/Quotation');
const Customer = require('../models/Customer');
const Seller = require('../models/Seller');

// @desc    Get seller dashboard data
// @route   GET /api/dashboard/seller
// @access  Private (Seller)
exports.getSellerDashboard = async (req, res) => {
  try {
    console.log('Fetching seller dashboard for user:', req.user.id);
    
    // Find seller profile
    const seller = await Seller.findOne({ userId: req.user.id });
    if (!seller) {
      return res.status(404).json({
        success: false,
        error: 'Seller profile not found'
      });
    }
    console.log('Seller found:', seller._id);

    // Get all projects assigned to this seller or pending
    const projects = await Project.find({
      $or: [
        { assignedSeller: seller._id },
        { assignedSeller: null, status: { $in: ['pending', 'PENDING_DESIGN'] } }
      ]
    })
    .populate({
      path: 'customerId',
      populate: {
        path: 'userId',
        select: 'name email phone'
      }
    })
    .sort('-createdAt')
    .lean();

    console.log(`Found ${projects.length} projects`);

    // Get quotations for these projects
    const projectIds = projects.map(p => p._id);
    const quotations = await Quotation.find({ 
      projectId: { $in: projectIds },
      sellerId: seller._id
    }).lean();

    console.log(`Found ${quotations.length} quotations`);

    // Calculate statistics
    const stats = {
      totalProjects: projects.length,
      pending: projects.filter(p => p.status === 'pending' || p.status === 'PENDING_DESIGN').length,
      inProgress: projects.filter(p => p.status === 'quoting' || p.status === 'DESIGN_IN_PROGRESS').length,
      quoted: projects.filter(p => p.status === 'quoted' || p.status === 'DESIGN_APPROVED').length,
      completed: projects.filter(p => p.status === 'completed').length,
      totalRevenue: quotations
        .filter(q => q.status === 'accepted')
        .reduce((sum, q) => sum + (q.total || 0), 0)
    };

    console.log('Stats calculated:', stats);

    // Format recent projects (last 3)
    const recentProjects = projects.slice(0, 3).map(project => {
      // Extract customer name
      let customerName = 'Unknown';
      if (project.customerId) {
        if (project.customerId.userId) {
          customerName = project.customerId.userId.name || project.customerId.name || 'Unknown';
        } else {
          customerName = project.customerId.name || 'Unknown';
        }
      }

      return {
        _id: project._id,
        title: project.title,
        status: project.status,
        customerName,
        createdAt: project.createdAt,
        totalArea: project.totalArea,
        measurementUnit: project.measurementUnit
      };
    });

    res.json({
      success: true,
      stats,
      recentProjects,
      quotations: quotations.length
    });

  } catch (error) {
    console.error('Error in getSellerDashboard:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// @desc    Get customer dashboard data
// @route   GET /api/dashboard/customer
// @access  Private (Customer)
exports.getCustomerDashboard = async (req, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.user.id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer profile not found'
      });
    }

    const projects = await Project.find({ customerId: customer._id })
      .populate('measurements')
      .populate('images')
      .sort('-createdAt')
      .lean();

    const quotations = await Quotation.find({ 
      customerId: customer._id,
      status: { $in: ['sent', 'accepted', 'rejected'] }
    }).lean();

    const stats = {
      totalProjects: projects.length,
      draft: projects.filter(p => p.status === 'draft').length,
      pending: projects.filter(p => p.status === 'pending' || p.status === 'PENDING_DESIGN').length,
      designReady: projects.filter(p => p.status === 'DESIGN_COMPLETED' || p.status === 'DESIGN_SUBMITTED').length,
      quoted: quotations.filter(q => q.status === 'sent').length,
      completed: projects.filter(p => p.status === 'completed').length
    };

    res.json({
      success: true,
      stats,
      projects: projects.slice(0, 5),
      quotations: quotations.slice(0, 5)
    });

  } catch (error) {
    console.error('Error in getCustomerDashboard:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// @desc    Get designer dashboard data
// @route   GET /api/dashboard/designer
// @access  Private (Designer)
exports.getDesignerDashboard = async (req, res) => {
  try {
    const Designer = require('../models/Designer');
    const DesignSuggestion = require('../models/DesignSuggestion');

    const designer = await Designer.findOne({ userId: req.user.id });
    if (!designer) {
      return res.status(404).json({
        success: false,
        error: 'Designer profile not found'
      });
    }

    const projects = await Project.find({
      $or: [
        { assignedDesigner: designer._id },
        { status: 'PENDING_DESIGN', assignedDesigner: null }
      ]
    })
    .populate({
      path: 'customerId',
      populate: {
        path: 'userId',
        select: 'name email'
      }
    })
    .sort('-createdAt')
    .lean();

    const suggestions = await DesignSuggestion.find({ 
      designerId: designer._id 
    })
    .sort('-createdAt')
    .limit(10)
    .lean();

    const stats = {
      pending: projects.filter(p => p.status === 'PENDING_DESIGN').length,
      inProgress: projects.filter(p => p.designStatus === 'DESIGN_IN_PROGRESS').length,
      completed: suggestions.filter(s => s.status === 'APPROVED').length,
      total: projects.length
    };

    res.json({
      success: true,
      stats,
      projects: projects.slice(0, 5),
      recentSuggestions: suggestions.slice(0, 5)
    });

  } catch (error) {
    console.error('Error in getDesignerDashboard:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};