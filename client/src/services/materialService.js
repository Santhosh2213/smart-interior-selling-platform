import api from './api';

export const materialService = {
  // Get all materials
  getAllMaterials: async () => {
    try {
      console.log('Making API call to /materials');
      const response = await api.get('/materials');
      console.log('Raw API response:', response);
      console.log('Response data:', response.data);
      
      // The API returns { success: true, message: "...", data: [...] }
      return response.data; // This already contains the correct structure
    } catch (error) {
      console.error('Error in getAllMaterials:', error);
      throw error;
    }
  },

  // Get material by ID
  getMaterialById: async (id) => {
    try {
      const response = await api.get(`/materials/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching material ${id}:`, error);
      throw error;
    }
  },

  // Create material (seller only)
  createMaterial: async (materialData) => {
    try {
      const response = await api.post('/materials', materialData);
      return response.data;
    } catch (error) {
      console.error('Error creating material:', error);
      throw error;
    }
  },

  // Update material
  updateMaterial: async (id, materialData) => {
    try {
      const response = await api.put(`/materials/${id}`, materialData);
      return response.data;
    } catch (error) {
      console.error(`Error updating material ${id}:`, error);
      throw error;
    }
  },

  // Delete material
  deleteMaterial: async (id) => {
    try {
      const response = await api.delete(`/materials/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting material ${id}:`, error);
      throw error;
    }
  }
};

export default materialService;