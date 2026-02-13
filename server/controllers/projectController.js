const Project = require('../models/Project');
const Customer = require('../models/Customer');
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

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('measurements')
      .populate('images')
      .populate({
        path: 'quotations',
        populate: {
          path: 'items.materialId'
        }
      })
      .populate('customerId')
      .populate('assignedDesigner')
      .populate('assignedSeller');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check authorization
    const customer = await Customer.findOne({ userId: req.user.id });
    const seller = await Seller.findOne({ userId: req.user.id });
    const designer = await Designer.findOne({ userId: req.user.id });

    const isCustomer = customer && project.customerId.toString() === customer._id.toString();
    const isSeller = seller && (project.assignedSeller?.toString() === seller._id.toString() || req.user.role === 'seller');
    const isDesigner = designer && (project.assignedDesigner?.toString() === designer._id.toString() || req.user.role === 'designer');

    if (!isCustomer && !isSeller && !isDesigner && req.user.role !== 'admin') {
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

    project.status = 'pending';
    project.submittedAt = Date.now();
    await project.save();

    // TODO: Assign to seller (for now, auto-assign to first seller)
    const seller = await Seller.findOne();
    if (seller) {
      project.assignedSeller = seller._id;
      await project.save();
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