const Project = require('../models/Project');
const Customer = require('../models/Customer');
const Seller = require('../models/Seller');
const Designer = require('../models/Designer');
const Measurement = require('../models/Measurement');
const ProjectImage = require('../models/ProjectImage');
const DesignSuggestion = require('../models/DesignSuggestion');
const mongoose = require('mongoose');
const { createNotification } = require('./notificationController');

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Customer only)
exports.createProject = async (req, res) => {
  try {
    const { title, description, measurementUnit } = req.body;

    // Get customer profile
    const customer = await Customer.findOne({ userId: req.user.id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer profile not found'
      });
    }

    // Create project
    const project = await Project.create({
      customerId: customer._id,
      title,
      description,
      measurementUnit: measurementUnit || customer.preferredUnits || 'feet'
    });

    // Add project to customer's projects array
    customer.projects.push(project._id);
    await customer.save();

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get all projects for customer
// @route   GET /api/projects/customer
// @access  Private (Customer)
exports.getCustomerProjects = async (req, res) => {
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
      .populate('quotations')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get all projects for seller (Project Queue)
// @route   GET /api/projects/seller/queue
// @access  Private (Seller)
exports.getSellerProjectQueue = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user.id });
    if (!seller) {
      return res.status(404).json({
        success: false,
        error: 'Seller profile not found'
      });
    }

    const projects = await Project.find({ 
      $or: [
        { assignedSeller: seller._id },
        { assignedSeller: null, status: { $in: ['pending', 'PENDING_DESIGN', 'quoted', 'DESIGN_APPROVED'] } }
      ]
    })
      .populate({
        path: 'customerId',
        populate: {
          path: 'userId',
          select: 'name email phone'
        }
      })
      .populate('measurements')
      .populate('images')
      .populate('quotations')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate({
        path: 'customerId',
        populate: {
          path: 'userId',
          select: 'name email phone'
        }
      })
      .populate('measurements')
      .populate('images')
      .populate({
        path: 'quotations',
        populate: {
          path: 'items.materialId'
        }
      })
      .populate('assignedDesigner')
      .populate('assignedSeller')
      .populate({
        path: 'designSuggestionId',  // Add this to populate the design suggestion
        populate: {
          path: 'recommendations.materialId'  // Also populate material details in recommendations
        }
      });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check authorization based on user role
    let isAuthorized = false;

    if (req.user.role === 'customer') {
      const customer = await Customer.findOne({ userId: req.user.id });
      isAuthorized = customer && project.customerId._id.toString() === customer._id.toString();
    } 
    else if (req.user.role === 'seller') {
      const seller = await Seller.findOne({ userId: req.user.id });
      // Allow sellers to view projects that are:
      // 1. Assigned to them
      // 2. Pending (no seller assigned)
      // 3. Quoted (so they can view quoted projects)
      // 4. Design approved
      isAuthorized = seller && (
        project.assignedSeller?.toString() === seller._id.toString() || 
        project.status === 'pending' ||
        project.status === 'PENDING_DESIGN' ||
        project.status === 'quoted' ||
        project.status === 'DESIGN_APPROVED'
      );
    }
    else if (req.user.role === 'designer') {
      const designer = await Designer.findOne({ userId: req.user.id });
      isAuthorized = designer && project.assignedDesigner?.toString() === designer._id.toString();
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this project'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Customer)
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check if customer owns this project
    const customer = await Customer.findOne({ userId: req.user.id });
    if (!customer || project.customerId.toString() !== customer._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this project'
      });
    }

    // Only allow updates if project is in draft status
    if (project.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: 'Cannot update project after submission'
      });
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Customer)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check if customer owns this project
    const customer = await Customer.findOne({ userId: req.user.id });
    if (!customer || project.customerId.toString() !== customer._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this project'
      });
    }

    // Only allow deletion if project is in draft status
    if (project.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete project after submission'
      });
    }

    // Remove project from customer's projects array
    customer.projects = customer.projects.filter(
      id => id.toString() !== project._id.toString()
    );
    await customer.save();

    // Delete related measurements and images
    await Measurement.deleteMany({ projectId: project._id });
    await ProjectImage.deleteMany({ projectId: project._id });
    
    // Delete project
    await project.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Add measurement to project
