import { defineStore } from 'pinia';
import axios from '@/plugins/axios';
import { ref } from 'vue';

interface EventType {
  id: number;
  name: string;
  duration: number;
  is_active: boolean;
  user_id: number;
  slug: string;
  color: string;
  description?: string;
  questions?: Array<any>; // Define proper type if known
  locations?: Array<string>;
  booking_rules?: {
    // Add booking rules structure
    future_limit?: number;
    min_notice?: number;
  };
}

export const useEventTypeStore = defineStore('eventType', () => {
  const eventTypes = ref<EventType[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchEventTypes = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await axios.get('/api/event-types');
      eventTypes.value = response.data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch event types';
      throw e;
    } finally {
      isLoading.value = false;
    }
  };

  const createEventType = async (data: Partial<EventType>) => {
    try {
      const response = await axios.post('/api/event-types', data);
      await fetchEventTypes(); // Refresh list after creation
      return response.data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create event type';
      throw e;
    }
  };

  const updateEventType = async (id: number, data: Partial<EventType>) => {
    try {
      const response = await axios.put(`/api/event-types/${id}`, data);
      return response.data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update event type';
      throw e;
    }
  };

  const deleteEventType = async (id: number) => {
    try {
      await axios.delete(`/api/event-types/${id}`);
      eventTypes.value = eventTypes.value.filter(et => et.id !== id);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete event type';
      throw e;
    }
  };

  const toggleEventType = async (id: number) => {
    isLoading.value = true;
    error.value = null;
    try {
      // Deactivate all other event types
      await Promise.all(
        eventTypes.value
          .filter(et => et.id !== id && et.is_active)
          .map(et => updateEventType(et.id, { is_active: false }))
      );

      // Toggle the selected event type
      const eventType = eventTypes.value.find(et => et.id === id);
      if (eventType) {
        await updateEventType(id, { is_active: !eventType.is_active });
      }
      
      await fetchEventTypes();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to toggle event type';
      throw e;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    eventTypes,
    isLoading,
    error,
    fetchEventTypes,
    createEventType,
    updateEventType,
    deleteEventType,
    toggleEventType
  };
});