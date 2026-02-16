import api from './api';

export const orderService = {
  // Get all orders (seller)
  getAllOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  // Get customer orders
  getCustomerOrders: async () => {
    const response = await api.get('/orders/customer');
    return response.data;
  },

  // Get order by ID
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Update order status (seller)
  updateOrderStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Cancel order (customer)
  cancelOrder: async (id) => {
    const response = await api.patch(`/orders/${id}/cancel`);
    return response.data;
  },

  // Track order
  trackOrder: async (id) => {
    const response = await api.get(`/orders/${id}/track`);
    return response.data;
  }
};