import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from '@/plugins/axios';

interface Event {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  attendee_name: string;
  attendee_email: string;
  attendee_phone: string;
  event_type_id: number;
  status: string;
}

interface EventList {
  items: Event[];
  total: number;
  page: number;
  pages: number;
}

export const useScheduledEventsStore = defineStore('scheduledEvents', () => {
  const events = ref<EventList>({
    items: [],
    total: 0,
    page: 1,
    pages: 1
  });
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchEvents = async (params: {
    status?: string;
    page?: number;
    q?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    isLoading.value = true;
    try {
      // Convert params to URLSearchParams to ensure proper encoding
      const queryParams = new URLSearchParams();
      
      if (params.status) queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.q) queryParams.append('q', params.q);
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);

      const response = await axios.get(`/api/events?${queryParams.toString()}`);
      events.value = response.data;
    } catch (err) {
      console.error('Error fetching events:', err);
      error.value = 'Failed to fetch events';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const cancelEvent = async (eventId: number, reason: string) => {
    try {
      await axios.delete(`/api/events/${eventId}/cancel`, {
        data: { reason } // Send reason in request body
      });
    } catch (error) {
      console.error('Failed to cancel event:', error);
      throw error;
    }
  };

  return {
    events,
    isLoading,
    error,
    fetchEvents,
    cancelEvent
  };
});