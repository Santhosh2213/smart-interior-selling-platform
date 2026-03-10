import api from './api';

// Get seller dashboard data
export const getSellerDashboard = async () => {
  try {
    const response = await api.get('/dashboard/seller');
    console.log('Seller dashboard response:', response.data);
    return response.data; // Return the whole response
  } catch (error) {
    console.error('Error fetching seller dashboard:', error);
    throw error;
  }
};

// Get project for quotation
export const getProjectForQuotation = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project for quotation:', error);
    throw error;
  }
};

// Get all materials
export const getAllMaterials = async () => {
  try {
    const response = await api.get('/materials');
    return response.data;
  } catch (error) {
    console.error('Error fetching materials:', error);
    throw error;
  }
};

// Create quotation
export const createQuotation = async (quotationData) => {
  try {
    const response = await api.post('/quotations', quotationData);
    return response.data;
  } catch (error) {
    console.error('Error creating quotation:', error);
    throw error;
  }
};

// Get seller quotations
export const getSellerQuotations = async () => {
  try {
    const response = await api.get('/quotations/seller');
    return response.data;
  } catch (error) {
    console.error('Error fetching quotations:', error);
    throw error;
  }
};

// Get single quotation
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

const sellerService = {
  getSellerDashboard,
  getProjectForQuotation,
  getAllMaterials,
  createQuotation,
  getSellerQuotations,
  getQuotationById,
  updateQuotation,
  sendQuotation
};

export default sellerService;