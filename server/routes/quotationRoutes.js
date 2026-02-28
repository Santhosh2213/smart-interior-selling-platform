const express = require('express');
const router = express.Router();
const {
  createQuotation,
  getSellerQuotations,
  getCustomerQuotations,
  getQuotationById,
  updateQuotation,
  sendQuotation,
  acceptQuotation,
  rejectQuotation,
  requestQuotationChanges,
  deleteQuotation
} = require('../controllers/quotationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Seller routes
router.post('/', authorize('seller'), createQuotation);
router.get('/seller', authorize('seller'), getSellerQuotations);
router.put('/:id', authorize('seller'), updateQuotation);
router.put('/:id/send', authorize('seller'), sendQuotation);
router.delete('/:id', authorize('seller'), deleteQuotation);

// Customer routes
router.get('/customer', authorize('customer'), getCustomerQuotations);
router.put('/:id/accept', authorize('customer'), acceptQuotation);
router.put('/:id/reject', authorize('customer'), rejectQuotation);
router.put('/:id/request-changes', authorize('customer'), requestQuotationChanges);

// Shared routes (accessible by both seller and customer)
router.get('/:id', getQuotationById);

module.exports = router;