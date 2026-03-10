import api from './api';

// Get all notifications
export const getNotifications = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, skipping notification fetch');
      return { data: [], unreadCount: 0 };
    }
    
    const response = await api.get('/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    // Return empty data on error to prevent app crash
    return { data: [], unreadCount: 0 };
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

// Mark all notifications as read
export const markAllAsRead = async () => {
  try {
    const response = await api.put('/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

const notificationService = {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification
};

export default notificationService;