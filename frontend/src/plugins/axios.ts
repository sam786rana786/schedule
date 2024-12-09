import axios from 'axios';
import { API_URL } from '@/config/env';
import router from '@/router';
import { useAuthStore } from '@/stores/auth'; // We'll create this
import { useNotificationStore } from '@/stores/notification';

const axiosInstance = axios.create({
    baseURL: API_URL,
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
  (error) => {
    const authStore = useAuthStore();
    const notificationStore = useNotificationStore();

    if (error.response.status === 401) {
      authStore.logout();
      router.push('/login');
    }

    notificationStore.showNotification('error', error.response.data.message || 'An error occurred');
    return Promise.reject(error);
  }
);

export default axiosInstance;