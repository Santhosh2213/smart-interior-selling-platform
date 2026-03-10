const Project = require('../models/Project');
const DesignSuggestion = require('../models/DesignSuggestion');
const Measurement = require('../models/Measurement');
const ProjectImage = require('../models/ProjectImage');
const Material = require('../models/Material');
const User = require('../models/User');
const Customer = require('../models/Customer');

// @desc    Get all projects pending design review
// @route   GET /api/designer/queue
// @access  Private (Designer only)
exports.getDesignerQueue = async (req, res) => {
  try {
    console.log('Fetching designer queue for user:', req.user.id);
    
    // Find designer profile
    const Designer = require('../models/Designer');
    const designer = await Designer.findOne({ userId: req.user.id });
    
    if (!designer) {
      return res.status(404).json({
        success: false,
        error: 'Designer profile not found'
      });
    }

    // Get all projects that need design review
    const projects = await Project.find({
      status: { $in: ['PENDING_DESIGN', 'pending'] }
    })
    .lean()
    .sort('-createdAt');
    
    console.log(`Found ${projects.length} projects for designer review`);
    
    // Manually populate data for each project
    const formattedProjects = [];
    
    for (const project of projects) {
      try {
        // Get customer with populated user data
        const customer = await Customer.findById(project.customerId)
          .populate('userId')
          .lean();
        
        // Get measurements
        const measurements = await Measurement.find({ projectId: project._id }).lean();
        
        // Get images
        const images = await ProjectImage.find({ projectId: project._id }).lean();
        
        // Extract customer information correctly
        let customerName = 'Unknown';
        let customerEmail = '';
        let customerPhone = '';
        
        if (customer) {
          // Customer document has userId which references User
          if (customer.userId) {
            customerName = customer.userId.name || customer.name || 'Unknown';
            customerEmail = customer.userId.email || customer.email || '';
            customerPhone = customer.userId.phone || customer.phone || '';
          } else {
            customerName = customer.name || 'Unknown';
            customerEmail = customer.email || '';
            customerPhone = customer.phone || '';
          }
        }
        
        // Calculate total area
        const totalArea = measurements.reduce((sum, m) => {
          return sum + (m.areaSqFt || m.area || 0);
        }, 0);
        
        // Create formatted project object with correct structure
        formattedProjects.push({
          _id: project._id.toString(),
          title: project.title,
          description: project.description,
          status: project.status,
          measurementUnit: project.measurementUnit || 'feet',
          totalArea: totalArea,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          
          // Customer info at top level for easy access
          customerName: customerName,
          customerEmail: customerEmail,
          customerPhone: customerPhone,
          
          // Full customer object
          customer: {
            _id: customer?._id?.toString(),
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            userId: customer?.userId
          },
          
          // Arrays
          measurements: measurements.map(m => ({
            ...m,
            _id: m._id.toString()
          })),
          images: images.map(img => ({
            ...img,
            _id: img._id.toString()
          })),
          
          // Counts
          roomCount: measurements.length,
          photoCount: images.length
        });
        
        console.log(`Formatted project ${project.title}:`, {
          customerName,
          roomCount: measurements.length,
          photoCount: images.length
        });
        
      } catch (err) {
        console.error(`Error formatting project ${project._id}:`, err);
        formattedProjects.push({
          ...project,
          _id: project._id.toString(),
          customerName: 'Error loading customer',
          customer: null,
          measurements: [],
          images: [],
          roomCount: 0,
          photoCount: 0,
          totalArea: 0
        });
      }
    }
    
    res.json({
      success: true,
      count: formattedProjects.length,
      data: formattedProjects
    });
    
  } catch (error) {
    console.error('Error in getDesignerQueue:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// @desc    Get single project for design consultation
// @route   GET /api/designer/project/:id
// @access  Private (Designer only)
exports.getProjectForDesign = async (req, res) => {
  try {
    console.log('Fetching project for design:', req.params.id);
    
    const project = await Project.findById(req.params.id).lean();
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      });
    }
    
    // Get customer with populated user data
    const customer = await Customer.findById(project.customerId)
      .populate('userId')
      .lean();
    
    // Get measurements
    const measurements = await Measurement.find({ projectId: project._id }).lean();
    
    // Get images
    const images = await ProjectImage.find({ projectId: project._id }).lean();
    
    // Get existing design suggestion
    const existingSuggestion = await DesignSuggestion.findOne({
      projectId: project._id,
      status: { $in: ['DRAFT', 'SUBMITTED'] }
    })
    .populate('recommendations.materialId')
    .lean();
    
    // Extract customer information correctly
    let customerName = 'Unknown';
    let customerEmail = '';
    let customerPhone = '';
    
    if (customer) {
      if (customer.userId) {
        customerName = customer.userId.name || customer.name || 'Unknown';
        customerEmail = customer.userId.email || customer.email || '';
        customerPhone = customer.userId.phone || customer.phone || '';
      } else {
        customerName = customer.name || 'Unknown';
        customerEmail = customer.email || '';
        customerPhone = customer.phone || '';
      }
    }
    
    // Calculate total area
    const totalArea = measurements.reduce((sum, m) => {
      return sum + (m.areaSqFt || m.area || 0);
    }, 0);
    
    const formattedProject = {
      _id: project._id.toString(),
      title: project.title,
      description: project.description,
      status: project.status,
      measurementUnit: project.measurementUnit || 'feet',
      totalArea: totalArea,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      
      // Customer info at top level
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerPhone,
      
      // Full customer object
      customer: {
        _id: customer?._id?.toString(),
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: customer?.address,
        userId: customer?.userId
      },
      
      // Arrays
      measurements: measurements.map(m => ({
        ...m,
        _id: m._id.toString()
      })),
      images: images.map(img => ({
        ...img,
        _id: img._id.toString()
      })),
      
      // Counts
      roomCount: measurements.length,
      photoCount: images.length
    };
    
    res.json({ 
      success: true, 
      data: {
        project: formattedProject,
        existingSuggestion: existingSuggestion || null
      }
    });
    
  } catch (error) {
    console.error('Error in getProjectForDesign:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// @desc    Create or update design suggestion
// @route   POST /api/designer/suggestions
// @access  Private (Designer only)
exports.createDesignSuggestion = async (req, res) => {
  try {
    const { 
      projectId, 
      recommendations, 
      designNotes,
      suggestedTheme,
      colorScheme,
      estimatedTimeline,
      status = 'SUBMITTED'
    } = req.body;
    
    console.log('Creating design suggestion for project:', projectId);
    
    // Find designer profile
    const Designer = require('../models/Designer');
    const designer = await Designer.findOne({ userId: req.user.id });
    
    if (!designer) {
      return res.status(404).json({
        success: false,
        error: 'Designer profile not found'
      });
    }
    
    // Validate project exists
    const project = await Project.findById(projectId).populate('customerId');
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      });
    }
    
    // Check for existing draft or submitted suggestion
    let suggestion = await DesignSuggestion.findOne({
      projectId,
      status: { $in: ['DRAFT', 'SUBMITTED'] }
    });
    
    if (suggestion) {
      // Update existing suggestion
      suggestion.recommendations = recommendations;
      suggestion.designNotes = designNotes;
      suggestion.suggestedTheme = suggestedTheme;
      suggestion.colorScheme = colorScheme;
      suggestion.estimatedTimeline = estimatedTimeline;
      suggestion.status = status;
      suggestion.version += 1;
      
      await suggestion.save();
      console.log('Updated existing suggestion:', suggestion._id);
    } else {
      // Create new suggestion
      suggestion = await DesignSuggestion.create({
        projectId,
        designerId: designer._id,
        recommendations,
        designNotes,
        suggestedTheme,
        colorScheme,
        estimatedTimeline,
        status,
        customerResponse: 'PENDING'
      });
      console.log('Created new suggestion:', suggestion._id);
    }
    
    // Update project status if suggestion is submitted
    if (status === 'SUBMITTED') {
      project.status = 'DESIGN_COMPLETED';
      project.designSuggestionId = suggestion._id;
      project.designerReviewed = true;
      project.designerReviewedAt = new Date();
      await project.save();
      
      // Get customer user ID
      const Customer = require('../models/Customer');
      const customer = await Customer.findById(project.customerId).populate('userId');
      
      // Send notification to customer
      if (customer && customer.userId) {
        const Notification = require('../models/Notification');
        await Notification.create({
          userId: customer.userId._id,
          type: 'DESIGN_SUBMITTED',
          title: 'Design Suggestions Ready',
          message: `Designer has submitted suggestions for your project: ${project.title}`,
          relatedId: project._id,
          onModel: 'Project',
          actionUrl: `/customer/projects/${project._id}`
        });
        console.log('Notification sent to customer');
      }
      
      // Send notification to seller (if assigned)
      if (project.assignedSeller) {
        const Seller = require('../models/Seller');
        const seller = await Seller.findById(project.assignedSeller).populate('userId');
        
        if (seller && seller.userId) {
          const Notification = require('../models/Notification');
          await Notification.create({
            userId: seller.userId._id,
            type: 'DESIGN_SUBMITTED',
            title: 'Design Suggestions Ready',
            message: `Design submitted for project: ${project.title}`,
            relatedId: project._id,
            onModel: 'Project',
            actionUrl: `/seller/queue/${project._id}`
          });
          console.log('Notification sent to seller');
        }
      }
    }
    
    res.json({ 
      success: true, 
      data: suggestion,
      message: status === 'SUBMITTED' 
        ? 'Design suggestion submitted successfully. Customer has been notified.' 
        : 'Design suggestion saved as draft'
    });
    
  } catch (error) {
    console.error('Error in createDesignSuggestion:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// @desc    Get designer's past suggestions
// @route   GET /api/designer/suggestions/history
// @access  Private (Designer only)
exports.getSuggestionHistory = async (req, res) => {
  try {
    console.log('Fetching suggestion history for user:', req.user.id);
    
    // Find designer profile
    const Designer = require('../models/Designer');
    const designer = await Designer.findOne({ userId: req.user.id });
    
    if (!designer) {
      return res.status(404).json({
        success: false,
        error: 'Designer profile not found'
      });
    }
    
    const suggestions = await DesignSuggestion.find({
      designerId: designer._id,
      status: { $ne: 'DRAFT' }
    })
    .populate({
      path: 'projectId',
      select: 'title status createdAt'
    })
    .populate({
      path: 'recommendations.materialId',
      select: 'name price unit category'
    })
    .sort('-createdAt')
    .limit(50)
    .lean();
    
    console.log(`Found ${suggestions.length} suggestions`);
    
    res.json({
      success: true,
      count: suggestions.length,
      data: suggestions
    });
    
  } catch (error) {
    console.error('Error in getSuggestionHistory:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// @desc    Get materials for recommendation
// @route   GET /api/designer/materials
// @access  Private (Designer only)
exports.getMaterials = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    console.log('Fetching materials with query:', query);
    
    const materials = await Material.find(query)
      .sort('name')
      .limit(100)
      .lean();
    
    // Add GST info manually based on category
    const materialsWithGST = materials.map(material => {
      if (!material.gstRate) {
        const gstRates = {
          'tiles': 5,
          'wood': 12,
          'glass': 18,
          'paints': 18,
          'hardware': 12,
          'electrical': 18,
          'plumbing': 18,
          'other': 18
        };
        material.gstRate = gstRates[material.category] || 18;
      }
      return material;
    });
    
    console.log(`Found ${materialsWithGST.length} materials`);
    
    res.json({
      success: true,
      count: materialsWithGST.length,
      data: materialsWithGST
    });
    
  } catch (error) {
    console.error('Error in getMaterials:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};