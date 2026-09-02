import axiosClient from './axiosClient';

export const providerApi = {
  getProfile: async (id) => {
    const response = await axiosClient.get(`/providers/${id}`);
    return response.data;
  },
  
  getListings: async (id) => {
    const response = await axiosClient.get(`/providers/${id}/listings`);
    return response.data;
  },

  getReviews: async (id) => {
    const response = await axiosClient.get(`/providers/${id}/reviews`);
    return response.data;
  },

  // NEW: Get Provider Financial Earnings
  getMyEarnings: async () => {
    const response = await axiosClient.get('/providers/earnings');
    return response.data;
  }
};