const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const tokenStorage = {
  // Save token and user info
  setAuth: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Get token
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Get user info
  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  // Clear all auth data (logout)
  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Check if user is logged in
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};