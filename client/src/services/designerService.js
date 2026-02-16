import api from './api';

export const designerService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/designer/dashboard');
    return response.data;
  },

  // Consultations
  getConsultations: async () => {
    const response = await api.get('/designer/consultations');
    return response.data;
  },

  getProjectById: async (id) => {
    const response = await api.get(`/designer/projects/${id}`);
    return response.data;
  },

  // Suggestions
  getSuggestions: async (projectId) => {
    const response = await api.get(`/designer/suggestions/${projectId}`);
    return response.data;
  },

  addSuggestions: async (projectId, suggestionData) => {
    const response = await api.post(`/designer/suggestions/${projectId}`, suggestionData);
    return response.data;
  },

  updateSuggestion: async (id, suggestionData) => {
    const response = await api.put(`/designer/suggestions/${id}`, suggestionData);
    return response.data;
  },

  deleteSuggestion: async (id) => {
    const response = await api.delete(`/designer/suggestions/${id}`);
    return response.data;
  },

  updateSuggestionStatus: async (id, status) => {
    const response = await api.patch(`/designer/suggestions/${id}/status`, { status });
    return response.data;
  },

  // Material Recommendations
  recommendMaterials: async (projectId, recommendationData) => {
    const response = await api.post(`/designer/recommendations/${projectId}`, recommendationData);
    return response.data;
  }
};