const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Import controllers (create these later)
const {
  getGstRates,
  getGstRateById,
  createGstRate,
  updateGstRate,
  deleteGstRate
} = require('../controllers/gstController');

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
  .get(getGstRates)
  .post(authorize('admin'), createGstRate);

router.route('/:id')
  .get(getGstRateById)
  .put(authorize('admin'), updateGstRate)
  .delete(authorize('admin'), deleteGstRate);

module.exports = router; // ← This must be the ONLY export!