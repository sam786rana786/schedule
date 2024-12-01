<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { useCalendarStore } from '@/stores/calendar';
import { useNotificationStore } from '@/stores/notification';
import { useAuthStore } from '@/stores/auth';
import { useEventTypeStore } from '@/stores/eventType';
import type { TimeSlot, EventType } from '@/types/event';
import { getUserTimezone, formatToUserTimezone, formatDateForAPI } from '@/utils/timezone';

const emit = defineEmits(['date-select', 'time-select', 'schedule-confirm']);

const calendarStore = useCalendarStore();
const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const eventTypeStore = useEventTypeStore();

const selectedEventType = computed(() => calendarStore.selectedEventType);
const currentDate = ref(new Date());
const selectedDate = ref<Date | null>(null);
const selectedTime = ref<string | null>(null);
const showTimeSlots = ref(false);
const timeSlots = ref<TimeSlot[]>([]);
const showConfirmation = ref(false);
const selectedSlot = ref<TimeSlot | null>(null);

const activeEventType = computed(() => 
  eventTypeStore.eventTypes.find(et => et.is_active)
);

watch(activeEventType, async (newEventType) => {
  if (newEventType) {
    calendarStore.setSelectedEventType(newEventType);
    // Reset other selections when event type changes
    selectedDate.value = null;
    selectedTime.value = null;
    showTimeSlots.value = false;
  }
});

interface CalendarDay {
  type: 'empty' | 'day';
  day?: number;
  date?: Date;
  isToday?: boolean;
  isSelected?: boolean;
  isPast?: boolean;
  hasEvents?: boolean;
}

const calendarDays = computed<CalendarDay[]>(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const days: CalendarDay[] = [];

  // Add empty cells
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push({ type: 'empty' });
  }

  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isToday = new Date().toDateString() === date.toDateString();
    const isSelected = selectedDate.value?.toDateString() === date.toDateString();
    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
    
    // Safely check for events
    const hasEvents = Array.isArray(calendarStore.events.items) && 
      calendarStore.events.items.some(event => {
        const eventDate = new Date(event.start_time);
        return eventDate.toDateString() === date.toDateString();
      });

    days.push({
      type: 'day',
      day,
      date,
      isToday,
      isSelected,
      isPast,
      hasEvents: hasEvents || false
    });
  }

  return days;
});

const handleEventTypeChange = (event: Event) => {
  const select = event.target as HTMLSelectElement;
  const eventTypeId = parseInt(select.value);
  const eventType = calendarStore.eventTypes.find((et: EventType) => et.id === eventTypeId);
  calendarStore.setSelectedEventType(eventType || null);
};

const prevMonth = async () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1);
  showTimeSlots.value = false;
  await fetchEventsForMonth(currentDate.value);
};

const nextMonth = async () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1);
  showTimeSlots.value = false;
  await fetchEventsForMonth(currentDate.value);
};

const fetchEventsForMonth = async (date: Date) => {
  try {
    // Set dates in local timezone
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    await calendarStore.fetchEvents(startDate, endDate);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    notificationStore.showNotification('error', 'Failed to load calendar events');
  }
};

onMounted(async () => {
  try {
    await Promise.all([
      calendarStore.fetchEventTypes(),
      fetchEventsForMonth(currentDate.value),
      eventTypeStore.fetchEventTypes()
    ]);
  } catch (error) {
    console.error('Failed to fetch initial data:', error);
    notificationStore.showNotification('error', 'Failed to load calendar data');
  }
});

const handleTimeSelect = (slot: TimeSlot) => {
  if (!slot.available) {
    notificationStore.showNotification('error', 'This time slot is already booked');
    return;
  }
  selectedSlot.value = slot;
  showConfirmation.value = true;
};

const handleDateSelect = async (date: Date) => {
  if (!activeEventType.value) {
    notificationStore.showNotification('error', 'Please activate an event type first');
    return;
  }

  selectedDate.value = date;
  showTimeSlots.value = true;
  selectedTime.value = null;

  try {
    const formattedDate = formatDateForAPI(date);
    const slots = await calendarStore.getTimeSlotsForDate(
      formattedDate,
      formattedDate,
      activeEventType.value.id
    );
    timeSlots.value = slots;
  } catch (error) {
    console.error('Failed to fetch time slots:', error);
    notificationStore.showNotification('error', 'Failed to load available times');
  }
};
// Reset selections when event type changes
watch(() => selectedEventType.value, () => {
  selectedDate.value = null;
  selectedTime.value = null;
  showTimeSlots.value = false;
  timeSlots.value = [];
});

watch(() => currentDate.value, async (newDate) => {
  await fetchEventsForMonth(newDate);
}, { immediate: true });

const handleScheduleConfirm = async () => {
  if (!selectedDate.value || !selectedTime.value || !selectedEventType.value) return;

  try {
    const selectedSlot = timeSlots.value.find(slot => slot.time === selectedTime.value);
    if (!selectedSlot) return;

    const eventData = {
      event_type_id: selectedEventType.value?.id ?? 0,
      title: selectedEventType.value?.name ?? '',
      start_time: selectedSlot.start_time,
      end_time: selectedSlot.end_time,
      description: `${selectedEventType.value.name} meeting`
    };

    await calendarStore.createEvent(eventData);
    notificationStore.showNotification('success', 'Meeting scheduled successfully');
    
    // Refresh the events for the month
    await fetchEventsForMonth(currentDate.value);

    selectedTime.value = null;
    showTimeSlots.value = false;
  } catch (error: any) {
    notificationStore.showNotification(
      'error',
      error.response?.data?.detail || 'Failed to schedule meeting'
    );
  }
};

