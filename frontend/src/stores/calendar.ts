import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '@/plugins/axios'
import type { Event, EventCreate, TimeSlot, EventType } from '@/types/event'
import { getUserTimezone } from '@/utils/timezone';

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    events: {
      items: [] as Event[],
      total: 0,
      page: 1,
      pages: 1
    },
    eventTypes: [],
    selectedEventType: null as EventType | null,
    isLoading: false,
    error: null as string | null,
    selectedDate: null as Date | null
  }),

  actions: {
    async fetchEventTypes() {
      try {
        const response = await axios.get('/api/event-types');
        this.eventTypes = response.data;
      } catch (err) {
        console.error('Failed to fetch event types:', err);
      }
    },

    async getTimeSlotsForDate(startDate: string, endDate: string, eventTypeId?: number) {
      try {
        const params = new URLSearchParams({
          start_date: startDate,
          end_date: endDate,
          timezone: 'Asia/Kolkata',
          ...(eventTypeId && { event_type_id: eventTypeId.toString() })
        });

        const response = await axios.get(`/api/timeslots?${params.toString()}`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching time slots:', error);
        throw error;
      }
    },

    setSelectedEventType(eventType: EventType | null) {
      this.selectedEventType = eventType;
    },

    async createEvent(eventData: any) {
      try {
        const response = await axios.post('/api/events', {
          ...eventData,
          created_at: new Date().toISOString()
        });
        // Add new event to state
        this.events.items.push(response.data);
        // Refresh events for the month
        if (this.selectedDate) {
          const start = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth());
          const end = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1);
          await this.fetchEvents(start, end);
        }
        return response.data;
      } catch (error) {
        console.error('Error creating event:', error);
        throw error;
      }
    },

    async updateEvent(eventId: number, eventData: Partial<Event>) {
      try {
        this.isLoading = true;
        const response = await axios.put(`/api/events/${eventId}`, eventData);
        const index = this.events.items.findIndex(e => e.id === eventId);
        if (index !== -1) {
          this.events.items[index] = response.data;
        }
        return response.data;
      } catch (err: any) {
        this.error = err.response?.data?.detail || 'Failed to update event';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteEvent(eventId: number) {
      try {
        this.isLoading = true;
        await axios.delete(`/api/events/${eventId}`);
        this.events.items = this.events.items.filter(e => e.id !== eventId);
      } catch (err: any) {
        this.error = err.response?.data?.detail || 'Failed to delete event';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchEvents(startDate?: Date, endDate?: Date) {
      this.isLoading = true;
      try {
        const params = {
          start_date: startDate?.toISOString(),
          end_date: endDate?.toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        const response = await axios.get('/api/events', { params });
        this.events = response.data;
      } catch (err) {
        this.error = 'Failed to fetch events';
        throw err;
      } finally {
        this.isLoading = false;
      }
    }
  }
});
