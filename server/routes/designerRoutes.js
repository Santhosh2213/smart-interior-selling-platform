const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getDesignerQueue,
  getProjectForDesign,
  createDesignSuggestion,
  getSuggestionHistory,
  getMaterials,
  uploadDesignImages,
  getDesignHistory
} = require('../controllers/designerController');

// Debug: Log to verify all functions are imported
console.log('✅ Designer Routes loaded with functions:', {
  getDesignerQueue: typeof getDesignerQueue,
  getProjectForDesign: typeof getProjectForDesign,
  createDesignSuggestion: typeof createDesignSuggestion,
  getSuggestionHistory: typeof getSuggestionHistory,
  getMaterials: typeof getMaterials,
  uploadDesignImages: typeof uploadDesignImages,
  getDesignHistory: typeof getDesignHistory
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

// Image upload route (commented out until multer is set up)
// const upload = require('../middleware/uploadMiddleware');
// router.post('/upload-design-images', upload.array('images', 10), uploadDesignImages);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Designer routes working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;