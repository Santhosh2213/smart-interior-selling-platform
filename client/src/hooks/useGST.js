import { useState, useEffect } from 'react';
import { gstService } from '../services/gstService';
import toast from 'react-hot-toast';

export const useGST = () => {
  const [gstRates, setGstRates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGSTRates();
  }, []);

  const fetchGSTRates = async () => {
    try {
      setLoading(true);
      const response = await gstService.getGSTCategories();
      setGstRates(response.data);
    } catch (error) {
      toast.error('Failed to load GST rates');
    } finally {
      setLoading(false);
    }
  };

  const updateGSTRate = async (id, rateData) => {
    try {
      const response = await gstService.updateGSTCategory(id, rateData);
      setGstRates(gstRates.map(r => r._id === id ? response.data : r));
      toast.success('GST rate updated successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to update GST rate');
      throw error;
    }
  };

  const calculateGST = (amount, category) => {
    const rate = gstRates.find(r => r.materialCategory === category);
    if (!rate) return { cgst: 0, sgst: 0, igst: 0, total: 0 };
    
    const cgst = amount * (rate.cgst / 100);
    const sgst = amount * (rate.sgst / 100);
    const igst = amount * (rate.igst / 100);
    
    return {
      cgst,
      sgst,
      igst,
      total: cgst + sgst
    };
  };

  const getGSTRateByCategory = (category) => {
    return gstRates.find(r => r.materialCategory === category);
  };

  return {
    gstRates,
    loading,
    updateGSTRate,
    calculateGST,
    getGSTRateByCategory,
    refreshGSTRates: fetchGSTRates
  };
};