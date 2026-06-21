import axiosClient from './axiosClient';

export const notificationApi = {
  getAll: async () => {
    const response = await axiosClient.get('/notifications');
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await axiosClient.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await axiosClient.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await axiosClient.put('/notifications/mark-all-read');
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosClient.delete(`/notifications/${id}`);
    return response.data;
  },
};