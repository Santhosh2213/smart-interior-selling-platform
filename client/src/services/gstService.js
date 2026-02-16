import api from './api';

export const gstService = {
  // Get all GST categories
  getGSTCategories: async () => {
    const response = await api.get('/gst/categories');
    return response.data;
  },

  // Update GST category
  updateGSTCategory: async (id, categoryData) => {
    const response = await api.put(`/gst/categories/${id}`, categoryData);
    return response.data;
  },

  // Calculate GST
  calculateGST: async (amount, category) => {
    const response = await api.post('/gst/calculate', { amount, category });
    return response.data;
  },

  // Get GST by category
  getGSTByCategory: async (category) => {
    const response = await api.get(`/gst/category/${category}`);
    return response.data;
  }
};