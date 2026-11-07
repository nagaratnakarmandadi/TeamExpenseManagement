import api from './api';

export const authService = {
  // POST /api/auth/login
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    if (response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('auth_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  // POST /api/auth/register
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    if (response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('auth_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  // POST /api/auth/logout
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.href = '/login';
  },

  // Get current stored user
  getUser: () => {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  // Check if authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('auth_token');
    return !!token && token !== 'undefined' && token !== 'null' && token.trim() !== '';
  },

  // GET /api/auth/me
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    if (response.data) {
      localStorage.setItem('auth_user', JSON.stringify(response.data));
    }
    return response.data;
  },
};
