import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from '@/plugins/axios';

interface User {
  name: string;
  email: string;
  phone: string;
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(!!localStorage.getItem('token'));
  const user = ref<User | null>(null);

  async function login(email: string, password: string) {
    try {
      const response = await axios.post<{ access_token: string }>(
        'api/auth/token',
        new URLSearchParams({
          username: email,
          password: password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const token = response.data.access_token;
      localStorage.setItem('token', token);
      isAuthenticated.value = true;
      
      // Fetch user data after login
      await fetchUserData();
      return token;
    } catch (error) {
      throw error;
    }
  }

  async function fetchUserData() {
    try {
      const response = await axios.get<User>('api/auth/me');
      user.value = response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  async function logout() {
    localStorage.removeItem('token');
    isAuthenticated.value = false;
    user.value = null;
  }

  async function checkAuth() {
    try {
      await axios.get('api/auth/verify-token');
      isAuthenticated.value = true;
      await fetchUserData();
      return true;
    } catch (error) {
      isAuthenticated.value = false;
      user.value = null;
      return false;
    }
  }

  return {
    isAuthenticated,
    user,
    login,
    logout,
    checkAuth
  };
});