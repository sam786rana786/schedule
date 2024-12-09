import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '@/plugins/axios'
import type { EventType } from '@/types/eventType'

export const usePublicBookingStore = defineStore('publicBooking', () => {
  const eventType = ref<EventType | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Public endpoint to fetch event type by slug
  async function fetchPublicEventType(slug: string) {
    try {
      isLoading.value = true
      const response = await axios.get(`/public/event-types/${slug}`)
      eventType.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to load event type'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get available time slots for a specific date
  async function getAvailableSlots(eventTypeId: number, date: string) {
    try {
      isLoading.value = true
      const response = await axios.get(`/public/availability/${eventTypeId}`, {
        params: { date }
      })
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to load availability'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Create a booking
  async function createBooking(bookingData: any) {
    try {
      isLoading.value = true
      const response = await axios.post('/public/bookings', bookingData)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to create booking'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get booking details
  async function getBooking(bookingId: string) {
    try {
      isLoading.value = true
      const response = await axios.get(`/public/bookings/${bookingId}`)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to load booking details'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function getProfileByUserId(userId: string) {
    try {
      isLoading.value = true;
      const response = await axios.get(`/public/profile/${userId}`);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to load user profile';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    eventType,
    isLoading,
    error,
    fetchPublicEventType,
    getAvailableSlots,
    createBooking,
    getBooking,
    getProfileByUserId
  }
})