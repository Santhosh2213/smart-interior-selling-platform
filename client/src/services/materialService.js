import api from './api';

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

// Get material by ID
export const getMaterialById = async (materialId) => {
  try {
    const response = await api.get(`/materials/${materialId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching material:', error);
    throw error;
  }
};

// Create new material
export const createMaterial = async (materialData) => {
  try {
    const response = await api.post('/materials', materialData);
    return response.data;
  } catch (error) {
    console.error('Error creating material:', error);
    throw error;
  }
};

// Update material
export const updateMaterial = async (materialId, materialData) => {
  try {
    const response = await api.put(`/materials/${materialId}`, materialData);
    return response.data;
  } catch (error) {
    console.error('Error updating material:', error);
    throw error;
  }
};

// Delete material
export const deleteMaterial = async (materialId) => {
  try {
    const response = await api.delete(`/materials/${materialId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting material:', error);
    throw error;
  }
};

// Get materials by category
export const getMaterialsByCategory = async (category) => {
  try {
    const response = await api.get(`/materials/category/${category}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching materials by category:', error);
    throw error;
  }
};

// Search materials
export const searchMaterials = async (query) => {
  try {
    const response = await api.get('/materials/search', { params: { q: query } });
    return response.data;
  } catch (error) {
    console.error('Error searching materials:', error);
    throw error;
  }
};

const materialService = {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getMaterialsByCategory,
  searchMaterials
};

export default materialService;