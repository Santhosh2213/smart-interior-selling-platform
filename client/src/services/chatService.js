import api from './api';

const chatService = {
  // Get all conversations for logged-in user
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  // Get messages for a project
  getMessages: async (projectId) => {
    const response = await api.get(`/chat/project/${projectId}`);
    return response.data;
  },

  // Send a message via REST (socket is preferred; this is a fallback)
  sendMessage: async (messageData) => {
    const response = await api.post('/chat', messageData);
    return response.data;
  },

  // Mark all messages in a project chat as read
  markAsRead: async (projectId) => {
    const response = await api.put(`/chat/read/${projectId}`);
    return response.data;
  },

  // [Seller only] Get list of customers who have active chats with this seller
  getSellerCustomers: async () => {
    const response = await api.get('/chat/seller/customers');
    return response.data;
  },

  // [Designer only] Get list of customers who have active chats with this designer
  getDesignerCustomers: async () => {
    const response = await api.get('/chat/designer/customers');
    return response.data;
  },

  editMessage: async (messageId, message) => {
    const response = await api.put(`/chat/message/${messageId}`, { message });
    return response.data;
  },

  deleteMessage: async (messageId, deleteForEveryone = true) => {
    const response = await api.delete(`/chat/message/${messageId}`, { 
      data: { deleteForEveryone } 
    });
    return response.data;
  },
  
  // Add this method to chatService
  getDesignerConversations: async () => {
    const response = await api.get('/chat/designer/conversations');
    return response.data;
  },

getSellerConversations: async () => {
  const response = await api.get('/chat/seller/conversations');
  return response.data;
},
};



export default chatService;