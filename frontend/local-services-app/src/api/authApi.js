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
    });
    return response.data;
  },

  // Get current logged-in user info
  getCurrentUser: async () => {
    const response = await axiosClient.get('/auth/me');
    return response.data;
  },
};