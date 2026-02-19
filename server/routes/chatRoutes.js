const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead
} = require('../controllers/chatController');

// All routes require authentication
router.use(protect);

router.get('/conversations', getConversations);
router.get('/project/:projectId', getMessages);
router.post('/', sendMessage);
router.put('/read/:projectId', markAsRead);

module.exports = router;