import api from './api';

// Get customer profile
export const getCustomerProfile = async () => {
  try {
    const response = await api.get('/customers/profile');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    throw error;
  }
};

// Update customer profile
export const updateCustomerProfile = async (profileData) => {
  try {
    const response = await api.put('/customers/profile', profileData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating customer profile:', error);
    throw error;
  }
};

// Get customer projects
export const getCustomerProjects = async () => {
  try {
    const response = await api.get('/projects/customer');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching customer projects:', error);
    throw error;
  }
};

// Get single project
export const getProject = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
};

// Get project details with design suggestion
export const getProjectDetails = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}/with-design`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching project details:', error);
    throw error;
  }
};

// Create new project
export const createProject = async (projectData) => {
  try {
    const response = await api.post('/projects', projectData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating project:', error);
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
    return response.data.data;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};

// Add measurement to project
export const addMeasurement = async (projectId, measurementData) => {
  try {
    const response = await api.post(`/projects/${projectId}/measurements`, measurementData);
    return response.data.data;
  } catch (error) {
    console.error('Error adding measurement:', error);
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

// Respond to design suggestion
export const respondToDesign = async (projectId, responseData) => {
  try {
    const response = await api.post(`/projects/${projectId}/design-response`, responseData);
    return response.data;
  } catch (error) {
    console.error('Error responding to design:', error);
    throw error;
  }
};

// Get customer quotations
export const getCustomerQuotations = async () => {
  try {
    const response = await api.get('/quotations/customer');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching quotations:', error);
    throw error;
  }
};

// Get single quotation
export const getQuotation = async (quotationId) => {
  try {
    const response = await api.get(`/quotations/${quotationId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching quotation:', error);
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

// Get notifications
export const getNotifications = async () => {
  try {
    const response = await api.get('/notifications');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Export all functions as a service object
const customerService = {
  getCustomerProfile,
  updateCustomerProfile,
  getCustomerProjects,
  getProject,
  getProjectDetails,
  createProject,
  uploadProjectImages,
  addMeasurement,
  submitProject,
  respondToDesign,
  getCustomerQuotations,
  getQuotation,
  acceptQuotation,
  requestQuotationChanges,
  getNotifications,
  markNotificationAsRead
};

export default customerService;