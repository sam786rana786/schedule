import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from '@/plugins/axios';

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(!!localStorage.getItem('token'));

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
      return token;
    } catch (error) {
      throw error;
    }
  }

  async function logout() {
    localStorage.removeItem('token');
    isAuthenticated.value = false;
  }

  async function checkAuth() {
    try {
      await axios.get('api/auth/verify-token');
      isAuthenticated.value = true;
      return true;
    } catch (error) {
      isAuthenticated.value = false;
      return false;
    }
  }

  return {
    isAuthenticated,
    login,
    logout,
    checkAuth
  };
});