import api from './api';

export const chatService = {
  // Get conversations
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  // Get messages for a conversation
  getMessages: async (conversationId) => {
    const response = await api.get(`/chat/messages/${conversationId}`);
    return response.data;
  },

  // Send message
  sendMessage: async (formData) => {
    const response = await api.post('/chat/messages', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (conversationId) => {
    const response = await api.patch(`/chat/conversations/${conversationId}/read`);
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get('/chat/unread');
    return response.data;
  }
};