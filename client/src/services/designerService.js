import api from './api';

// Get all projects pending design review
export const getDesignerQueue = async () => {
  try {
    const response = await api.get('/designer/queue');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching designer queue:', error);
    throw error;
  }
};

// Get single project for consultation
export const getProjectForDesign = async (projectId) => {
  try {
    const response = await api.get(`/designer/project/${projectId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching project for design:', error);
    throw error;
  }
};

// Upload design images
export const uploadDesignImages = async (formData) => {
  try {
    const response = await api.post('/designer/upload-design-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error uploading design images:', error);
    throw error;
  }
};

// Create or update design suggestion
export const createDesignSuggestion = async (suggestionData) => {
  try {
    const response = await api.post('/designer/suggestions', suggestionData);
    return response.data;
  } catch (error) {
    console.error('Error creating design suggestion:', error);
    throw error;
  }
};

// Get designer's suggestion history
export const getSuggestionHistory = async () => {
  try {
    const response = await api.get('/designer/suggestions/history');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching suggestion history:', error);
    throw error;
  }
};

// Get materials for recommendations
export const getMaterials = async (category = '') => {
  try {
    const params = category ? { category } : {};
    const response = await api.get('/designer/materials', { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching materials:', error);
    throw error;
  }
};

// ─── NewaEC Sketch-to-Real ────────────────────────────────────────────────────

/**
 * Save an AI-generated visualization result to a project's design suggestion.
 * Called after the designer clicks "Save to Design Suggestion" in the Studio.
 *
 * @param {string} projectId
 * @param {object} aiVisualization  - Full parsed result from the Anthropic API
 * @param {string} designNotes      - Designer notes derived from AI output
 * @param {string} suggestedTheme   - e.g. "Modern Minimalist"
 */
export const saveSketchToRealResult = async ({
  projectId,
  aiVisualization,
  designNotes,
  suggestedTheme,
}) => {
  try {
    const response = await api.post('/designer/sketch-to-real/save', {
      projectId,
      aiVisualization,
      designNotes,
      suggestedTheme,
    });
    return response.data;
  } catch (error) {
    console.error('Error saving sketch-to-real result:', error);
    throw error;
  }
};

/**
 * Fetch all NewaEC-generated visualizations saved for a project.
 * Useful for showing a history of AI renders on the consultation page.
 *
 * @param {string} projectId
 */
export const getSketchToRealResults = async (projectId) => {
  try {
    const response = await api.get(`/designer/sketch-to-real/${projectId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching sketch-to-real results:', error);
    throw error;
  }
};

const designerService = {
  getDesignerQueue,
  getProjectForDesign,
  createDesignSuggestion,
  getSuggestionHistory,
  getMaterials,
  uploadDesignImages,
  saveSketchToRealResult,
  getSketchToRealResults,
};

export default designerService;