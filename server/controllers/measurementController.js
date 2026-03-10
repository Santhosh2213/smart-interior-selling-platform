const Measurement = require('../models/Measurement');
const Project = require('../models/Project');
const Customer = require('../models/Customer');

// @desc    Add measurement to project
// @route   POST /api/projects/:projectId/measurements
// @access  Private (Customer)
exports.addMeasurement = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { areaName, length, width, unit, notes } = req.body;

    console.log('Adding measurement to project:', projectId);
    console.log('Measurement data:', { areaName, length, width, unit });

    // Validate required fields
    if (!areaName || !length || !width || !unit) {
      return res.status(400).json({
        success: false,
        error: 'Please provide areaName, length, width, and unit'
      });
    }

    // Find project
    const project = await Project.findById(projectId);
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
      areaName,
      length: parseFloat(length),
      width: parseFloat(width),
      unit,
      notes: notes || ''
    });

    console.log('Measurement created:', measurement._id);

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

// @desc    Get measurements for project
// @route   GET /api/projects/:projectId/measurements
// @access  Private
exports.getMeasurements = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const measurements = await Measurement.find({ projectId }).sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: measurements.length,
      data: measurements
    });
  } catch (error) {
    console.error('❌ Get measurements error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Delete measurement
// @route   DELETE /api/measurements/:id
// @access  Private (Customer)
exports.deleteMeasurement = async (req, res) => {
  try {
    const measurement = await Measurement.findById(req.params.id);
    
    if (!measurement) {
      return res.status(404).json({
        success: false,
        error: 'Measurement not found'
      });
    }

    // Find project
    const project = await Project.findById(measurement.projectId);
    
    // Check if customer owns this project
    const customer = await Customer.findOne({ userId: req.user.id });
    if (!customer || project.customerId.toString() !== customer._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this measurement'
      });
    }

    // Remove from project
    project.measurements = project.measurements.filter(
      id => id.toString() !== measurement._id.toString()
    );
    
    // Recalculate total area
    const measurements = await Measurement.find({ projectId: project._id });
    const totalArea = measurements.reduce((sum, m) => {
      return sum + (m.unit === 'feet' ? m.areaSqFt : m.areaSqM);
    }, 0);
    
    project.totalArea = totalArea;
    await project.save();

    // Delete measurement
    await measurement.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('❌ Delete measurement error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};