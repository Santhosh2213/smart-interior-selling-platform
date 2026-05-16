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
  getSellerConversations,  // Add this
  getDesignerConversations, // Add this
  editMessage,
  deleteMessage
} = require('../controllers/chatController');

router.use(protect);

// Common routes
router.get('/conversations', getConversations);
router.get('/project/:projectId', getMessages);
router.post('/', sendMessage);
router.put('/read/:projectId', markAsRead);
router.put('/message/:messageId', editMessage);
router.delete('/message/:messageId', deleteMessage);

// Role-specific conversation routes
router.get('/seller/conversations', authorize('seller'), getSellerConversations);
router.get('/designer/conversations', authorize('designer'), getDesignerConversations);

// Role-specific customer lists
router.get('/seller/customers', authorize('seller'), getSellerCustomers);
router.get('/designer/customers', authorize('designer'), getDesignerCustomers);

module.exports = router;