const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getDesignerDashboard,
  getAssignedProjects,
  getProjectForReview,
  addDesignSuggestions,
  getMaterialRecommendations,
  updateSuggestionStatus,
  sendToSeller
} = require('../controllers/designerController');

// All routes require authentication and designer role
router.use(protect);
router.use(authorize('designer'));

// Dashboard
router.get('/dashboard', getDesignerDashboard);

// Projects
router.get('/projects', getAssignedProjects);
router.get('/projects/:id', getProjectForReview);
router.get('/projects/:projectId/recommendations', getMaterialRecommendations);

// Suggestions
router.post('/projects/:projectId/suggestions', addDesignSuggestions);
router.put('/suggestions/:suggestionId', updateSuggestionStatus);
router.post('/projects/:projectId/send-to-seller', sendToSeller);

module.exports = router;