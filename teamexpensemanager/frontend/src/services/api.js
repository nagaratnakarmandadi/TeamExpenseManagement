import axios from 'axios';

// Create Axios instance with default configuration
const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to automatically attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error extraction and 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred';
    if (error.response) {
      if (error.response.status === 401) {
        // If unauthorized, clear invalid token and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        if (!window.location.hash.includes('/login') && !window.location.pathname.includes('/login')) {
          window.location.hash = '#/login';
        }
        message = 'Session expired or unauthorized. Please sign in again.';
      } else {
        message = error.response.data?.message || error.response.data?.error || `Server error (${error.response.status})`;
      }
    } else if (error.request) {
      message = 'Cannot connect to backend server. Please make sure Spring Boot is running on port 9191.';
    } else {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
