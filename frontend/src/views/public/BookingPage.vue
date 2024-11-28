<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePublicBookingStore } from '@/stores/publicBooking';
import { Calendar, ChevronLeft, ChevronRight, Clock, Video, Phone, MapPin } from 'lucide-vue-next';
import type { EventType } from '@/types/eventType';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface CalendarDay {
  type: 'empty' | 'day';
  date?: Date;
  day?: number;
  isToday?: boolean;
  isSelected?: boolean;
  isPast?: boolean;
  available?: boolean;
}

const route = useRoute();
const router = useRouter();
const bookingStore = usePublicBookingStore();

const eventType = ref<EventType | null>(null);
const selectedDate = ref<Date | null>(null);
const selectedTime = ref<string | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const currentMonth = ref(new Date());

// Time slots generation
const availableTimeSlots = computed<TimeSlot[]>(() => {
  if (!selectedDate.value) return [];

  const slots: TimeSlot[] = [];
  const startHour = 9;
  const endHour = 17;

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minutes of [0, 30]) {
      const time = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      slots.push({
        time,
        available: true // You'll need to implement availability check based on existing bookings
      });
    }
  }

  return slots;
});

// Calendar data
const calendarWeeks = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const weeks: CalendarDay[][] = [];
  let currentWeek: CalendarDay[] = [];

  // Add empty days for the first week
  for (let i = 0; i < firstDay.getDay(); i++) {
    currentWeek.push({ type: 'empty' });
  }

  // Add actual days
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    const isToday = new Date().toDateString() === date.toDateString();
    const isSelected = selectedDate.value?.toDateString() === date.toDateString();
    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

    currentWeek.push({
      type: 'day',
      date,
      day,
      isToday,
      isSelected,
      isPast,
      available: true
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Fill in the last week if needed
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ type: 'empty' });
    }
    weeks.push(currentWeek);
  }

  return weeks;
});

onMounted(async () => {
  try {
    const { slug } = route.params;
    if (typeof slug !== 'string') {
      error.value = 'Invalid event type slug';
      return;
    }

    const fetchedEventType = await bookingStore.fetchPublicEventType(slug);
    eventType.value = fetchedEventType;

    if (!eventType.value) {
      error.value = 'Event type not found';
      return;
    }
  } catch (err) {
    error.value = 'Failed to load event type';
  } finally {
    isLoading.value = false;
  }
});

// Rest of your existing methods with proper typing...

const handleDateSelect = (date: Date) => {
  selectedDate.value = date;
  selectedTime.value = null;
};

const handleTimeSelect = (time: string) => {
  selectedTime.value = time;
  if (!selectedDate.value) return;

  router.push({
    name: 'booking-form',
    params: { slug: route.params.slug as string },
    query: {
      date: selectedDate.value.toISOString(),
      time: time
    }
  });
};

const formatLocation = (locationType: string) => {
  switch (locationType) {
    case 'google_meet': return 'Google Meet';
    case 'zoom': return 'Zoom';
    case 'phone': return 'Phone Call';
    case 'in_person': return 'In Person';
    default: return locationType;
  }
};

const getLocationIcon = (locationType: string) => {
  switch (locationType) {
    case 'google_meet':
    case 'zoom':
      return Video;
    case 'phone':
      return Phone;
    case 'in_person':
      return MapPin;
    default:
      return Video;
  }
};
const handlePrevMonth = async () => {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() - 1
  );
  selectedDate.value = null;
};

const handleNextMonth = async () => {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() + 1
  );
  selectedDate.value = null;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-600 text-lg">{{ error }}</div>
        <button @click="router.push('/')" class="mt-4 text-blue-600 hover:text-blue-500">
          Return to Homepage
        </button>
      </div>

      <!-- Event Type Details and Calendar -->
      <div v-else-if="eventType" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Event Type Details -->
        <div class="lg:col-span-1">
          <div class="bg-white shadow rounded-lg p-6">
            <h1 class="text-2xl font-bold text-gray-900">{{ eventType.name }}</h1>

            <div class="mt-2 flex items-center text-gray-500">
              <Clock class="h-5 w-5 mr-2" />
              <span>{{ eventType.duration }} minutes</span>
            </div>

            <p v-if="eventType.description" class="mt-4 text-gray-600">
              {{ eventType.description }}
            </p>

            <!-- Location Options -->
            <div v-if="eventType.locations?.length" class="mt-6">
              <h3 class="text-sm font-medium text-gray-900">Available Locations</h3>
              <ul class="mt-2 space-y-2">
                <li v-for="location in eventType.locations" :key="location"
                  class="flex items-center text-sm text-gray-600">
                  <component :is="getLocationIcon(location)" class="h-4 w-4 mr-2" />
                  {{ formatLocation(location) }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Calendar Component -->
        <div class="lg:col-span-2 bg-white shadow rounded-lg p-6">
          <!-- Calendar header -->
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-medium text-gray-900">Select a Date & Time</h2>
            <div class="flex space-x-2">
              <button @click="handlePrevMonth" class="p-2 hover:bg-gray-100 rounded-full">
                <ChevronLeft class="h-5 w-5" />
              </button>
              <span class="text-gray-900 font-medium">
                {{ currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' }) }}
              </span>
              <button @click="handleNextMonth" class="p-2 hover:bg-gray-100 rounded-full">
                <ChevronRight class="h-5 w-5" />
              </button>
            </div>
          </div>

          <!-- Calendar grid -->
          <div class="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
            <!-- Calendar Header -->
            <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day"
              class="bg-gray-50 py-2 text-center text-sm font-medium text-gray-700">
              {{ day }}
            </div>

            <!-- Calendar Days -->
            <template v-for="(week, weekIndex) in calendarWeeks" :key="weekIndex">
              <template v-for="(day, dayIndex) in week" :key="dayIndex">
                <div v-if="day.type === 'empty'" class="bg-white relative min-h-[100px]" />
                <button v-else @click="() => !day.isPast && day.date && handleDateSelect(day.date)"
                  :disabled="day.isPast" :class="[
                    'bg-white relative min-h-[100px] p-2 hover:bg-gray-50 focus:z-10 focus:outline-none',
                    day.isPast ? 'text-gray-400 cursor-not-allowed' :
                      day.isSelected ? 'bg-blue-50 text-blue-600' :
                        day.isToday ? 'text-blue-600' : 'text-gray-900'
                  ]">
                  <time :datetime="day.date?.toISOString()" class="font-medium">{{ day.day }}</time>
                </button>
              </template>
            </template>
          </div>

          <!-- Time slots -->
          <div v-if="selectedDate" class="mt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Available times for {{ selectedDate.toLocaleDateString() }}
            </h3>
            <div class="grid grid-cols-4 gap-2">
              <button v-for="slot in availableTimeSlots" :key="slot.time" @click="handleTimeSelect(slot.time)"
                :disabled="!slot.available" :class="[
                  'px-4 py-2 text-sm rounded-lg border',
                  slot.available
                    ? 'text-gray-900 border-gray-300 hover:border-blue-500'
                    : 'text-gray-400 bg-gray-50 cursor-not-allowed'
                ]">
                {{ slot.time }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>