import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '@/plugins/axios'
import type { Event, EventCreate, CalendarDay, TimeSlot  } from '@/types/event'

export const useCalendarStore = defineStore('calendar', () => {
  const events = ref<Event[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const calendarDays = ref<CalendarDay[][]>([]);

  async function fetchAvailability({ eventTypeId, start, end }: { 
    eventTypeId: number;
    start: Date;
    end: Date;
  }) {
    try {
      isLoading.value = true;
      
      // First fetch events for the date range
      await fetchEvents(start, end);
      
      // Process the calendar days with events data
      calendarDays.value = processCalendarDays(start, end);
      
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch availability';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchEvents(startDate?: Date, endDate?: Date) {
    try {
      isLoading.value = true
      let url = '/api/events'
      const params: Record<string, string> = {}
      
      if (startDate) {
        params.start_date = startDate.toISOString()
      }
      if (endDate) {
        params.end_date = endDate.toISOString()
      }

      const response = await axios.get(url, { params })
      events.value = response.data
    } catch (err: any) {
      console.error('Error fetching events:', err)
      error.value = err.response?.data?.detail || 'Failed to load events'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createEvent(eventData: EventCreate) {
    try {
      isLoading.value = true

      if (!eventData.start_time || !eventData.end_time) {
        throw new Error('Start time and end time are required')
      }

      const response = await axios.post('/api/events', eventData)
      events.value.push(response.data)
      return response.data
    } catch (err: any) {
      console.error('Error creating event:', err)
      error.value = err.response?.data?.detail || 'Failed to create event'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateEvent(eventId: number, eventData: Partial<Event>) {
    try {
      isLoading.value = true
      const response = await axios.put(`/api/events/${eventId}`, eventData)
      const index = events.value.findIndex((e: Event) => e.id === eventId)
      if (index !== -1) {
        events.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to update event'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteEvent(eventId: number) {
    try {
      isLoading.value = true
      await axios.delete(`/api/events/${eventId}`)
      events.value = events.value.filter((e: Event) => e.id !== eventId)
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to delete event'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  // Helper function to process availability data into calendar days
  function processCalendarDays(start: Date, end: Date): CalendarDay[][] {
    const weeks: CalendarDay[][] = [];
    let currentWeek: CalendarDay[] = [];
    
    const month = start.getMonth();
    const year = start.getFullYear();
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const numDays = lastDay.getDate();
    
    // Fill in empty days before first of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      currentWeek.push({
        date: new Date(year, month, -i),
        isCurrentMonth: false,
        hasEvents: false,
        available: false,
        timeSlots: []
      });
    }
    
    // Fill in days of month
    for (let day = 1; day <= numDays; day++) {
      const date = new Date(year, month, day);
      const dayEvents = events.value.filter(event => {
        const eventDate = new Date(event.start_time);
        return eventDate.toDateString() === date.toDateString();
      });
      
      const timeSlots = getTimeSlotsForDate(date);
      
      currentWeek.push({
        date,
        isCurrentMonth: true,
        hasEvents: dayEvents.length > 0,
        available: timeSlots.some(slot => slot.available),
        timeSlots
      });
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // Fill in empty days after end of month
    if (currentWeek.length > 0) {
      const remainingDays = 7 - currentWeek.length;
      for (let i = 1; i <= remainingDays; i++) {
        currentWeek.push({
          date: new Date(year, month + 1, i),
          isCurrentMonth: false,
          hasEvents: false,
          available: false,
          timeSlots: []
        });
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  }

  function getTimeSlotsForDate(date: Date): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 17;
    
    // Don't show slots for past dates
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
      return [];
    }

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minutes of [0, 30]) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, minutes, 0, 0);
        
        // Don't show past slots for today
        if (date.toDateString() === new Date().toDateString() && slotTime < new Date()) {
          continue;
        }
        
        // Check if slot is booked
        const isBooked = events.value.some(event => {
          const eventStart = new Date(event.start_time);
          const eventEnd = new Date(event.end_time);
          return slotTime >= eventStart && slotTime < eventEnd;
        });
        
        const eventInfo = events.value.find(event => {
          const eventStart = new Date(event.start_time);
          const eventEnd = new Date(event.end_time);
          return slotTime >= eventStart && slotTime < eventEnd;
        });

        slots.push({
          time: `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
          available: !isBooked,
          event: eventInfo,
          date: slotTime
        });
      }
    }
    
    return slots;
  }


  return {
    events,
    isLoading,
    error,
    calendarDays,
    fetchAvailability,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    clearError,
    getTimeSlotsForDate
  }
})