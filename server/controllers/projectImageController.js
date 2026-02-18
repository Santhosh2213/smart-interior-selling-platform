const ProjectImage = require('../models/ProjectImage');
const Project = require('../models/Project');
const Customer = require('../models/Customer');
const { cloudinary } = require('../config/cloudinary');

// @desc    Upload project images
// @route   POST /api/projects/:projectId/images
// @access  Private (Customer)
exports.uploadProjectImages = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check if project exists
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
        error: 'Not authorized to upload images to this project'
      });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please upload at least one image'
      });
    }

    // Save image records to database
    const uploadedImages = [];
    
    for (const file of req.files) {
      const projectImage = await ProjectImage.create({
        projectId: project._id,
        imageUrl: file.path,
        publicId: file.filename,
        uploadedBy: req.user.id
      });

      // Add image to project
      project.images.push(projectImage._id);
      uploadedImages.push(projectImage);
    }

    await project.save();

    res.status(201).json({
      success: true,
      count: uploadedImages.length,
      data: uploadedImages
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Get project images
// @route   GET /api/projects/:projectId/images
// @access  Private
exports.getProjectImages = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const images = await ProjectImage.find({ projectId })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: images.length,
      data: images
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete project image
// @route   DELETE /api/projects/images/:imageId
// @access  Private (Customer)
exports.deleteProjectImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    
    const image = await ProjectImage.findById(imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    // Check authorization
    const project = await Project.findById(image.projectId);
    const customer = await Customer.findOne({ userId: req.user.id });
    
    if (!customer || project.customerId.toString() !== customer._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this image'
      });
    }

    // Delete from Cloudinary
    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    // Remove from project
    await Project.findByIdAndUpdate(image.projectId, {
      $pull: { images: image._id }
    });

    // Delete from database
    await image.deleteOne();

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

// @desc    Update image annotation
// @route   PUT /api/projects/images/:imageId/annotate
// @access  Private (Customer)
exports.annotateImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { annotations } = req.body;

    const image = await ProjectImage.findById(imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    // Check authorization
    const project = await Project.findById(image.projectId);
    const customer = await Customer.findOne({ userId: req.user.id });
    
    if (!customer || project.customerId.toString() !== customer._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to annotate this image'
      });
    }

    image.annotations = annotations;
    await image.save();

    res.status(200).json({
      success: true,
      data: image
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Set main image
// @route   PUT /api/projects/images/:imageId/set-main
// @access  Private (Customer)
exports.setMainImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await ProjectImage.findById(imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    // Check authorization
    const project = await Project.findById(image.projectId);
    const customer = await Customer.findOne({ userId: req.user.id });
    
    if (!customer || project.customerId.toString() !== customer._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this image'
      });
    }

    // Remove main flag from all images in this project
    await ProjectImage.updateMany(
      { projectId: image.projectId },
      { $set: { isMain: false } }
    );

    // Set this image as main
    image.isMain = true;
    await image.save();

    res.status(200).json({
      success: true,
      data: image
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};