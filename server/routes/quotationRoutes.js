const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Import controllers (you'll need to create these)
const {
  getQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  generateQuotationPDF
} = require('../controllers/quotationController');

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
  .get(getQuotations)
  .post(authorize('admin', 'customer'), createQuotation);

router.route('/:id')
  .get(getQuotationById)
  .put(authorize('admin'), updateQuotation)
  .delete(authorize('admin'), deleteQuotation);

router.get('/:id/pdf', generateQuotationPDF);

module.exports = router;