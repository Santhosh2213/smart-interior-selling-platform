import api from './api';

export const designerService = {
  // Get designer dashboard
  getDashboard: async () => {
    try {
      const response = await api.get('/designer/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching designer dashboard:', error);
      throw error;
    }
  },

  // Get assigned projects
  getAssignedProjects: async () => {
    try {
      const response = await api.get('/designer/projects');
      return response.data;
    } catch (error) {
      console.error('Error fetching assigned projects:', error);
      throw error;
    }
  },

  // Get project for review
  getProjectForReview: async (id) => {
    try {
      const response = await api.get(`/designer/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  },

  // Get material recommendations
  getMaterialRecommendations: async (projectId) => {
    try {
      const response = await api.get(`/designer/projects/${projectId}/recommendations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching material recommendations:', error);
      throw error;
    }
  },

  // Add design suggestions
  addDesignSuggestions: async (projectId, suggestionsData) => {
    try {
      const response = await api.post(`/designer/projects/${projectId}/suggestions`, suggestionsData);
      return response.data;
    } catch (error) {
      console.error('Error adding design suggestions:', error);
      throw error;
    }
  },

  // Update suggestion status
  updateSuggestionStatus: async (suggestionId, status, feedback) => {
    try {
      const response = await api.put(`/designer/suggestions/${suggestionId}`, { status, feedback });
      return response.data;
    } catch (error) {
      console.error('Error updating suggestion status:', error);
      throw error;
    }
  },

  // Send to seller
  sendToSeller: async (projectId) => {
    try {
      const response = await api.post(`/designer/projects/${projectId}/send-to-seller`);
      return response.data;
    } catch (error) {
      console.error('Error sending to seller:', error);
      throw error;
    }
  }
};

export default designerService;