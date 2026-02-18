const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getSellerDashboard,
  getDesignerDashboard,
  getCustomerDashboard
} = require('../controllers/dashboardController');

// All dashboard routes require authentication
router.use(protect);

// Role-specific dashboard routes
router.get('/seller', getSellerDashboard);
router.get('/designer', getDesignerDashboard);
router.get('/customer', getCustomerDashboard);

module.exports = router;