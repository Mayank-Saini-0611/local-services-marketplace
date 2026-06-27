import axiosClient from './axiosClient';

export const favoriteApi = {
  // Get all favorite listings (full details)
  getAll: async () => {
    const response = await axiosClient.get('/favorites');
    return response.data;
  },

  // Get just the listing IDs (for heart icon state)
  getIds: async () => {
    const response = await axiosClient.get('/favorites/ids');
    return response.data;
  },

  // Add to favorites
  add: async (listingId) => {
    const response = await axiosClient.post(`/favorites/${listingId}`);
    return response.data;
  },

  // Remove from favorites
  remove: async (listingId) => {
    const response = await axiosClient.delete(`/favorites/${listingId}`);
    return response.data;
  },
};