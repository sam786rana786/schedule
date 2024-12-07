import axios from 'axios';
import { API_URL } from '@/config/env';
import router from '@/router';
import { useAuthStore } from '@/stores/auth'; // We'll create this
import { useNotificationStore } from '@/stores/notification';

const axiosInstance = axios.create({
    baseURL: "http://fastapi-backend:8000",
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
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

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore();
    
    // Check if error is due to an invalid token
    if (error.response?.status === 401 && 
        error.response?.data?.detail === "Could not validate credentials") {
      // Clear auth state
      await authStore.logout();
      
      // Get current route for redirect after login
      const currentRoute = router.currentRoute.value;
      const returnUrl = currentRoute.fullPath;
      
      // Redirect to login with message
      await router.replace({ 
        path: '/login', 
        query: { 
          returnUrl: returnUrl !== '/login' ? returnUrl : undefined,
          message: 'Logged out due to inactivity'
        }
      });
    }
    return Promise.reject(error);
  }
);


export default axiosInstance;