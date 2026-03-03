import api from './api';

export const createQuotation = async (quotationData) => {
  try {
    console.log('📤 SENDING TO SERVER:', JSON.stringify(quotationData, null, 2));
    const response = await api.post('/quotations', quotationData);
    console.log('📥 SERVER RESPONSE:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ QUOTATION SERVICE ERROR:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
};

// Get seller quotations
export const getSellerQuotations = async () => {
  try {
    const response = await api.get('/quotations/seller');
    return response.data;
  } catch (error) {
    console.error('Error fetching seller quotations:', error);
    throw error;
  }
};

// Get customer quotations
export const getCustomerQuotations = async () => {
  try {
    const response = await api.get('/quotations/customer');
    return response.data;
  } catch (error) {
    console.error('Error fetching customer quotations:', error);
    throw error;
  }
};

// Get quotation by ID
export const getQuotationById = async (quotationId) => {
  try {
    const response = await api.get(`/quotations/${quotationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching quotation:', error);
    throw error;
  }
};

// Update quotation
export const updateQuotation = async (quotationId, quotationData) => {
  try {
    const response = await api.put(`/quotations/${quotationId}`, quotationData);
    return response.data;
  } catch (error) {
    console.error('Error updating quotation:', error);
    throw error;
  }
};

// Delete quotation
export const deleteQuotation = async (quotationId) => {
  try {
    const response = await api.delete(`/quotations/${quotationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting quotation:', error);
    throw error;
  }
};

// Send quotation to customer
export const sendQuotation = async (quotationId) => {
  try {
    const response = await api.post(`/quotations/${quotationId}/send`);
    return response.data;
  } catch (error) {
    console.error('Error sending quotation:', error);
    throw error;
  }
};

// Accept quotation
export const acceptQuotation = async (quotationId) => {
  try {
    const response = await api.put(`/quotations/${quotationId}/accept`);
    return response.data;
  } catch (error) {
    console.error('Error accepting quotation:', error);
    throw error;
  }
};

// Reject quotation
export const rejectQuotation = async (quotationId, reason) => {
  try {
    const response = await api.put(`/quotations/${quotationId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error rejecting quotation:', error);
    throw error;
  }
};

// Request quotation changes
export const requestQuotationChanges = async (quotationId, changeData) => {
  try {
    const response = await api.put(`/quotations/${quotationId}/request-changes`, changeData);
    return response.data;
  } catch (error) {
    console.error('Error requesting changes:', error);
    throw error;
  }
};

const quotationService = {
  createQuotation,
  getSellerQuotations,
  getCustomerQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
  sendQuotation,
  acceptQuotation,
  rejectQuotation,
  requestQuotationChanges
};

export default quotationService;