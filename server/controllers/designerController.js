const Project = require('../models/Project');
const Designer = require('../models/Designer');
const DesignerSuggestion = require('../models/DesignerSuggestion');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Material = require('../models/Material');
const { createNotification } = require('./notificationController');

// @desc    Get designer dashboard
// @route   GET /api/designer/dashboard
// @access  Private (Designer)
// @desc    Get designer dashboard
// @route   GET /api/designer/dashboard
// @access  Private (Designer)
exports.getDesignerDashboard = async (req, res) => {
  try {
    console.log('Fetching designer dashboard for user:', req.user.id);
    
    // Get designer profile
    const designer = await Designer.findOne({ userId: req.user.id });
    
    if (!designer) {
      return res.status(404).json({ 
        success: false, 
        error: 'Designer profile not found' 
      });
    }

    // Get ALL projects assigned to this designer - REAL DATA FROM DATABASE
    const allProjects = await Project.find({ 
      designerId: designer._id 
    }).populate({
      path: 'customerId',
      populate: {
        path: 'userId',
        model: 'User',
        select: 'name email phone'
      }
    });

    console.log(`Found ${allProjects.length} real projects for designer`);

    // Calculate stats from REAL data
    const stats = {
      totalConsultations: allProjects.length,
      pending: allProjects.filter(p => p.status === 'pending').length,
      inProgress: allProjects.filter(p => p.status === 'quoting').length,
      completed: allProjects.filter(p => ['completed', 'approved'].includes(p.status)).length,
      pendingReviews: allProjects.filter(p => !p.designerReviewed && p.images?.length > 0).length,
      suggestionsMade: allProjects.filter(p => p.designerSuggestions?.length > 0).length,
      approvedSuggestions: 0 // You can calculate this from suggestions
    };

    // Get recent projects - REAL DATA
    const recentProjects = await Project.find({ 
      designerId: designer._id 
    })
      .populate({
        path: 'customerId',
        populate: {
          path: 'userId',
          model: 'User',
          select: 'name'
        }
      })
      .populate('images')
      .sort('-createdAt')
      .limit(5)
      .lean();

    // Format the REAL data for frontend
    const formattedRecentProjects = recentProjects.map(p => ({
      _id: p._id,
      title: p.title || 'Untitled Project',
      customerName: p.customerId?.userId?.name || 'Unknown',
      status: p.status,
      hasImages: p.images?.length > 0,
      imageCount: p.images?.length || 0,
      reviewed: p.designerReviewed || false,
      createdAt: p.createdAt,
      needsAttention: !p.designerReviewed && p.images?.length > 0
    }));

    res.json({
      success: true,
      data: {
        stats, // REAL stats from database
        recentProjects: formattedRecentProjects, // REAL projects from database
        designer: {
          id: designer._id,
          name: req.user.name,
          specialization: designer.specialization || [],
          experience: designer.experience || 0
        }
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

// @desc    Get assigned projects
// @route   GET /api/designer/projects
// @access  Private (Designer)
exports.getAssignedProjects = async (req, res) => {
  try {
    const designer = await Designer.findOne({ userId: req.user.id });
    
    if (!designer) {
      return res.status(404).json({ 
        success: false, 
        error: 'Designer profile not found' 
      });
    }

    const projects = await Project.find({ designerId: designer._id })
      .populate({
        path: 'customerId',
        populate: {
          path: 'userId',
          model: 'User',
          select: 'name email phone'
        }
      })
      .populate('images')
      .populate('measurements')
      .populate({
        path: 'designerSuggestions',
        options: { sort: { createdAt: -1 } }
      })
      .sort('-createdAt');

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('❌ Get Assigned Projects Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server Error: ' + error.message 
    });
  }
};

// @desc    Get single project for designer review
// @route   GET /api/designer/projects/:id
// @access  Private (Designer)
exports.getProjectForReview = async (req, res) => {
  try {
    const designer = await Designer.findOne({ userId: req.user.id });
    
    if (!designer) {
      return res.status(404).json({ 
        success: false, 
        error: 'Designer profile not found' 
      });
    }

    const project = await Project.findById(req.params.id)
      .populate({
        path: 'customerId',
        populate: {
          path: 'userId',
          model: 'User',
          select: 'name email phone'
        }
      })
      .populate('images')
      .populate('measurements')
      .populate({
        path: 'designerSuggestions',
        populate: {
          path: 'materialRecommendations.materialId',
          model: 'Material'
        }
      });

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      });
    }

    // Check if designer is assigned to this project
    if (project.designerId?.toString() !== designer._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to view this project' 
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('❌ Get Project For Review Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server Error: ' + error.message 
    });
  }
};

// @desc    Add design suggestions
// @route   POST /api/designer/projects/:projectId/suggestions
// @access  Private (Designer)
exports.addDesignSuggestions = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, category, materialRecommendations, notes, images } = req.body;

    const designer = await Designer.findOne({ userId: req.user.id });
    
    if (!designer) {
      return res.status(404).json({ 
        success: false, 
        error: 'Designer profile not found' 
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      });
    }

    // Check if designer is assigned to this project
    if (project.designerId?.toString() !== designer._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to modify this project' 
      });
    }

    // Create suggestion
    const suggestion = await DesignerSuggestion.create({
      projectId: project._id,
      designerId: designer._id,
      title: title || 'Design Suggestions',
      description: description || '',
      category: category || 'other',
      materialRecommendations: materialRecommendations || [],
      notes: notes || '',
      images: images || [],
      status: 'submitted'
    });

    // Add to project
    project.designerSuggestions.push(suggestion._id);
    project.designerReviewed = true;
    project.designerReviewedAt = Date.now();
    project.status = 'quoting'; // Update status
    await project.save();

    // Notify seller
    const seller = await User.findOne({ role: 'seller' });
    if (seller) {
      await createNotification(
        seller._id,
        'New Design Suggestions',
        `Designer has added suggestions for project: ${project.title}`,
        'info',
        `/seller/projects/${project._id}`
      );
    }

    res.status(201).json({
      success: true,
      data: suggestion,
      message: 'Design suggestions added successfully'
    });
  } catch (error) {
    console.error('❌ Add Design Suggestions Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server Error: ' + error.message 
    });
  }
};

