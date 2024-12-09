<!-- src/views/BookingConfirmation.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Calendar, Clock, Video, MapPin, Phone } from 'lucide-vue-next'
import { useNotificationStore } from '@/stores/notification'
import type { EventType } from '@/types/eventType';
import axios from '@/plugins/axios'

interface BookingDetails {
  id: number
  event_type_id: number
  start_time: string
  end_time: string
  attendee_name: string
  attendee_email: string
  attendee_phone: string
  location: string
  notes?: string
  answers?: Record<string, any>
  created_at: string
}

const route = useRoute()
const router = useRouter()
const notificationStore = useNotificationStore()

// State management
const booking = ref<BookingDetails | null>(null)
const eventType = ref<EventType | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

// Helper functions for formatting
const formatLocation = (locationType: string) => {
  switch (locationType) {
    case 'google_meet':
      return 'Google Meet'
    case 'zoom':
      return 'Zoom'
    case 'phone':
      return 'Phone Call'
    case 'in_person':
      return 'In Person'
    default:
      return locationType
  }
}

const getLocationIcon = (locationType: string) => {
  switch (locationType) {
    case 'google_meet':
    case 'zoom':
      return Video
    case 'phone':
      return Phone
    case 'in_person':
      return MapPin
    default:
      return Video
  }
}

// Question label helper function
const getQuestionLabel = (questionId: string) => {
  if (!eventType.value?.questions) return questionId;
  
  const question = eventType.value.questions.find(q => q.id === questionId);
  return question ? question.label : questionId;
};

// Computed property for formatted answers
const formattedAnswers = computed(() => {
  if (!booking.value?.answers || !eventType.value?.questions) return {};
  
  const formatted: Record<string, string> = {};
  for (const [questionId, answer] of Object.entries(booking.value.answers)) {
    const label = getQuestionLabel(questionId);
    formatted[label] = answer as string;
  }
  return formatted;
});

const fetchBookingAndEventType = async (bookingId: string) => {
  try {
    // First fetch booking details
    const bookingResponse = await axios.get(`/public/bookings/${bookingId}`);
    booking.value = bookingResponse.data;

    // Then fetch event type details using the ID endpoint
    if (booking.value?.event_type_id) {
      const eventTypeResponse = await axios.get(
        `/public/event-types/${booking.value.event_type_id}?by_id=true`
      );
      eventType.value = eventTypeResponse.data;
    }
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Failed to load booking details';
    notificationStore.showNotification('error', error.value || 'Unknown error');
  } finally {
    isLoading.value = false;
  }
};

// Data fetching
onMounted(async () => {
  const bookingId = route.params.bookingId;
  if (bookingId) {
    await fetchBookingAndEventType(bookingId as string);
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-600 text-lg">{{ error }}</div>
        <button @click="router.push('/')" class="mt-4 text-blue-600 hover:text-blue-500">
          Return to Homepage
        </button>
      </div>

      <!-- Confirmation Content -->
      <div v-else-if="booking" class="bg-white shadow rounded-lg overflow-hidden">
        <!-- Success Header -->
        <div class="bg-green-50 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-lg font-medium text-green-800">Booking Confirmed!</h3>
              <p class="mt-1 text-sm text-green-600">
                You'll receive a confirmation email shortly with the meeting details.
              </p>
            </div>
          </div>
        </div>

        <!-- Booking Details -->
        <div class="px-6 py-8">
          <div class="space-y-6">
            <!-- Date and Time -->
            <div class="flex items-start">
              <Calendar class="h-5 w-5 text-gray-400 mt-1" />
              <div class="ml-3">
                <h4 class="text-sm font-medium text-gray-900">Date & Time</h4>
                <p class="mt-1 text-sm text-gray-500">
                  {{ new Date(booking.start_time).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) }}
                </p>
                <p class="mt-1 text-sm text-gray-500">
                  {{ new Date(booking.start_time).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) }} - 
                  {{ new Date(booking.end_time).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) }}
                </p>
              </div>
            </div>

            <!-- Location -->
            <div class="flex items-start">
              <component :is="getLocationIcon(booking.location)" class="h-5 w-5 text-gray-400 mt-1" />
              <div class="ml-3">
                <h4 class="text-sm font-medium text-gray-900">Location</h4>
                <p class="mt-1 text-sm text-gray-500">
                  {{ formatLocation(booking.location) }}
                </p>
              </div>
            </div>

            <!-- Additional Notes -->
            <div v-if="booking" class="border-t border-gray-200 pt-6">
              <h4 class="text-sm font-medium text-gray-900">Your Details</h4>
              <p class="mt-1 text-sm text-gray-500">{{ booking?.attendee_name }}</p>
              <p class="mt-1 text-sm text-gray-500">{{ booking?.attendee_email }}</p>
              <p class="mt-1 text-sm text-gray-500">{{ booking?.attendee_phone }}</p>
            </div>

            <!-- Custom Questions -->
            <div v-if="booking.answers && booking.answers.length > 0" class="border-t border-gray-200 pt-6">
              <h4 class="text-sm font-medium text-gray-900 mb-4">Additional Information</h4>
              <dl class="space-y-3">
                <template v-for="(answer, label) in formattedAnswers" :key="label">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">{{ label }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ answer }}</dd>
                  </div>
                </template>
              </dl>
            </div>
          </div>

          <!-- Calendar Options -->
          <div class="mt-8 space-y-4">
            <h4 class="text-sm font-medium text-gray-900">Add to Calendar</h4>
            <div class="grid grid-cols-2 gap-4">
              <a href="#" class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Google Calendar
              </a>
              <a href="#" class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Outlook Calendar
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>