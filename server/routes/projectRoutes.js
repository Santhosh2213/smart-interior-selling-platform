const express = require('express');
const router = express.Router();
const projectImageRoutes = require('./projectImageRoutes');
const {
  createProject,
  getCustomerProjects,
  getSellerProjectQueue,
  getProjectById,
  updateProject,
  deleteProject,
  addMeasurement,
  submitProject,
  assignSeller,
  assignDesigner
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Mount image routes
router.use('/:projectId/images', projectImageRoutes);

// All routes require authentication
router.use(protect);

// Customer only routes
router.post('/', authorize('customer'), createProject);
router.get('/customer', authorize('customer'), getCustomerProjects);
router.put('/:id', authorize('customer'), updateProject);
router.delete('/:id', authorize('customer'), deleteProject);
router.post('/:id/measurements', authorize('customer'), addMeasurement);
router.put('/:id/submit', authorize('customer'), submitProject);

// Seller routes
router.get('/seller/queue', authorize('seller'), getSellerProjectQueue);

// Shared routes (accessible by multiple roles)
router.get('/:id', getProjectById);

// Assignment routes (admin/seller only)
router.put('/:id/assign-seller', authorize('seller', 'admin'), assignSeller);
router.put('/:id/assign-designer', authorize('seller', 'admin'), assignDesigner);

module.exports = router;