// @route   POST /api/projects/:id/measurements
// @access  Private (Customer)
exports.addMeasurement = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check if customer owns this project
    const customer = await Customer.findOne({ userId: req.user.id });
    if (!customer || project.customerId.toString() !== customer._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this project'
      });
    }

    // Create measurement
    const measurement = await Measurement.create({
      projectId: project._id,
      ...req.body
    });

    // Add to project
    project.measurements.push(measurement._id);
    
    // Recalculate total area
    const measurements = await Measurement.find({ projectId: project._id });
    const totalArea = measurements.reduce((sum, m) => {
      return sum + (m.unit === 'feet' ? m.areaSqFt : m.areaSqM);
    }, 0);
    
    project.totalArea = totalArea;
    await project.save();

    res.status(201).json({
      success: true,
      data: measurement
    });
  } catch (error) {
    console.error('❌ Add measurement error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Submit project for quotation
// @route   PUT /api/projects/:id/submit
// @access  Private (Customer)
exports.submitProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check if customer owns this project
    const customer = await Customer.findOne({ userId: req.user.id });
    if (!customer || project.customerId.toString() !== customer._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to submit this project'
      });
    }

    // Validate project has measurements
    if (project.measurements.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please add at least one measurement before submitting'
      });
    }

    // Check if project is already submitted
    if (project.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: 'Project has already been submitted'
      });
    }

    project.status = 'pending';
    project.submittedAt = Date.now();
    await project.save();

    // Auto-assign to first available seller (you can modify this logic)
    const seller = await Seller.findOne();
    if (seller) {
      project.assignedSeller = seller._id;
      await project.save();
      
      // Create notification for seller
      const Notification = require('../models/Notification');
      await Notification.create({
        userId: seller.userId,
        type: 'PROJECT_SUBMITTED',
        title: 'New Project Submitted',
        message: `A new project "${project.title}" has been submitted and needs assignment`,
        relatedId: project._id,
        onModel: 'Project',
        actionUrl: `/seller/queue/${project._id}`
      });
    }

    res.status(200).json({
      success: true,
      data: project,
      message: 'Project submitted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Assign project to seller
// @route   PUT /api/projects/:id/assign-seller
// @access  Private (Admin/Seller)
exports.assignSeller = async (req, res) => {
  try {
    const { sellerId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const seller = await Seller.findById(sellerId).populate('userId');
    if (!seller) {
      return res.status(404).json({
        success: false,
        error: 'Seller not found'
      });
    }

    project.assignedSeller = sellerId;
    project.sellerAssignedAt = new Date();
    await project.save();

    // Notify seller
    const Notification = require('../models/Notification');
    await Notification.create({
      userId: seller.userId._id,
      type: 'PROJECT_ASSIGNED',
      title: 'Project Assigned to You',
      message: `Project "${project.title}" has been assigned to you`,
      relatedId: project._id,
      onModel: 'Project',
      actionUrl: `/seller/queue/${project._id}`
    });

    res.status(200).json({
      success: true,
      data: project,
      message: 'Seller assigned successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Assign project to designer
// @route   PUT /api/projects/:id/assign-designer
// @access  Private (Admin/Seller)
exports.assignDesigner = async (req, res) => {
  try {
    const { designerId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const designer = await Designer.findById(designerId).populate('userId');
    if (!designer) {
      return res.status(404).json({
        success: false,
        error: 'Designer not found'
      });
    }

    project.assignedDesigner = designerId;
    project.designerAssignedAt = new Date();
    project.status = 'PENDING_DESIGN';
    await project.save();

    // Notify designer
    const Notification = require('../models/Notification');
    await Notification.create({
      userId: designer.userId._id,
      type: 'DESIGN_ASSIGNED',
      title: 'New Design Project Assigned',
      message: `Project "${project.title}" has been assigned to you for design`,
      relatedId: project._id,
      onModel: 'Project',
      actionUrl: `/designer/consultation/${project._id}`
    });

    res.status(200).json({
      success: true,
      data: project,
      message: 'Designer assigned successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get project design for customer review
// @route   GET /api/projects/:id/design
// @access  Private (Customer)
exports.getProjectDesign = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check if customer owns this project
    const customer = await Customer.findOne({ userId: req.user.id });
    if (!customer || project.customerId.toString() !== customer._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    // Get the latest design suggestion (highest version)
    const design = await DesignSuggestion.findOne({ 
      projectId: project._id
    })
    .sort('-version') // Sort by version descending to get the latest
    .populate('recommendations.materialId')
    .populate('designerId', 'name')
    .lean();

    if (!design) {
      return res.status(404).json({
        success: false,
        error: 'No design found for this project'
      });
    }

    // Mark as viewed
    await DesignSuggestion.findByIdAndUpdate(design._id, {
      customerViewedAt: new Date()
    });

    res.json({
      success: true,
      data: {
        project,
        design
      }
    });

  } catch (error) {
    console.error('Error in getProjectDesign:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Customer response to design
// @route   POST /api/projects/:id/design-response
// @access  Private (Customer)
exports.respondToDesign = async (req, res) => {
  try {
    const { response, notes } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check if customer owns this project
    const customer = await Customer.findOne({ userId: req.user.id });
    if (!customer || project.customerId.toString() !== customer._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    // Get design suggestion
    const suggestion = await DesignSuggestion.findById(project.designSuggestionId);
    if (!suggestion) {
      return res.status(404).json({
        success: false,
        error: 'Design suggestion not found'
      });
    }

    // Update suggestion with customer response
    suggestion.customerResponse = response;
    suggestion.customerResponseAt = new Date();
    suggestion.customerResponseNotes = notes;
    suggestion.status = response === 'APPROVED' ? 'APPROVED' : 
                       response === 'REJECTED' ? 'REJECTED' : 
                       'CHANGES_REQUESTED';
    await suggestion.save();

    // Update project status
    project.designStatus = response === 'APPROVED' ? 'DESIGN_APPROVED' : 
                          response === 'REJECTED' ? 'DESIGN_REJECTED' : 
                          'CHANGES_REQUESTED';
    project.status = response === 'APPROVED' ? 'DESIGN_APPROVED' : 
                    response === 'REJECTED' ? 'DESIGN_REJECTED' : 
                    'CHANGES_REQUESTED';
    await project.save();

    // Notify designer
    const designer = await Designer.findById(suggestion.designerId).populate('userId');
    if (designer && designer.userId) {
      await createNotification(
        designer.userId._id,
        response === 'APPROVED' ? 'DESIGN_APPROVED' : 
        response === 'REJECTED' ? 'DESIGN_REJECTED' : 
        'DESIGN_CHANGES_REQUESTED',
        response === 'APPROVED' ? '✓ Design Approved!' :
        response === 'REJECTED' ? '✗ Design Rejected' :
        '✏️ Changes Requested',
        response === 'APPROVED' ? `Customer approved the design for ${project.title}` :
        response === 'REJECTED' ? `Customer rejected the design for ${project.title}` :
        `Customer requested changes for ${project.title}: ${notes}`,
        project._id,
        'Project',
        `/designer/consultation/${project._id}`,
        { response, notes }
      );
    }

    // Notify seller if approved
    if (response === 'APPROVED' && project.assignedSeller) {
      const seller = await Seller.findById(project.assignedSeller).populate('userId');
      if (seller && seller.userId) {
        await createNotification(
          seller.userId._id,
          'DESIGN_APPROVED',
          '🎨 Design Approved - Ready for Quotation',
          `Design for project ${project.title} has been approved by customer`,
          project._id,
          'Project',
          `/seller/create-quotation/${project._id}`,
          { designId: suggestion._id }
        );
      }
    }

    res.json({
      success: true,
      message: `Design ${response.toLowerCase()} successfully`,
      data: { project, suggestion }
    });

  } catch (error) {
    console.error('Error in respondToDesign:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Request design changes
// @route   POST /api/projects/:id/design-changes
// @access  Private (Customer)
exports.requestDesignChanges = async (req, res) => {
  try {
    const { type, description } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check if customer owns this project
    const customer = await Customer.findOne({ userId: req.user.id });
    if (!customer || project.customerId.toString() !== customer._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    // Get design suggestion
    const suggestion = await DesignSuggestion.findById(project.designSuggestionId);
    if (!suggestion) {
      return res.status(404).json({
        success: false,
        error: 'Design suggestion not found'
      });
    }

    // Add change request
    if (!suggestion.changeRequests) {
      suggestion.changeRequests = [];
    }
    
    suggestion.changeRequests.push({
      requestedBy: req.user.id,
      requestType: type || 'design_change',
      description,
      status: 'pending',
      createdAt: new Date()
    });
    
    suggestion.customerResponse = 'CHANGES_REQUESTED';
    suggestion.customerResponseAt = new Date();
    suggestion.customerResponseNotes = description;
    suggestion.status = 'CHANGES_REQUESTED';
    await suggestion.save();

    // Update project
    project.designStatus = 'CHANGES_REQUESTED';
    project.status = 'CHANGES_REQUESTED';
    await project.save();

    // Notify designer
    const designer = await Designer.findById(suggestion.designerId).populate('userId');
    if (designer && designer.userId) {
      await createNotification(
        designer.userId._id,
        'DESIGN_CHANGES_REQUESTED',
        '✏️ Changes Requested',
        `Customer requested changes for ${project.title}: ${description}`,
        project._id,
        'Project',
        `/designer/consultation/${project._id}`,
        { 
          changeRequest: suggestion.changeRequests[suggestion.changeRequests.length - 1],
          description 
        }
      );
    }

    res.json({
      success: true,
      message: 'Change request sent to designer',
      data: { suggestion }
    });

  } catch (error) {
    console.error('Error in requestDesignChanges:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get design history for a project
// @route   GET /api/projects/:id/design-history
// @access  Private
exports.getDesignHistory = async (req, res) => {
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