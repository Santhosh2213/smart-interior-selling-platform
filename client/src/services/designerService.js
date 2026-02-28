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

const designerService = {
  getDesignerQueue,
  getProjectForDesign,
  createDesignSuggestion,
  getSuggestionHistory,
  getMaterials
};

export default designerService;