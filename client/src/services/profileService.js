// profileService.js
import api from './api';

// ==================== CUSTOMER PROFILE ====================
export const getCustomerProfile = async () => {
  try {
    const response = await api.get('/customer/profile');
    console.log('Customer profile response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Get customer profile error:', error);
    throw error;
  }
};

export const updateCustomerProfile = async (profileData) => {
  try {
    const response = await api.put('/customer/profile', profileData);
    console.log('Update customer profile response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Update customer profile error:', error);
    throw error;
  }
};

export const uploadCustomerAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  try {
    const response = await api.post('/customer/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Upload avatar error:', error);
    throw error;
  }
};

export const removeCustomerAvatar = async () => {
  try {
    const response = await api.delete('/customer/profile/avatar');
    return response.data;
  } catch (error) {
    console.error('Remove avatar error:', error);
    throw error;
  }
};

// ==================== SELLER PROFILE ====================
export const getSellerProfile = async () => {
  try {
    const response = await api.get('/seller/profile');
    console.log('Seller profile response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Get seller profile error:', error);
    throw error;
  }
};

export const updateSellerProfile = async (profileData) => {
  try {
    const response = await api.put('/seller/profile', profileData);
    console.log('Update seller profile response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Update seller profile error:', error);
    throw error;
  }
};

export const uploadSellerAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  try {
    const response = await api.post('/seller/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Upload seller avatar error:', error);
    throw error;
  }
};

export const removeSellerAvatar = async () => {
  try {
    const response = await api.delete('/seller/profile/avatar');
    return response.data;
  } catch (error) {
    console.error('Remove seller avatar error:', error);
    throw error;
  }
};

// ==================== DESIGNER PROFILE ====================
export const getDesignerProfile = async () => {
  try {
    const response = await api.get('/designer/profile');
    console.log('Designer profile response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Get designer profile error:', error);
    throw error;
  }
};

export const updateDesignerProfile = async (profileData) => {
  try {
    const response = await api.put('/designer/profile', profileData);
    console.log('Update designer profile response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Update designer profile error:', error);
    throw error;
  }
};

export const uploadDesignerAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  try {
    const response = await api.post('/designer/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Upload designer avatar error:', error);
    throw error;
  }
};

export const removeDesignerAvatar = async () => {
  try {
    const response = await api.delete('/designer/profile/avatar');
    return response.data;
  } catch (error) {
    console.error('Remove designer avatar error:', error);
    throw error;
  }
};