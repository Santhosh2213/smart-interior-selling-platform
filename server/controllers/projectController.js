const Project = require('../models/Project');
const Customer = require('../models/Customer');
const Seller = require('../models/Seller'); // Add this import
const Designer = require('../models/Designer'); // Add this import
const Measurement = require('../models/Measurement');
const ProjectImage = require('../models/ProjectImage');
const mongoose = require('mongoose');

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
        { status: 'pending', assignedSeller: null }
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
      .populate('assignedSeller');

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
      isAuthorized = seller && (
        project.assignedSeller?.toString() === seller._id.toString() || 
        project.status === 'pending'
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

    // Only allow adding measurements if project is in draft status
    if (project.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: 'Cannot add measurements after project submission'
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
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
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
      
      // TODO: Create notification for seller
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

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        error: 'Seller not found'
      });
    }

    project.assignedSeller = sellerId;
    await project.save();

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

    const designer = await Designer.findById(designerId);
    if (!designer) {
      return res.status(404).json({
        success: false,
        error: 'Designer not found'
      });
    }

    project.assignedDesigner = designerId;
    await project.save();

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