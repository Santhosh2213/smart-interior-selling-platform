import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add this for multipart/form-data uploads
api.upload = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  withCredentials: true
});

// Request interceptor for both instances
const authInterceptor = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(authInterceptor);
api.upload.interceptors.request.use(authInterceptor);

// Response interceptor (same for both)
const responseInterceptor = (response) => response;
const errorInterceptor = (error) => {
  console.error('API Error:', error.response?.status, error.config?.url);
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  return Promise.reject(error);
};

api.interceptors.response.use(responseInterceptor, errorInterceptor);
api.upload.interceptors.response.use(responseInterceptor, errorInterceptor);

export default api;