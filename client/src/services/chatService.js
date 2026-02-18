import api from './api';

export const chatService = {
  // Get user conversations
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  // Get messages for a project
  getMessages: async (projectId) => {
    const response = await api.get(`/chat/project/${projectId}`);
    return response.data;
  },

  // Send message
  sendMessage: async (messageData) => {
    const response = await api.post('/chat', messageData);
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (projectId) => {
    const response = await api.put(`/chat/read/${projectId}`);
    return response.data;
  }
};

export default chatService;