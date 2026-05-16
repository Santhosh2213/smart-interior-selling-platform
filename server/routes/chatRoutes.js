const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getSellerCustomers,
  getDesignerCustomers,
  getDesignerConversations,
  getSellerConversations,    // New name
  editMessage,
  deleteMessage 
} = require('../controllers/chatController');

// All routes require authentication
router.use(protect);

// Common routes
router.get('/conversations', getConversations);
router.get('/project/:projectId', getMessages);
router.post('/', sendMessage);
router.put('/read/:projectId', markAsRead);
router.put('/message/:messageId', editMessage);
router.delete('/message/:messageId', deleteMessage);

// Role-specific routes
router.get('/seller/customers', authorize('seller'), getSellerCustomers);
router.get('/designer/customers', authorize('designer'), getDesignerCustomers);
router.get('/designer/conversations', authorize('designer'), getDesignerConversations);

// Add this endpoint for fallback when socket fails
router.post('/join-project', protect, async (req, res) => {
  try {
    const { projectId } = req.body;
    // Just acknowledge - actual socket join happens separately
    res.json({ success: true, message: 'Project join recorded' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;