import axiosClient from './axiosClient';

export const categoryApi = {
  // Get all categories
  getAll: async () => {
    const response = await axiosClient.get('/categories');
    return response.data;
  },

  // Get single category by ID
  getById: async (id) => {
    const response = await axiosClient.get(`/categories/${id}`);
    return response.data;
  },
};