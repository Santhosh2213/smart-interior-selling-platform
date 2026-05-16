const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Create single file upload middleware
const uploadSingle = upload.single('avatar');

const {
  getCustomerProfile,
  updateCustomerProfile,
  uploadCustomerAvatar,
  removeCustomerAvatar,
  getSellerProfile,
  updateSellerProfile,
  uploadSellerAvatar,
  removeSellerAvatar,
  getDesignerProfile,
  updateDesignerProfile,
  uploadDesignerAvatar,
  removeDesignerAvatar
} = require('../controllers/profileController');

// Customer routes
router.get('/customer/profile', protect, getCustomerProfile);
router.put('/customer/profile', protect, updateCustomerProfile);
router.post('/customer/profile/avatar', protect, (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
}, uploadCustomerAvatar);
router.delete('/customer/profile/avatar', protect, removeCustomerAvatar);

// Seller routes
router.get('/seller/profile', protect, getSellerProfile);
router.put('/seller/profile', protect, updateSellerProfile);
router.post('/seller/profile/avatar', protect, (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
}, uploadSellerAvatar);
router.delete('/seller/profile/avatar', protect, removeSellerAvatar);

// Designer routes
router.get('/designer/profile', protect, getDesignerProfile);
router.put('/designer/profile', protect, updateDesignerProfile);
router.post('/designer/profile/avatar', protect, (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
}, uploadDesignerAvatar);
router.delete('/designer/profile/avatar', protect, removeDesignerAvatar);

module.exports = router;