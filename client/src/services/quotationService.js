import api from './api';

export const quotationService = {
  // Create quotation (seller)
  createQuotation: async (quotationData) => {
    const response = await api.post('/quotations', quotationData);
    return response.data;
  },

  // Get seller quotations
  getSellerQuotations: async () => {
    const response = await api.get('/quotations/seller');
    return response.data;
  },

  // Get customer quotations
  getCustomerQuotations: async () => {
    const response = await api.get('/quotations/customer');
    return response.data;
  },

  // Get quotation by ID
  getQuotationById: async (id) => {
    const response = await api.get(`/quotations/${id}`);
    return response.data;
  },

  // Update quotation (seller)
  updateQuotation: async (id, quotationData) => {
    const response = await api.put(`/quotations/${id}`, quotationData);
    return response.data;
  },

  // Send quotation (seller)
  sendQuotation: async (id) => {
    const response = await api.put(`/quotations/${id}/send`);
    return response.data;
  },

  // Accept quotation (customer)
  acceptQuotation: async (id) => {
    const response = await api.put(`/quotations/${id}/accept`);
    return response.data;
  },

  // Reject quotation (customer)
  rejectQuotation: async (id) => {
    const response = await api.put(`/quotations/${id}/reject`);
    return response.data;
  },

  // Delete quotation (seller)
  deleteQuotation: async (id) => {
    const response = await api.delete(`/quotations/${id}`);
    return response.data;
  }
};

export default quotationService;