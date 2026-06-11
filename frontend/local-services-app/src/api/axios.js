import axios from 'axios';

// Create an Axios instance with backend base URL
const api = axios.create({
  baseURL: 'https://localhost:7020/api', // Match your backend port
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token to every request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid → clear storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // We'll let pages handle redirect for now
    }
    return Promise.reject(error);
  }
);

export default api;