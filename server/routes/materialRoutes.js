const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Import controllers (create these later)
const {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial
} = require('../controllers/materialController');

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
  .get(getMaterials)
  .post(authorize('admin'), createMaterial);

router.route('/:id')
  .get(getMaterialById)
  .put(authorize('admin'), updateMaterial)
  .delete(authorize('admin'), deleteMaterial);

module.exports = router; // ← This must be the ONLY export!