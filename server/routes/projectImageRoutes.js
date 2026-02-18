const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const {
  uploadProjectImages,
  getProjectImages,
  deleteProjectImage,
  annotateImage,
  setMainImage
} = require('../controllers/projectImageController');

// All routes require authentication
router.use(protect);

// Upload multiple images
router.post(
  '/',
  authorize('customer'),
  upload.array('images', 10), // Max 10 images
  uploadProjectImages
);

// Get all images for a project
router.get('/', getProjectImages);

// Single image operations
router.delete('/:imageId', authorize('customer'), deleteProjectImage);
router.put('/:imageId/annotate', authorize('customer'), annotateImage);
router.put('/:imageId/set-main', authorize('customer'), setMainImage);

module.exports = router;