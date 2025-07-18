export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const BASE_URL = API_URL.replace('/api', '');

// Configure axios defaults for mobile compatibility
import axios from 'axios';

// Set longer timeout for mobile connections
axios.defaults.timeout = 30000; // 30 seconds

// Add request interceptor to handle mobile network issues
axios.interceptors.request.use(
  (config) => {
    // Add headers for mobile compatibility
    config.headers['Content-Type'] = 'application/json';
    config.headers['Accept'] = 'application/json';
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle mobile network errors
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors common on mobile
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
      console.log('Network error detected, likely mobile connection issue');
      return Promise.reject(new Error('Network connection failed. Please check your internet connection and try again.'));
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      console.log('Request timeout detected');
      return Promise.reject(new Error('Request timed out. Please try again.'));
    }
    
    return Promise.reject(error);
  }
);

// Log the API URL being used (remove in production)
console.log('API URL:', API_URL);
console.log('BASE URL:', BASE_URL);
console.log('Environment:', import.meta.env.MODE);
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);