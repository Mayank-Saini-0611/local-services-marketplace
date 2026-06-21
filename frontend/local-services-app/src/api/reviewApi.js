import axiosClient from './axiosClient';

export const reviewApi = {
  // Create review
  create: async (data) => {
    const response = await axiosClient.post('/reviews', data);
    return response.data;
  },

  // Get reviews for a listing
  getListingReviews: async (listingId) => {
    const response = await axiosClient.get(`/reviews/listing/${listingId}`);
    return response.data;
  },

  // Get rating stats for a listing
  getListingStats: async (listingId) => {
    const response = await axiosClient.get(`/reviews/listing/${listingId}/stats`);
    return response.data;
  },

  // Get my reviews
  getMyReviews: async () => {
    const response = await axiosClient.get('/reviews/my-reviews');
    return response.data;
  },

  // Update review
  update: async (id, data) => {
    const response = await axiosClient.put(`/reviews/${id}`, data);
    return response.data;
  },

  // Delete review
  delete: async (id) => {
    const response = await axiosClient.delete(`/reviews/${id}`);
    return response.data;
  },

  // Check if user can review a booking
  canReview: async (bookingId) => {
    const response = await axiosClient.get(`/reviews/can-review/${bookingId}`);
    return response.data;
  },
};