const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Import controllers with correct function names
const {
  getAllMaterials,  // Changed from getMaterials
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial
} = require('../controllers/materialController');

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
  .get(getAllMaterials)  // Changed from getMaterials
  .post(authorize('seller'), createMaterial);  // Changed from 'admin' to 'seller'

router.route('/:id')
  .get(getMaterialById)
  .put(authorize('seller'), updateMaterial)  // Changed from 'admin' to 'seller'
  .delete(authorize('seller'), deleteMaterial);  // Changed from 'admin' to 'seller'

module.exports = router;