const handleConfirmBooking = async () => {
  if (!activeEventType.value || !selectedSlot.value || !authStore.user) {
    notificationStore.showNotification('error', 'Missing required information');
    return;
  }

  try {
    const eventData = {
      event_type_id: activeEventType.value.id,
      title: activeEventType.value.name,
      start_time: selectedSlot.value.start_time,
      end_time: selectedSlot.value.end_time,
      description: "Slot Booked By Creator himself",
      attendee_name: authStore.user.name,
      attendee_email: authStore.user.email,
      attendee_phone: authStore.user.phone || '',
      location: 'in_person',
      answers: {
        [activeEventType.value.id]: authStore.user.phone
      },
      confirmed: 1
    };

    await calendarStore.createEvent(eventData);
    notificationStore.showNotification('success', 'Booking confirmed successfully');
    showConfirmation.value = false;

    // Refresh time slots immediately after booking
    if (selectedDate.value) {
      const formattedDate = formatDateForAPI(selectedDate.value);
      const slots = await calendarStore.getTimeSlotsForDate(
        formattedDate,
        formattedDate,
        activeEventType.value.id
      );
      timeSlots.value = slots;
    }

    // Refresh calendar events
    await fetchEventsForMonth(currentDate.value);
  } catch (error) {
    console.error('Booking failed:', error);
    notificationStore.showNotification('error', 'Failed to confirm booking');
  }
};

// Add formatting utility
const formatTime = (timeStr: string) => {
  return new Date(timeStr).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit'
  });
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-4">
    <div class="max-w-4xl mx-auto p-4">
      <!-- Event Type Selection -->
      <div v-if="activeEventType" class="mb-6">
        <h2 class="text-xl font-semibold text-gray-900 uppercase">
          {{ activeEventType.name }}
        </h2>
      </div>
      <div v-else class="mb-6">
        <p class="text-red-600 text-sm">
          Please activate an event type in settings to start scheduling
        </p>
      </div>
      <!-- Calendar Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-2">
          <Calendar class="h-5 w-5" />
          <h2 class="text-xl font-semibold">
            {{ currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }) }}
          </h2>
        </div>
        <div class="flex space-x-2">
          <button @click="prevMonth" class="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft class="h-5 w-5" />
          </button>
          <button @click="nextMonth" class="p-2 hover:bg-gray-100 rounded-full">
            <ChevronRight class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="grid grid-cols-7 gap-2 mb-4">
        <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day"
          class="text-center text-sm font-medium text-gray-500">
          {{ day }}
        </div>

        <template v-for="(day, index) in calendarDays" :key="index">
          <div v-if="day.type === 'empty'" class="h-14" />
          <button v-else @click="() => !day.isPast && day.date && handleDateSelect(day.date)" :disabled="day.isPast"
            :class="[
              'h-14 rounded-lg relative',
              day.isPast ? 'text-gray-400 cursor-not-allowed' :
                day.isSelected ? 'bg-blue-600 text-white' :
                  day.isToday ? 'bg-blue-50' : 'hover:bg-gray-100'
            ]">
            <span class="absolute top-1 right-1 text-sm">{{ day.day }}</span>
            <span v-if="day.hasEvents && !day.isSelected"
              class="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-blue-600">
            </span>
          </button>
        </template>
      </div>

      <!-- Time Slots -->
      <div v-if="showTimeSlots && selectedDate" class="mt-6">
        <h3 class="text-lg font-medium mb-4">
          Available times for {{ selectedDate.toLocaleDateString() }}
        </h3>

        <div v-if="timeSlots.length === 0" class="text-center py-8 text-gray-500">
          No available time slots for this date.
        </div>

        <div v-else class="grid grid-cols-3 gap-4">
          <button v-for="slot in timeSlots" :key="`${slot.start_time}-${slot.end_time}`"
            @click="handleTimeSelect(slot)" :disabled="!slot.available" :class="[
              'p-3 rounded-lg text-sm',
              slot.available 
                ? 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            ]">
            {{ formatTime(slot.start_time) }} - {{ formatTime(slot.end_time) }}
          </button>
        </div>

        <!-- Confirm Button -->
        <div v-if="selectedTime" class="mt-6">
          <button @click="handleScheduleConfirm" :disabled="calendarStore.isLoading"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center">
            <svg v-if="calendarStore.isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {{ calendarStore.isLoading ? 'Scheduling...' : `Confirm ${selectedDate?.toLocaleDateString()} at
            ${selectedTime}`
            }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Add confirmation modal -->
  <div v-if="showConfirmation && selectedSlot" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
    <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
      <h3 class="text-lg font-medium mb-4">Confirm Booking</h3>
      <p class="mb-4">
        Do you want to book an appointment for:
        <br>
        {{ new Date(selectedSlot.start_time).toLocaleTimeString() }} - 
        {{ new Date(selectedSlot.end_time).toLocaleTimeString() }}?
      </p>
      <div class="flex justify-end space-x-3">
        <button 
          @click="showConfirmation = false"
          class="px-4 py-2 text-gray-600 hover:text-gray-800">
          Cancel
        </button>
        <button 
          @click="handleConfirmBooking"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Confirm Booking
        </button>
      </div>
    </div>
  </div>
</template>