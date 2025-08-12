import axios from 'axios';

// Set base URL for API calls
axios.defaults.baseURL = 'http://localhost:8000';

// Configure axios to include credentials for session authentication
axios.defaults.withCredentials = true;

// Add request interceptor
axios.interceptors.request.use(
  (config) => {
    // For session-based auth, we don't need to add Authorization header
    // The session cookie will be automatically included
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Session expired or invalid
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios; 