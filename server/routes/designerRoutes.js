const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { saveSketchToRealResult, getSketchToRealResults } = require('../controllers/sketchToRealController');
const { generateVisualization } = require('../controllers/anthropicProxyController');

// GhostBot imports - ONLY ONCE
const { 
  generateImage, 
  imageToImage, 
  getModels, 
  testGhostBot 
} = require('../controllers/ghostbotController');

const {
  getDesignerQueue,
  getProjectForDesign,
  createDesignSuggestion,
  getSuggestionHistory,
  getMaterials,
  uploadDesignImages,
  getDesignHistory
} = require('../controllers/designerController');

// Log to check if all functions are imported correctly
console.log('Designer Routes - Checking imports:', {
  getDesignerQueue: typeof getDesignerQueue,
  getProjectForDesign: typeof getProjectForDesign,
  createDesignSuggestion: typeof createDesignSuggestion,
  getSuggestionHistory: typeof getSuggestionHistory,
  getMaterials: typeof getMaterials,
  uploadDesignImages: typeof uploadDesignImages,
  getDesignHistory: typeof getDesignHistory,
  saveSketchToRealResult: typeof saveSketchToRealResult,
  getSketchToRealResults: typeof getSketchToRealResults,
  generateVisualization: typeof generateVisualization,
  generateImage: typeof generateImage,
  imageToImage: typeof imageToImage,
  getModels: typeof getModels,
  testGhostBot: typeof testGhostBot
});

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

// Design history route
router.get('/project/:id/design-history', getDesignHistory);

// Image upload route - using the upload middleware
router.post('/upload-design-images', upload.array('images', 10), uploadDesignImages);

// NewaEC AI Proxy — Gemini API
router.post('/ai/generate-visualization', generateVisualization);

// GhostBot AI Image Generation routes
router.post('/ai/generate-image', generateImage);
router.post('/ai/image-to-image', imageToImage);
router.get('/ai/models', getModels);
router.get('/ai/test-ghostbot', testGhostBot);

// NewaEC Sketch-to-Real routes
router.post('/sketch-to-real/save', saveSketchToRealResult);
router.get('/sketch-to-real/:projectId', getSketchToRealResults);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Designer routes working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;