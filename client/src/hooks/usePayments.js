import { useState } from 'react';
import { paymentService } from '../services/paymentService';
import toast from 'react-hot-toast';

export const usePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getAllPayments();
      setPayments(response.data);
    } catch (error) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (paymentData) => {
    try {
      setLoading(true);
      const response = await paymentService.processPayment(paymentData);
      toast.success('Payment processed successfully');
      return response.data;
    } catch (error) {
      toast.error('Payment failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentId) => {
    try {
      const response = await paymentService.verifyPayment(paymentId);
      return response.data;
    } catch (error) {
      toast.error('Payment verification failed');
      throw error;
    }
  };

  const refundPayment = async (paymentId, amount) => {
    try {
      const response = await paymentService.refundPayment(paymentId, amount);
      toast.success('Refund processed successfully');
      return response.data;
    } catch (error) {
      toast.error('Refund failed');
      throw error;
    }
  };

  return {
    payments,
    loading,
    fetchPayments,
    processPayment,
    verifyPayment,
    refundPayment
  };
};