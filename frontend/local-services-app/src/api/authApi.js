import axiosClient from './axiosClient';

export const authApi = {
  // Register a new user
  register: async (userData) => {
    const response = await axiosClient.post('/auth/register', {
      fullName: userData.fullName,
      email: userData.email,
      password: userData.password,
      phone: userData.phone || null,
      role: userData.role,
    });
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await axiosClient.post('/auth/login', {
      email: credentials.email,
      password: credentials.password,
      rememberMe: credentials.rememberMe || false,  
    });
    return response.data;
  },

  // Get current logged-in user info
  getCurrentUser: async () => {
    const response = await axiosClient.get('/auth/me');
    return response.data;
  },

  // Request password reset email
  forgotPassword: async (email) => {
    const response = await axiosClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password using token from email
  resetPassword: async (token, newPassword) => {
    const response = await axiosClient.post('/auth/reset-password', { 
      token, 
      newPassword 
    });
    return response.data;
  },




    // Update profile
  updateProfile: async (profileData) => {
    const response = await axiosClient.put('/auth/profile', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await axiosClient.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  // Delete account
  deleteAccount: async () => {
    const response = await axiosClient.delete('/auth/account');
    return response.data;
  },



    // Get current user's stats (role-based)
  getMyStats: async () => {
    const response = await axiosClient.get('/auth/my-stats');
    return response.data;
  },
};