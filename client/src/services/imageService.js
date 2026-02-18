import api from './api';

export const imageService = {
  // Upload images for a project
  uploadImages: async (projectId, formData) => {
    const response = await api.post(`/projects/${projectId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Get all images for a project
  getProjectImages: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/images`);
    return response.data;
  },

  // Delete an image
  deleteImage: async (imageId) => {
    const response = await api.delete(`/projects/images/${imageId}`);
    return response.data;
  },

  // Annotate image
  annotateImage: async (imageId, annotations) => {
    const response = await api.put(`/projects/images/${imageId}/annotate`, { annotations });
    return response.data;
  },

  // Set as main image
  setMainImage: async (imageId) => {
    const response = await api.put(`/projects/images/${imageId}/set-main`);
    return response.data;
  }
};

export default imageService;