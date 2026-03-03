import api from './api';

// Get project by ID
export const getProjectById = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
};

// Get seller project queue
export const getSellerProjectQueue = async () => {
  try {
    const response = await api.get('/projects/seller/queue');
    return response.data;
  } catch (error) {
    console.error('Error fetching seller project queue:', error);
    throw error;
  }
};

// Get customer projects
export const getCustomerProjects = async () => {
  try {
    const response = await api.get('/projects/customer');
    return response.data;
  } catch (error) {
    console.error('Error fetching customer projects:', error);
    throw error;
  }
};

// Create new project
export const createProject = async (projectData) => {
  try {
    const response = await api.post('/projects', projectData);
    return response.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

// Update project
export const updateProject = async (projectId, projectData) => {
  try {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

// Delete project
export const deleteProject = async (projectId) => {
  try {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

// Submit project for review
export const submitProject = async (projectId) => {
  try {
    const response = await api.put(`/projects/${projectId}/submit`);
    return response.data;
  } catch (error) {
    console.error('Error submitting project:', error);
    throw error;
  }
};

// Get project design for review
export const getProjectDesign = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}/design`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project design:', error);
    throw error;
  }
};

// Respond to design
export const respondToDesign = async (projectId, responseData) => {
  try {
    const response = await api.post(`/projects/${projectId}/design-response`, responseData);
    return response.data;
  } catch (error) {
    console.error('Error responding to design:', error);
    throw error;
  }
};

// Request design changes
export const requestDesignChanges = async (projectId, changeData) => {
  try {
    const response = await api.post(`/projects/${projectId}/design-changes`, changeData);
    return response.data;
  } catch (error) {
    console.error('Error requesting design changes:', error);
    throw error;
  }
};

// Add measurement to project
export const addMeasurement = async (projectId, measurementData) => {
  try {
    const response = await api.post(`/projects/${projectId}/measurements`, measurementData);
    return response.data;
  } catch (error) {
    console.error('Error adding measurement:', error);
    throw error;
  }
};

// Upload project images
export const uploadProjectImages = async (projectId, formData) => {
  try {
    const response = await api.post(`/projects/${projectId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};

const projectService = {
  getProjectById,
  getSellerProjectQueue,
  getCustomerProjects,
  createProject,
  updateProject,
  deleteProject,
  submitProject,
  getProjectDesign,
  respondToDesign,
  requestDesignChanges,
  addMeasurement,
  uploadProjectImages
};

export default projectService;