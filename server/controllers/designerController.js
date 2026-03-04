const Project = require('../models/Project');
const DesignSuggestion = require('../models/DesignSuggestion');
const Measurement = require('../models/Measurement');
const ProjectImage = require('../models/ProjectImage');
const Material = require('../models/Material');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Designer = require('../models/Designer');
const Seller = require('../models/Seller');
const { createNotification } = require('./notificationController');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all projects pending design review
// @route   GET /api/designer/queue
// @access  Private (Designer only)
const getDesignerQueue = async (req, res) => {
  try {
    console.log('Fetching designer queue for user:', req.user.id);
    
    const designer = await Designer.findOne({ userId: req.user.id });
    
    if (!designer) {
      return res.status(404).json({
        success: false,
        error: 'Designer profile not found'
      });
    }

    const projects = await Project.find({
      $or: [
        { status: { $in: ['PENDING_DESIGN', 'pending'] } },
        { designStatus: { $in: ['DESIGN_IN_PROGRESS', 'CHANGES_REQUESTED'] } }
      ]
    })
    .lean()
    .sort('-createdAt');
    
    console.log(`Found ${projects.length} projects for designer review`);
    
    const formattedProjects = [];
    
    for (const project of projects) {
      try {
        const customer = await Customer.findById(project.customerId)
          .populate('userId')
          .lean();
        
        const measurements = await Measurement.find({ projectId: project._id }).lean();
        const images = await ProjectImage.find({ projectId: project._id }).lean();
        
        // Get latest design suggestion
        const latestDesign = await DesignSuggestion.findOne({ 
          projectId: project._id 
        }).sort('-version').lean();
        
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
        
        const totalArea = measurements.reduce((sum, m) => {
          return sum + (m.areaSqFt || m.area || 0);
        }, 0);
        
        formattedProjects.push({
          ...project,
          _id: project._id.toString(),
          customerName,
          customerEmail,
          customerPhone,
          measurements,
          images,
          roomCount: measurements.length,
          photoCount: images.length,
          totalArea,
          measurementUnit: project.measurementUnit || 'feet',
          hasExistingDesign: !!latestDesign,
          designStatus: latestDesign?.status || 'NO_DESIGN',
          designVersion: latestDesign?.version || 0
        });
        
      } catch (err) {
        console.error(`Error formatting project ${project._id}:`, err);
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
const getProjectForDesign = async (req, res) => {
  try {
    console.log('Fetching project for design:', req.params.id);
    
    const project = await Project.findById(req.params.id).lean();
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      });
    }
    
    const customer = await Customer.findById(project.customerId)
      .populate('userId')
      .lean();
    
    const measurements = await Measurement.find({ projectId: project._id }).lean();
    const images = await ProjectImage.find({ projectId: project._id }).lean();
    
    // Get all design suggestions for this project
    const designHistory = await DesignSuggestion.find({ 
      projectId: project._id 
    })
    .sort('-version')
    .lean();
    
    const existingSuggestion = designHistory.length > 0 ? designHistory[0] : null;
    
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
    
    const totalArea = measurements.reduce((sum, m) => {
      return sum + (m.areaSqFt || m.area || 0);
    }, 0);
    
    const formattedProject = {
      _id: project._id.toString(),
      title: project.title,
      description: project.description,
      status: project.status,
      designStatus: project.designStatus,
      measurementUnit: project.measurementUnit || 'feet',
      totalArea,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      
      customerName,
      customerEmail,
      customerPhone,
      
      customer: {
        _id: customer?._id?.toString(),
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: customer?.address
      },
      
      measurements: measurements.map(m => ({
        ...m,
        _id: m._id.toString()
      })),
      
      images: images.map(img => ({
        ...img,
        _id: img._id.toString()
      })),
      
      roomCount: measurements.length,
      photoCount: images.length,
      designHistory
    };
    
    res.json({ 
      success: true, 
      data: {
        project: formattedProject,
        existingSuggestion,
        designHistory
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

// @desc    Upload design images
// @route   POST /api/designer/upload-design-images
// @access  Private (Designer only)
const uploadDesignImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No images uploaded'
      });
    }

    const uploadedImages = [];
    
    for (const file of req.files) {
      uploadedImages.push({
        imageUrl: file.path,
        publicId: file.filename,
        description: req.body.description || ''
      });
    }
    
    res.json({
      success: true,
      data: uploadedImages
    });
    
  } catch (error) {
    console.error('Error uploading design images:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create or update design suggestion
// @route   POST /api/designer/suggestions
// @access  Private (Designer only)
const createDesignSuggestion = async (req, res) => {
  try {
    const { 
      projectId, 
      recommendations, 
      designNotes,
      suggestedTheme,
      colorScheme,
      estimatedTimeline,
      designImages,
      status = 'SUBMITTED',
      isRevision = false,
      changeRequestId = null
    } = req.body;
    
    console.log('Creating design suggestion for project:', projectId);
    
    const designer = await Designer.findOne({ userId: req.user.id });
    
    if (!designer) {
      return res.status(404).json({
        success: false,
        error: 'Designer profile not found'
      });
    }
    
    const project = await Project.findById(projectId)
      .populate({
        path: 'customerId',
        populate: { path: 'userId' }
      });
      
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      });
    }
    
    // Get the latest version
    const latestVersion = await DesignSuggestion.findOne({ projectId })
      .sort('-version')
      .select('version');
    
    const newVersion = latestVersion ? latestVersion.version + 1 : 1;
    
    // If this is a revision, find the previous version that had the change request
    let previousVersion = null;
    if (isRevision && changeRequestId) {
      previousVersion = await DesignSuggestion.findOne({ 
        projectId,
        'changeRequests._id': changeRequestId
      });
    }
    
    // Create new design suggestion
    const suggestion = await DesignSuggestion.create({
      projectId,
      designerId: designer._id,
      version: newVersion,
      recommendations: recommendations || [],
      designNotes: designNotes || '',
      suggestedTheme: suggestedTheme || '',
      colorScheme: colorScheme || { primary: '#3B82F6', secondary: '#10B981', accent: '#F59E0B' },
      estimatedTimeline: estimatedTimeline || {
        designDays: 3,
        materialProcurementDays: 5,
        installationDays: 7
      },
      designImages: designImages || [],
      status: status === 'SUBMITTED' ? 'SUBMITTED' : 'DRAFT',
      customerResponse: 'PENDING',
      previousVersionId: previousVersion?._id
    });
    
    console.log('Design suggestion created version:', newVersion);
    
    // Update project with the new design suggestion ID
    project.designSuggestionId = suggestion._id;
    project.currentDesignVersion = newVersion;
    project.designStatus = status === 'SUBMITTED' ? 'DESIGN_SUBMITTED' : 'DESIGN_IN_PROGRESS';
    await project.save();
    
    // Handle change request if this is a revision
    if (isRevision && changeRequestId && previousVersion) {
      previousVersion.implementChangeRequest(changeRequestId, 'Implemented in version ' + newVersion);
      await previousVersion.save();
      
      suggestion.previousVersionId = previousVersion._id;
      previousVersion.nextVersionId = suggestion._id;
      await previousVersion.save();
    }
    
    // Send notifications if submitted
    if (status === 'SUBMITTED') {
      // Notify customer
      if (project.customerId && project.customerId.userId) {
        await createNotification(
          project.customerId.userId._id,
          'DESIGN_UPDATED', // Use DESIGN_UPDATED instead of DESIGN_SUBMITTED for revisions
          'Design Updated',
          `Designer has updated the design for your project: ${project.title} (Version ${newVersion})`,
          project._id,
          'Project',
          `/customer/design-review/${project._id}`,
          { designVersion: newVersion, isUpdate: true }
        );
      }
      
      // Notify seller
      if (project.assignedSeller) {
        const seller = await Seller.findById(project.assignedSeller).populate('userId');
        if (seller && seller.userId) {
          await createNotification(
            seller.userId._id,
            'DESIGN_UPDATED',
            'Design Updated',
            `Design for project ${project.title} has been updated to version ${newVersion}`,
            project._id,
            'Project',
            `/seller/project/${project._id}`,
            { designVersion: newVersion }
          );
        }
      }
      
      suggestion.submittedAt = new Date();
      suggestion.customerNotifiedAt = new Date();
      await suggestion.save();
    }
    
    res.json({ 
      success: true, 
      data: suggestion,
      message: status === 'SUBMITTED' 
        ? (isRevision ? 'Design updated successfully. Customer has been notified.' : 'Design suggestion submitted successfully. Customer has been notified.')
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
const getSuggestionHistory = async (req, res) => {
  try {
    console.log('Fetching suggestion history for user:', req.user.id);
    
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

// @desc    Get design history for a project
// @route   GET /api/designer/project/:id/design-history
// @access  Private (Designer only)
const getDesignHistory = async (req, res) => {
  try {
    const designs = await DesignSuggestion.find({ 
      projectId: req.params.id 
    })
    .sort('-version')
    .populate('designerId', 'name')
    .lean();
    
    res.json({
      success: true,
      count: designs.length,
      data: designs
    });
    
  } catch (error) {
    console.error('Error in getDesignHistory:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get materials for recommendation
// @route   GET /api/designer/materials
// @access  Private (Designer only)
const getMaterials = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    const materials = await Material.find(query)
      .sort('name')
      .limit(100)
      .lean();
    
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

// Export all functions
module.exports = {
  getDesignerQueue,
  getProjectForDesign,
  createDesignSuggestion,
  getSuggestionHistory,
  getMaterials,
  uploadDesignImages,
  getDesignHistory
};