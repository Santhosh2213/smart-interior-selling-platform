const Project = require('../models/Project');
const Quotation = require('../models/Quotation');
const Customer = require('../models/Customer');
const Seller = require('../models/Seller');
const Designer = require('../models/Designer');

// @desc    Get seller dashboard data
// @route   GET /api/dashboard/seller
// @access  Private (Seller only)
exports.getSellerDashboard = async (req, res) => {
  try {
    console.log('Fetching seller dashboard for user:', req.user.id);
    
    // Get seller profile
    const seller = await Seller.findOne({ userId: req.user.id });
    
    if (!seller) {
      console.log('Seller profile not found for user:', req.user.id);
      return res.status(404).json({ 
        success: false, 
        error: 'Seller profile not found' 
      });
    }

    console.log('Seller found:', seller._id);

    // Get all projects (pending and assigned)
    const allProjects = await Project.find({ 
      $or: [
        { assignedSeller: seller._id },
        { status: 'pending', assignedSeller: null }
      ]
    }).populate({
      path: 'customerId',
      populate: {
        path: 'userId',
        model: 'User',
        select: 'name email phone'
      }
    });

    console.log(`Found ${allProjects.length} projects`);

    // Get all quotations for this seller
    const quotations = await Quotation.find({ sellerId: seller._id });
    console.log(`Found ${quotations.length} quotations`);

    // Calculate stats
    const stats = {
      totalProjects: allProjects.length,
      pending: allProjects.filter(p => p.status === 'pending').length,
      inProgress: allProjects.filter(p => p.status === 'quoting').length,
      quoted: allProjects.filter(p => p.status === 'quoted').length,
      completed: allProjects.filter(p => p.status === 'completed').length,
      totalRevenue: quotations
        .filter(q => q.status === 'accepted')
        .reduce((sum, q) => sum + (q.total || 0), 0)
    };

    console.log('Stats calculated:', stats);

    // Get recent projects (last 5)
    const recentProjects = await Project.find({ 
      $or: [
        { assignedSeller: seller._id },
        { status: 'pending', assignedSeller: null }
      ]
    })
      .populate({
        path: 'customerId',
        populate: {
          path: 'userId',
          model: 'User',
          select: 'name'
        }
      })
      .sort('-createdAt')
      .limit(5)
      .lean();

    // Format recent projects
    const formattedRecentProjects = recentProjects.map(p => ({
      _id: p._id,
      title: p.title || 'Untitled Project',
      customerName: p.customerId?.userId?.name || 'Unknown Customer',
      status: p.status || 'unknown',
      createdAt: p.createdAt
    }));

    // Get recent quotations
    const recentQuotations = await Quotation.find({ sellerId: seller._id })
      .populate({
        path: 'projectId',
        select: 'title'
      })
      .sort('-createdAt')
      .limit(5)
      .lean();

    // Format recent quotations
    const formattedRecentQuotations = recentQuotations.map(q => ({
      _id: q._id,
      quotationNumber: q.quotationNumber || 'N/A',
      projectTitle: q.projectId?.title || 'Unknown Project',
      total: q.total || 0,
      status: q.status || 'draft',
      createdAt: q.createdAt
    }));

    res.json({
      success: true,
      data: {
        stats,
        recentProjects: formattedRecentProjects,
        recentQuotations: formattedRecentQuotations
      }
    });
  } catch (error) {
    console.error('❌ Seller Dashboard Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server Error: ' + error.message 
    });
  }
};

// @desc    Get designer dashboard data
// @route   GET /api/dashboard/designer
// @access  Private (Designer only)
exports.getDesignerDashboard = async (req, res) => {
  try {
    console.log('Fetching designer dashboard for user:', req.user.id);
    
    const designer = await Designer.findOne({ userId: req.user.id });
    
    if (!designer) {
      return res.status(404).json({ 
        success: false, 
        error: 'Designer profile not found' 
      });
    }

    // Get projects assigned to this designer
    const projects = await Project.find({ assignedDesigner: designer._id })
      .populate({
        path: 'customerId',
        populate: {
          path: 'userId',
          model: 'User',
          select: 'name email phone'
        }
      })
      .sort('-createdAt');

    // Calculate stats
    const stats = {
      totalConsultations: projects.length,
      pending: projects.filter(p => p.status === 'pending').length,
      inProgress: projects.filter(p => p.status === 'quoting').length,
      completed: projects.filter(p => p.status === 'completed').length
    };

    // Get recent consultations
    const recentConsultations = projects.slice(0, 5).map(p => ({
      _id: p._id,
      title: p.title || 'Untitled Project',
      customerName: p.customerId?.userId?.name || 'Unknown',
      status: p.status || 'unknown',
      createdAt: p.createdAt
    }));

    res.json({
      success: true,
      data: {
        stats,
        recentConsultations
      }
    });
  } catch (error) {
    console.error('❌ Designer Dashboard Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server Error: ' + error.message 
    });
  }
};

// @desc    Get customer dashboard data
// @route   GET /api/dashboard/customer
// @access  Private (Customer only)
exports.getCustomerDashboard = async (req, res) => {
  try {
    console.log('Fetching customer dashboard for user:', req.user.id);
    
    const customer = await Customer.findOne({ userId: req.user.id });
    
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        error: 'Customer profile not found' 
      });
    }

    // Get customer's projects
    const projects = await Project.find({ customerId: customer._id })
      .populate('measurements')
      .populate('images')
      .populate('quotations')
      .sort('-createdAt');

    // Calculate stats
    const stats = {
      total: projects.length,
      draft: projects.filter(p => p.status === 'draft').length,
      pending: projects.filter(p => p.status === 'pending').length,
      quoted: projects.filter(p => p.status === 'quoted').length,
      approved: projects.filter(p => p.status === 'approved').length,
      completed: projects.filter(p => p.status === 'completed').length
    };

    res.json({
      success: true,
      data: {
        stats,
        recentProjects: projects.slice(0, 5),
        allProjects: projects
      }
    });
  } catch (error) {
    console.error('❌ Customer Dashboard Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server Error: ' + error.message 
    });
  }
};