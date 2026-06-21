import axiosClient from './axiosClient';

export const adminApi = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await axiosClient.get('/admin/dashboard-stats');
    return response.data;
  },

  getRecentActivity: async () => {
    const response = await axiosClient.get('/admin/recent-activity');
    return response.data;
  },

  getGrowthAnalytics: async () => {
    const response = await axiosClient.get('/admin/analytics/growth');
    return response.data;
  },

  // Users
  getAllUsers: async (params = {}) => {
    const response = await axiosClient.get('/admin/users', { params });
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await axiosClient.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await axiosClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Listings
  getAllListings: async (params = {}) => {
    const response = await axiosClient.get('/admin/listings', { params });
    return response.data;
  },

  deleteListing: async (id) => {
    const response = await axiosClient.delete(`/admin/listings/${id}`);
    return response.data;
  },

  toggleListingActive: async (id) => {
    const response = await axiosClient.put(`/admin/listings/${id}/toggle-active`);
    return response.data;
  },

  // Bookings
  getAllBookings: async (params = {}) => {
    const response = await axiosClient.get('/admin/bookings', { params });
    return response.data;
  },
};