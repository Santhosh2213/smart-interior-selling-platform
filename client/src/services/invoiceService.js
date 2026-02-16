import api from './api';

export const invoiceService = {
  // Get all invoices (seller)
  getAllInvoices: async () => {
    const response = await api.get('/invoices');
    return response.data;
  },

  // Get customer invoices
  getCustomerInvoices: async () => {
    const response = await api.get('/invoices/customer');
    return response.data;
  },

  // Get invoice by ID
  getInvoiceById: async (id) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  // Generate invoice
  generateInvoice: async (orderId) => {
    const response = await api.post('/invoices/generate', { orderId });
    return response.data;
  },

  // Download invoice
  downloadInvoice: async (id) => {
    const response = await api.get(`/invoices/${id}/download`, {
      responseType: 'blob'
    });
    return response;
  },

  // Email invoice
  emailInvoice: async (id) => {
    const response = await api.post(`/invoices/${id}/email`);
    return response.data;
  }
};