import api from './api';

export const materialService = {
  // Get all materials
  getAllMaterials: async () => {
    const response = await api.get('/materials');
    return response.data;
  },

  // Get material by ID
  getMaterialById: async (id) => {
    const response = await api.get(`/materials/${id}`);
    return response.data;
  },

  // Create material (seller only)
  createMaterial: async (materialData) => {
    const response = await api.post('/materials', materialData);
    return response.data;
  },

  // Update material
  updateMaterial: async (id, materialData) => {
    const response = await api.put(`/materials/${id}`, materialData);
    return response.data;
  },

  // Delete material
  deleteMaterial: async (id) => {
    const response = await api.delete(`/materials/${id}`);
    return response.data;
  }
};

export default materialService;