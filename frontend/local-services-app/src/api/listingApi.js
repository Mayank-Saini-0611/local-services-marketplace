import axiosClient from './axiosClient';

export const listingApi = {
  // Get all listings (with optional filters + pagination)
  getAll: async (params = {}) => {
    const response = await axiosClient.get('/listings', { params });
    return response.data;
  },

  // Get single listing by ID
  getById: async (id) => {
    const response = await axiosClient.get(`/listings/${id}`);
    return response.data;
  },

  // Get current provider's listings (protected)
  getMyListings: async () => {
    const response = await axiosClient.get('/listings/my-listings');
    return response.data;
  },

  // Create new listing (protected, provider only)
  create: async (listingData) => {
    const response = await axiosClient.post('/listings', listingData);
    return response.data;
  },

  // Update listing (protected, owner only)
  update: async (id, listingData) => {
    const response = await axiosClient.put(`/listings/${id}`, listingData);
    return response.data;
  },

  // Soft-delete listing (protected, owner only)
  delete: async (id) => {
    const response = await axiosClient.delete(`/listings/${id}`);
    return response.data;
  },



    // Upload single image to Cloudinary
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosClient.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload multiple images
  uploadMultiple: async (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const response = await axiosClient.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};