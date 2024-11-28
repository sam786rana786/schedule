import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '@/plugins/axios'
import type { EventType, BookingData } from '@/types/eventType'

export const useEventTypeStore = defineStore('eventType', () => {
  const eventTypes = ref<EventType[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchEventTypes() {
    try {
      isLoading.value = true
      const response = await axios.get('/api/event-types')
      eventTypes.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to load event types'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createEventType(eventTypeData: Partial<EventType>) {
    try {
      isLoading.value = true
      const response = await axios.post('/api/event-types', eventTypeData)
      eventTypes.value.push(response.data)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to create event type'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateEventType(id: number, eventTypeData: Partial<EventType>) {
    try {
      isLoading.value = true
      const response = await axios.put(`/api/event-types/${id}`, eventTypeData)
      const index = eventTypes.value.findIndex(et => et.id === id)
      if (index !== -1) {
        eventTypes.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to update event type'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteEventType(id: number) {
    try {
      isLoading.value = true
      await axios.delete(`/api/event-types/${id}`)
      eventTypes.value = eventTypes.value.filter(et => et.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to delete event type'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createBooking(bookingData: BookingData) {
    try {
      isLoading.value = true;
      const response = await axios.post(`/api/event-types/${bookingData.eventTypeId}/book`, bookingData);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to create booking';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    eventTypes,
    isLoading,
    error,
    fetchEventTypes,
    createEventType,
    updateEventType,
    deleteEventType,
    createBooking
  }
})