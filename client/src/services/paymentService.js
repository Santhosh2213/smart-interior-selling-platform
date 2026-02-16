import api from './api';

export const paymentService = {
  // Get all payments (seller)
  getAllPayments: async () => {
    const response = await api.get('/payments');
    return response.data;
  },

  // Process payment
  processPayment: async (paymentData) => {
    const response = await api.post('/payments/process', paymentData);
    return response.data;
  },

  // Verify payment
  verifyPayment: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}/verify`);
    return response.data;
  },

  // Refund payment
  refundPayment: async (paymentId, amount) => {
    const response = await api.post(`/payments/${paymentId}/refund`, { amount });
    return response.data;
  },

  // Get payment by ID
  getPaymentById: async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  }
};