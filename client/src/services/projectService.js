import api from './api';

export const projectService = {
  // Create new project
  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  // Get customer projects
  getCustomerProjects: async () => {
    const response = await api.get('/projects/customer');
    return response.data;
  },

  // Get single project
  getProjectById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  // Update project
  updateProject: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  // Delete project
  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  // Add measurement
  addMeasurement: async (projectId, measurementData) => {
    const response = await api.post(`/projects/${projectId}/measurements`, measurementData);
    return response.data;
  },

  // Submit project
  submitProject: async (id) => {
    const response = await api.put(`/projects/${id}/submit`);
    return response.data;
  }
};

export default projectService;