<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { useCalendarStore } from '@/stores/calendar';
import { useNotificationStore } from '@/stores/notification';
import type { TimeSlot } from '@/types/event';

const emit = defineEmits(['date-select', 'time-select', 'schedule-confirm']);

const calendarStore = useCalendarStore();
const notificationStore = useNotificationStore();

const currentDate = ref(new Date());
const selectedDate = ref<Date | null>(null);
const selectedTime = ref<string | null>(null);
const showTimeSlots = ref(false);

// Fetch events when component mounts
onMounted(async () => {
  try {
    // Fetch events for the current month
    await fetchEventsForMonth(currentDate.value);
  } catch (error) {
    console.error('Failed to fetch events:', error);
  }
});

// Function to fetch events for a specific month
const fetchEventsForMonth = async (date: Date) => {
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  await calendarStore.fetchEvents(startDate, endDate);
};

// Calendar navigation with event fetching
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

// Helper function to check if a time slot is booked
const isTimeSlotBooked = (date: Date, time: string): { isBooked: boolean; eventInfo?: any } => {
  const [hours, minutes] = time.split(':').map(Number);
  const slotTime = new Date(date);
  slotTime.setHours(hours, minutes, 0, 0);

  const bookedEvent = calendarStore.events.find(event => {
    const eventStart = new Date(event.start_time);
    const eventEnd = new Date(event.end_time);
    return slotTime >= eventStart && slotTime < eventEnd;
  });

  return {
    isBooked: !!bookedEvent,
    eventInfo: bookedEvent
  };
};

// Generate time slots considering booked slots
const timeSlots = computed(() => {
  if (!selectedDate.value) return [];
  return calendarStore.getTimeSlotsForDate(selectedDate.value);
});

const handleTimeSelect = (slot: TimeSlot) => {
  if (!slot.available) {
    notificationStore.showNotification('error', 'This time slot is already booked');
    return;
  }
  selectedTime.value = slot.time;
};

// Calendar days generation with booked date indication
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push({ type: 'empty' });
  }

  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isToday = new Date().toDateString() === date.toDateString();
    const isSelected = selectedDate.value?.toDateString() === date.toDateString();
    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

    // Check if there are any events on this day
    const hasEvents = calendarStore.events.some(event => {
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
      hasEvents
    });
  }

  return days;
});

const handleDateSelect = (date: Date) => {
  selectedDate.value = date;
  showTimeSlots.value = true;
  selectedTime.value = null;
  emit('date-select', date);
};

// Calculate end time (30 minutes after start time)
const calculateEndTime = (startTime: string): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const date = selectedDate.value as Date;
  const endTime = new Date(date);
  endTime.setHours(hours, minutes + 30, 0, 0);
  return endTime.toISOString();
};

const handleScheduleConfirm = async () => {
  if (!selectedDate.value || !selectedTime.value) return;

  try {
    const [hours, minutes] = selectedTime.value.split(':').map(Number);
    const startTime = new Date(selectedDate.value);
    startTime.setHours(hours, minutes, 0, 0);

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 30); // Assuming 30-minute slots

    const eventData = {
      title: 'New Meeting',
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      description: 'Scheduled meeting'
    };

    await calendarStore.createEvent(eventData);
    
    // Refresh the time slots
    await calendarStore.fetchEvents(
      new Date(selectedDate.value.getFullYear(), selectedDate.value.getMonth(), 1),
      new Date(selectedDate.value.getFullYear(), selectedDate.value.getMonth() + 1, 0)
    );
    
    notificationStore.showNotification('success', 'Meeting scheduled successfully');

    // Reset selection
    selectedTime.value = null;
    showTimeSlots.value = false;

  } catch (error: any) {
    notificationStore.showNotification(
      'error',
      error.response?.data?.detail || 'Failed to schedule meeting'
    );
  }
};

defineExpose({
  selectedDate,
  selectedTime,
  showTimeSlots,
  handleDateSelect: (date: Date) => {
    selectedDate.value = date;
    showTimeSlots.value = true;
    selectedTime.value = null;
  }
});
</script>

<template>
  <div class="max-w-4xl mx-auto p-4">
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
                day.hasEvents ? 'bg-blue-50' :
                  day.isToday ? 'border border-blue-600' : 'hover:bg-gray-100'
          ]">
          <span class="absolute top-1 right-1 text-sm">{{ day.day }}</span>
          <!-- Dot indicator for days with events -->
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

    <!-- Time slots grid -->
    <div class="grid grid-cols-4 gap-4">
      <button 
        v-for="slot in timeSlots" 
        :key="`${slot.date.toISOString()}-${slot.time}`"
        @click="handleTimeSelect(slot)"
        :disabled="!slot.available"
        :class="[
          'p-4 rounded-lg border text-sm font-medium relative',
          slot.available 
            ? selectedTime === slot.time
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'border-gray-300 text-gray-900 hover:border-blue-500'
            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
        ]"
      >
        {{ slot.time }}
        
        <!-- Booked indicator overlay -->
        <div 
          v-if="!slot.available" 
          class="absolute inset-0 bg-gray-50 bg-opacity-90 flex items-center justify-center rounded-lg"
        >
          <div class="text-xs text-gray-500 flex flex-col items-center space-y-1">
            <span>Booked</span>
            <span v-if="slot.event?.attendee_name" class="text-gray-400">
              {{ slot.event.attendee_name }}
            </span>
          </div>
        </div>
      </button>
    </div>

    <!-- No available slots message -->
    <div 
      v-if="timeSlots.length === 0" 
      class="text-center py-8 text-gray-500"
    >
      No available time slots for this date.
    </div>

    <!-- Confirm button -->
    <div v-if="selectedTime" class="mt-6">
      <button 
        @click="handleScheduleConfirm"
        :disabled="calendarStore.isLoading"
        class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
      >
        <svg 
          v-if="calendarStore.isLoading" 
          class="animate-spin -ml-1 mr-3 h-5 w-5" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path 
            class="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {{ calendarStore.isLoading ? 'Scheduling...' : `Confirm ${selectedDate.toLocaleDateString()} at ${selectedTime}` }}
      </button>
      </div>
    </div>
  </div>
</template>