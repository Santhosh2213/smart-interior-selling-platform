const express = require('express');
const router = express.Router();
const {
  createProject,
  getCustomerProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMeasurement,
  submitProject
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Customer only routes
router.post('/', authorize('customer'), createProject);
router.get('/customer', authorize('customer'), getCustomerProjects);
router.put('/:id', authorize('customer'), updateProject);
router.delete('/:id', authorize('customer'), deleteProject);
router.post('/:id/measurements', authorize('customer'), addMeasurement);
router.put('/:id/submit', authorize('customer'), submitProject);

// Shared routes (accessible by multiple roles)
router.get('/:id', getProjectById);

module.exports = router;