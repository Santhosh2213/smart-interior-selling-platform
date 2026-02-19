const Material = require('../models/Material');

// @desc    Get all materials
// @route   GET /api/materials
// @access  Private
exports.getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.find({ isActive: true }).sort('name');
    
    res.status(200).json({
      success: true,
      message: 'Get all materials',
      count: materials.length,
      data: materials
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single material
// @route   GET /api/materials/:id
// @access  Private
exports.getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Material not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: material
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create new material
// @route   POST /api/materials
// @access  Private (Seller only)
exports.createMaterial = async (req, res) => {
  try {
    const material = await Material.create(req.body);
    
    res.status(201).json({
      success: true,
      data: material
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update material
// @route   PUT /api/materials/:id
// @access  Private (Seller only)
exports.updateMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Material not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: material
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Private (Seller only)
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Material not found'
      });
    }
    
    // Soft delete - just mark as inactive
    material.isActive = false;
    await material.save();
    
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