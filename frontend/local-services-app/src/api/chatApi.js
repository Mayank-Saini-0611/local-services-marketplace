import axiosClient from './axiosClient';

export const chatApi = {
  // Get all my chat rooms
  getRooms: async () => {
    const response = await axiosClient.get('/chat/rooms');
    return response.data;
  },

  // Get or create a chat room
  getOrCreateRoom: async (otherUserId, listingId = null) => {
    const response = await axiosClient.post('/chat/rooms', {
      otherUserId,
      listingId,
    });
    return response.data;
  },

  // Get messages in a room
  getMessages: async (roomId) => {
    const response = await axiosClient.get(`/chat/rooms/${roomId}/messages`);
    return response.data;
  },

  // Send a message
  sendMessage: async (roomId, content) => {
    const response = await axiosClient.post('/chat/messages', {
      roomId,
      content,
    });
    return response.data;
  },

  // Unread total count
  getUnreadCount: async () => {
    const response = await axiosClient.get('/chat/unread-count');
    return response.data;
  },
};