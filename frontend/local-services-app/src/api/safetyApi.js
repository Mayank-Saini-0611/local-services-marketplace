import axiosClient from './axiosClient';

export const safetyApi = {
  submitReport: async (data) => {
    const response = await axiosClient.post('/safety/reports', data);
    return response.data;
  },

  getMyReports: async () => {
    const response = await axiosClient.get('/safety/reports/mine');
    return response.data;
  },

  getBlockedUsers: async () => {
    const response = await axiosClient.get('/safety/blocks');
    return response.data;
  },

  blockUser: async (userId) => {
    const response = await axiosClient.post(`/safety/blocks/${userId}`);
    return response.data;
  },

  unblockUser: async (userId) => {
    const response = await axiosClient.delete(`/safety/blocks/${userId}`);
    return response.data;
  },
};
