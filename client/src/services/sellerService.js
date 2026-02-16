import api from './api';

export const sellerService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/seller/dashboard');
    return response.data;
  },

  // Projects
  getProjectQueue: async () => {
    const response = await api.get('/seller/project-queue');
    return response.data;
  },

  getProjectById: async (id) => {
    const response = await api.get(`/seller/projects/${id}`);
    return response.data;
  },

  // Quotations
  getQuotations: async () => {
    const response = await api.get('/seller/quotations');
    return response.data;
  },

  createQuotation: async (quotationData) => {
    const response = await api.post('/seller/quotations', quotationData);
    return response.data;
  },

  updateQuotation: async (id, quotationData) => {
    const response = await api.put(`/seller/quotations/${id}`, quotationData);
    return response.data;
  },

  // Customers
  getCustomers: async () => {
    const response = await api.get('/seller/customers');
    return response.data;
  },

  // Business Settings
  getBusinessSettings: async () => {
    const response = await api.get('/seller/settings');
    return response.data;
  },

  updateBusinessSettings: async (settingsData) => {
    const response = await api.put('/seller/settings', settingsData);
    return response.data;
  },

  uploadLogo: async (formData) => {
    const response = await api.post('/seller/upload-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};