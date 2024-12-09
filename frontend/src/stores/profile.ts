// src/stores/profile.ts
import { defineStore } from 'pinia'
import axios from '@/plugins/axios'
import { ref } from 'vue'

interface Profile {
  id?: number
  user_id?: number
  email?: string
  scheduling_url?: string
  bio?: string
  avatar_url?: string
  welcome_message?: string
  company_logo?: string
  phone?: string
  job_title?: string
  full_name?: string
  company?: string
  time_zone?: string
}

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<Profile | null>(null)
  const isLoading = ref(false)
  const error = ref('')

  async function fetchProfile() {
    try {
      isLoading.value = true
      const token = localStorage.getItem('token')
      const response = await axios.get(`/api/profile/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      profile.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Error loading profile'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateProfile(formData: FormData) {
    try {
      isLoading.value = true
      error.value = ''
      
      // Get the profile data from the FormData
      const profileData = formData.get('profile_data')
      if (typeof profileData !== 'string') {
        throw new Error('Invalid profile data')
      }

      // Log the data being sent for debugging
      console.log('Profile Data:', JSON.parse(profileData))
      
      const token = localStorage.getItem('token')
      const response = await axios.put(
        `/api/profile/me`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      )
      profile.value = response.data
      return response.data
    } catch (err: any) {
      console.error('Error updating profile:', err)
      error.value = err.response?.data?.detail || 'Error updating profile'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile
  }
})