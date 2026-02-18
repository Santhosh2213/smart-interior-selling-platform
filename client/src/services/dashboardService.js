import api from './api';

export const dashboardService = {
  // Get seller dashboard data
  getSellerDashboard: async () => {
    try {
      const response = await api.get('/dashboard/seller');
      return response.data;
    } catch (error) {
      console.error('Error fetching seller dashboard:', error);
      throw error;
    }
  },

  // Get designer dashboard data
  getDesignerDashboard: async () => {
    try {
      const response = await api.get('/dashboard/designer');
      return response.data;
    } catch (error) {
      console.error('Error fetching designer dashboard:', error);
      throw error;
    }
  },

  // Get customer dashboard data
  getCustomerDashboard: async () => {
    try {
      const response = await api.get('/dashboard/customer');
      return response.data;
    } catch (error) {
      console.error('Error fetching customer dashboard:', error);
      throw error;
    }
  }
};

export default dashboardService;