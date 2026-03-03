import api from './api';

// Get all notifications
const getNotifications = async () => {
  try {
    const response = await api.get('/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Mark notification as read
const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
const markAllAsRead = async () => {
  try {
    const response = await api.put('/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
};

// Delete notification
const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Create a service object with all functions
const notificationService = {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification
};

// Export both named exports and default
export {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification
};

export default notificationService;