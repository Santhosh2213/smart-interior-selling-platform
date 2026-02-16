import { useState } from 'react';
import { orderService } from '../services/orderService';
import toast from 'react-hot-toast';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders();
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getCustomerOrders();
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getOrderById = async (id) => {
    try {
      const response = await orderService.getOrderById(id);
      return response.data;
    } catch (error) {
      toast.error('Failed to load order details');
      throw error;
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const response = await orderService.updateOrderStatus(id, status);
      setOrders(orders.map(o => o._id === id ? response.data : o));
      toast.success(`Order status updated to ${status}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to update order status');
      throw error;
    }
  };

  const cancelOrder = async (id) => {
    try {
      const response = await orderService.cancelOrder(id);
      setOrders(orders.map(o => o._id === id ? response.data : o));
      toast.success('Order cancelled successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to cancel order');
      throw error;
    }
  };

  const trackOrder = async (id) => {
    try {
      const response = await orderService.trackOrder(id);
      return response.data;
    } catch (error) {
      toast.error('Failed to track order');
      throw error;
    }
  };

  return {
    orders,
    loading,
    fetchOrders,
    fetchCustomerOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    trackOrder
  };
};