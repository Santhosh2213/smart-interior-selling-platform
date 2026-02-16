import api from './api';

export const notificationService = {
  // Get all notifications
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  // Delete all notifications
  deleteAllNotifications: async () => {
    const response = await api.delete('/notifications');
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  }
};