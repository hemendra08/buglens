import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Determine base URL dynamically (assumes backend runs on 5059 if dev, or relative if prod)
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5059/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token if it exists
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle 401 Unauthorized globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, log out the user
      useAuthStore.getState().logout();
      window.location.href = '/login'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);
