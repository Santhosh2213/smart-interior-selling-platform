const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getSellerDashboard,
  getCustomerDashboard,
  getDesignerDashboard
} = require('../controllers/dashboardController');

// Seller dashboard
router.get('/seller', protect, authorize('seller'), getSellerDashboard);

// Customer dashboard
router.get('/customer', protect, authorize('customer'), getCustomerDashboard);

// Designer dashboard
router.get('/designer', protect, authorize('designer'), getDesignerDashboard);

module.exports = router;