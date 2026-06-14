import api from './api';

const chatService = {
  // Get all conversations for the current user
  getConversations: async () => {
    const response = await api.get('/messages');
    return response.data;
  },

  // Get messages between current user and another user
  getMessages: async (userId) => {
    const response = await api.get(`/messages/${userId}`);
    return response.data;
  },

  // Send a message
  sendMessage: async (receiverId, message) => {
    console.log('Sending message:', { receiverId, message });
    try {
      const response = await api.post('/messages', {
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

  // Get unread message count
  getUnreadCount: async () => {
    const response = await api.get('/messages/unread/count');
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (userId) => {
    const response = await api.post(`/messages/${userId}/mark-read`);
    return response.data;
  },
};

export default chatService;
