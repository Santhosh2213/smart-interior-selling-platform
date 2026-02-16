import api from './api';

export const reportService = {
  // Get reports
  getReports: async (dateRange) => {
    const response = await api.get('/reports', { params: dateRange });
    return response.data;
  },

  // Export report
  exportReport: async (dateRange, format) => {
    const response = await api.get('/reports/export', {
      params: { ...dateRange, format },
      responseType: 'blob'
    });
    return response;
  },

  // Get sales report
  getSalesReport: async (dateRange) => {
    const response = await api.get('/reports/sales', { params: dateRange });
    return response.data;
  },

  // Get GST report
  getGSTReport: async (dateRange) => {
    const response = await api.get('/reports/gst', { params: dateRange });
    return response.data;
  },

  // Get material popularity
  getMaterialPopularity: async (dateRange) => {
    const response = await api.get('/reports/materials', { params: dateRange });
    return response.data;
  }
};