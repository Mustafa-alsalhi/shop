import api from './api';

const sellerChatService = {
  // Get all conversations for the current seller
  getConversations: async () => {
    const response = await api.get('/seller/messages');
    return response.data;
  },

  // Get messages between seller and customer
  getMessages: async (customerId) => {
    const response = await api.get(`/seller/messages/${customerId}`);
    return response.data;
  },

  // Send a message from seller to customer
  sendMessage: async (receiverId, message) => {
    console.log('Sending message:', { receiverId, message });
    try {
      const response = await api.post('/seller/messages', {
        receiver_id: receiverId,
        message: message,
      });
      console.log('Message sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get unread message count for seller
  getUnreadCount: async () => {
    const response = await api.get('/seller/messages/unread/count');
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (customerId) => {
    const response = await api.post(`/seller/messages/${customerId}/mark-read`);
    return response.data;
  },
};

export default sellerChatService;
