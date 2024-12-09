<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePublicBookingStore } from '@/stores/publicBooking';
import { Map, ChevronLeft, ChevronRight, Clock, Video, Phone, MapPin } from 'lucide-vue-next';
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
const availableTimeSlots = ref<TimeSlot[]>([]);
const isLoadingSlots = ref(false);
const companyLogo = ref<string | null>(null);
const userPic = ref<string | null>(null);
const userName = ref<string | null>(null);
const company = ref<string | null>(null);
const timeZone = ref<string | null>(null);

watch(selectedDate, async (newDate) => {
  if (!newDate || !eventType.value?.id) return;

  try {
    isLoadingSlots.value = true;
    const dateStr = new Date(newDate.getTime() - newDate.getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0];

    const response = await bookingStore.getAvailableSlots(eventType.value.id, dateStr);

    availableTimeSlots.value = response.available_slots.map((time: string) => {
      // Convert plain time to AM/PM format
      const [hours, minutes] = time.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes);

      return {
        time: date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        available: true,
      };
    });
  } catch (error) {
    console.error('Error fetching slots:', error);
    availableTimeSlots.value = [];
  } finally {
    isLoadingSlots.value = false;
  }
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

    if (eventType.value) {
      const profile = await bookingStore.getProfileByUserId(eventType.value.user_id.toString());
      companyLogo.value = profile.company_logo || null;
      userPic.value = profile.avatar_url || null;
      userName.value = profile.full_name || null;
      company.value = profile.company || null;
      timeZone.value = profile.time_zone || null;
    }

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
  <div class="booking-page bg-gray-50 min-h-screen py-10">
    <!-- Event Type Details and Calendar -->
    <div
      v-if="eventType"
      class="container mx-auto flex flex-col lg:flex-row bg-white shadow rounded-lg"
    >
      <!-- Event Type Details -->
      <div class="info-section flex-shrink-0 lg:w-1/3 p-6 border-b lg:border-r border-gray-200">
        <div class="flex items-center mb-4">
          <img
            v-if="companyLogo"
            :src="`http://127.0.0.1:8000${companyLogo}`"
            alt="Company Logo"
          />
        </div>
        <hr />
        <h1 class="text-2xl font-bold text-gray-800 mb-4">
          {{ eventType.name }}
        </h1>
        <p class="text-gray-600">
          Meeting is with <span class="font-semibold">{{ userName }}</span>.
        </p>
        <div class="details mt-4 text-gray-700">
          <div class="flex items-center mb-2">
            <Clock class="h-5 w-5 text-gray-500 mr-2" />
            <span>{{ eventType.duration }} minutes</span>
          </div>
          <div class="flex items-center">
            <MapPin class="h-5 w-5 text-gray-500 mr-2" />
            <span>{{ company }}</span>
          </div>
        </div>
        <div v-if="eventType.locations?.length" class="mt-6">
          <h3 class="text-sm font-medium text-gray-900 mb-2">
            Available Locations
          </h3>
          <ul class="space-y-2 text-gray-600">
            <li
              v-for="location in eventType.locations"
              :key="location"
              class="flex items-center"
            >
              <component
                :is="getLocationIcon(location)"
                class="h-5 w-5 text-gray-500 mr-2"
              />
              {{ formatLocation(location) }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Calendar and Time Slots -->
      <div class="calendar-section flex-1 p-6 lg:flex lg:space-x-6">
        <!-- Calendar -->
        <div class="lg:flex-1 lg:max-w-lg">
          <div class="flex items-center justify-between mb-6">
            <button
              @click="handlePrevMonth"
              class="p-2 rounded-full border border-gray-300 hover:bg-gray-100"
            >
              <ChevronLeft class="h-5 w-5 text-gray-600" />
            </button>
            <h2 class="text-lg font-semibold text-gray-900">
              {{ currentMonth.toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              }) }}
            </h2>
            <button
              @click="handleNextMonth"
              class="p-2 rounded-full border border-gray-300 hover:bg-gray-100"
            >
              <ChevronRight class="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <!-- Calendar Grid -->
          <div class="grid grid-cols-7 gap-2">
            <!-- Calendar Header -->
            <div
              v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
              :key="day"
              class="text-center text-sm font-semibold text-gray-500"
            >
              {{ day }}
            </div>

            <!-- Calendar Days -->
            <template v-for="(week, weekIndex) in calendarWeeks" :key="weekIndex">
              <template v-for="(day, dayIndex) in week" :key="dayIndex">
                <div
                  v-if="day.type === 'empty'"
                  class="bg-white min-h-[70px]"
                ></div>
                <button
                  v-else
                  @click="!day.isPast && day.date && handleDateSelect(day.date)"
                  :disabled="day.isPast"
                  :class="[
                    'min-h-[70px] flex items-center justify-center rounded-md border',
                    day.isPast
                      ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                      : day.isSelected
                      ? 'bg-blue-100 text-blue-600 border-blue-300'
                      : day.isToday
                      ? 'bg-blue-50 text-blue-600 border-blue-200'
                      : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50',
                  ]"
                >
                  <time
                    :datetime="day.date?.toISOString()"
                    class="text-sm font-medium"
                  >
                    {{ day.day }}
                  </time>
                </button>
              </template>
            </template>
          </div>

          <div class="timezone mt-4 text-sm text-gray-600">
            <span>Time zone:</span>
            <span class="font-bold"> {{ timeZone }}</span>
          </div>
        </div>

        <!-- Time Slots -->
        <div
          v-if="selectedDate"
          class="flex-shrink-0 w-full lg:w-1/3 bg-gray-50 rounded-lg p-4 border"
        >
          <h3 class="text-lg text-center font-medium text-gray-900 mb-4">
            {{ selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }}
          </h3>
          <div v-if="isLoadingSlots" class="text-center py-4">
            <svg
              class="animate-spin h-5 w-5 text-blue-600 mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>
          </div>
          <div
            v-else-if="availableTimeSlots.length === 0"
            class="text-center py-4 text-gray-500"
          >
            No available time slots for this date.
          </div>
          <div class="grid grid-cols-1 gap-2">
            <button
              v-for="slot in availableTimeSlots"
              :key="slot.time"
              @click="handleTimeSelect(slot.time)"
              :disabled="!slot.available"
              :class="[
                'py-4 text-sm rounded-lg border',
                slot.available
                  ? 'text-gray-900 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                  : 'text-gray-400 bg-gray-50 cursor-not-allowed',
              ]"
            >
              {{ slot.time }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.booking-page {
  font-family: "Inter", sans-serif;
}

.container {
  max-width: 960px;
}

.info-section {
  background-color: #f9f9f9;
}

.calendar-section {
  background-color: #ffffff;
}

button:disabled {
  cursor: not-allowed;
}
</style>

