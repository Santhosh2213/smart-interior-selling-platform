const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getDesignerQueue,
  getProjectForDesign,
  createDesignSuggestion,
  getSuggestionHistory,
  getMaterials
} = require('../controllers/designerController');

// All routes require authentication and designer role
router.use(protect);
router.use(authorize('designer'));

// Queue routes
router.get('/queue', getDesignerQueue);
router.get('/project/:id', getProjectForDesign);

// Suggestion routes
router.post('/suggestions', createDesignSuggestion);
router.get('/suggestions/history', getSuggestionHistory);

// Materials route
router.get('/materials', getMaterials);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Designer routes working' });
});

module.exports = router;