// @desc    Get material recommendations for project
// @route   GET /api/designer/projects/:projectId/recommendations
// @access  Private (Designer)
exports.getMaterialRecommendations = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId)
      .populate('measurements');

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      });
    }

    // Calculate total area
    const totalArea = project.measurements?.reduce((sum, m) => {
      return sum + (m.areaSqFt || m.areaSqM || 0);
    }, 0) || 0;

    // Get popular materials based on category
    const materials = await Material.find({ isActive: true })
      .limit(20)
      .lean();

    // Categorize materials
    const categorizedMaterials = {
      tiles: materials.filter(m => m.category === 'tiles'),
      wood: materials.filter(m => m.category === 'wood'),
      glass: materials.filter(m => m.category === 'glass'),
      paints: materials.filter(m => m.category === 'paints'),
      hardware: materials.filter(m => m.category === 'hardware'),
      others: materials.filter(m => m.category === 'others')
    };

    res.json({
      success: true,
      data: {
        totalArea,
        measurements: project.measurements,
        materials: categorizedMaterials,
        projectTitle: project.title
      }
    });
  } catch (error) {
    console.error('❌ Get Material Recommendations Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server Error: ' + error.message 
    });
  }
};

// @desc    Update suggestion status
// @route   PUT /api/designer/suggestions/:suggestionId
// @access  Private (Designer/Seller)
exports.updateSuggestionStatus = async (req, res) => {
  try {
    const { suggestionId } = req.params;
    const { status, feedback } = req.body;

    const suggestion = await DesignerSuggestion.findById(suggestionId)
      .populate('projectId');

    if (!suggestion) {
      return res.status(404).json({ 
        success: false, 
        error: 'Suggestion not found' 
      });
    }

    suggestion.status = status;
    if (feedback) {
      suggestion.feedback = feedback;
    }
    if (status === 'reviewed' || status === 'approved' || status === 'rejected') {
      suggestion.reviewedAt = Date.now();
      suggestion.reviewedBy = req.user.id;
    }
    await suggestion.save();

    res.json({
      success: true,
      data: suggestion,
      message: `Suggestion ${status} successfully`
    });
  } catch (error) {
    console.error('❌ Update Suggestion Status Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server Error: ' + error.message 
    });
  }
};

// @desc    Send suggestions to seller
// @route   POST /api/designer/projects/:projectId/send-to-seller
// @access  Private (Designer)
exports.sendToSeller = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate('designerSuggestions');

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      });
    }

    // Check if there are any suggestions
    if (!project.designerSuggestions || project.designerSuggestions.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No suggestions to send. Please add suggestions first.' 
      });
    }

    // Update project status
    project.status = 'quoted';
    await project.save();

    // Notify seller
    const seller = await User.findOne({ role: 'seller' });
    if (seller) {
      await createNotification(
        seller._id,
        'Design Suggestions Ready',
        `Designer has completed review for project: ${project.title}`,
        'success',
        `/seller/create-quotation/${project._id}`
      );
    }

    res.json({
      success: true,
      message: 'Suggestions sent to seller successfully',
      data: project
    });
  } catch (error) {
    console.error('❌ Send To Seller Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server Error: ' + error.message 
    });
  }
};