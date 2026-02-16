import { useState } from 'react';
import { quotationService } from '../services/quotationService';
import toast from 'react-hot-toast';

export const useQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const response = await quotationService.getQuotations();
      setQuotations(response.data);
    } catch (error) {
      toast.error('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

  const createQuotation = async (quotationData) => {
    try {
      setLoading(true);
      const response = await quotationService.createQuotation(quotationData);
      setQuotations([response.data, ...quotations]);
      toast.success('Quotation created successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to create quotation');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateQuotation = async (id, quotationData) => {
    try {
      setLoading(true);
      const response = await quotationService.updateQuotation(id, quotationData);
      setQuotations(quotations.map(q => q._id === id ? response.data : q));
      toast.success('Quotation updated successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to update quotation');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const acceptQuotation = async (id) => {
    try {
      const response = await quotationService.acceptQuotation(id);
      setQuotations(quotations.map(q => q._id === id ? response.data : q));
      toast.success('Quotation accepted');
      return response.data;
    } catch (error) {
      toast.error('Failed to accept quotation');
      throw error;
    }
  };

  const rejectQuotation = async (id) => {
    try {
      const response = await quotationService.rejectQuotation(id);
      setQuotations(quotations.map(q => q._id === id ? response.data : q));
      toast.success('Quotation rejected');
      return response.data;
    } catch (error) {
      toast.error('Failed to reject quotation');
      throw error;
    }
  };

  return {
    quotations,
    loading,
    fetchQuotations,
    createQuotation,
    updateQuotation,
    acceptQuotation,
    rejectQuotation
  };
};