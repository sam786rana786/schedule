<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Calendar, ChevronLeft, ChevronRight, Clock, Video, MapPin, Phone, Trash, Edit } from 'lucide-vue-next';
import { useNotificationStore } from '@/stores/notification';
import axios from '@/plugins/axios';

interface Event {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  attendee_name: string;
  attendee_email: string;
  location: string;
  status: string;
  notes?: string;
}

// State management
const events = ref<Event[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const currentTab = ref('upcoming');
const currentPage = ref(1);
const totalPages = ref(1);
const searchQuery = ref('');
const showCancelModal = ref(false);
const selectedEvent = ref<Event | null>(null);

const notificationStore = useNotificationStore();

// Filter tabs
const tabs = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' }
];

// Location formatting helper
const formatLocation = (locationType: string) => {
  switch (locationType) {
    case 'google_meet': return 'Google Meet';
    case 'zoom': return 'Zoom';
    case 'phone': return 'Phone Call';
    case 'in_person': return 'In Person';
    default: return locationType;
  }
};

// Get icon component based on location type
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

// Format date and time helper
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString(undefined, { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }),
    time: date.toLocaleTimeString(undefined, { 
      hour: 'numeric', 
      minute: '2-digit' 
    })
  };
};

// Fetch events from the API
const fetchEvents = async () => {
  try {
    isLoading.value = true;
    const response = await axios.get('/api/events', {
      params: {
        status: currentTab.value,
        page: currentPage.value,
        q: searchQuery.value
      }
    });
    
    events.value = response.data.items;
    totalPages.value = response.data.pages;
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Failed to load events';
    notificationStore.showNotification('error', error.value || 'An unknown error occurred');
  } finally {
    isLoading.value = false;
  }
};

const eventTypes = [
  { id: '30-min', name: '30-minute Events', count: 5 },
  { id: '45-min', name: '45-minute Events', count: 5 },
];

const activeTab = ref('30-min');

const activeEventType = computed(() => {
  return eventTypes.find(type => type.id === activeTab.value) || eventTypes[0];
});

const handleTabChange = (tab: string) => {
  activeTab.value = tab;
  fetchEvents();
};

// Handle tab changes
const handleTabChange1 = (tab: string) => {
  currentTab.value = tab;
  currentPage.value = 1;
  fetchEvents();
};

// Handle pagination
const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchEvents();
};

// Handle event cancellation
const handleCancelEvent = async () => {
  if (!selectedEvent.value) return;
  
  try {
    await axios.delete(`/api/events/${selectedEvent.value.id}`);
    notificationStore.showNotification('success', 'Event cancelled successfully');
    fetchEvents();
  } catch (err: any) {
    notificationStore.showNotification('error', 'Failed to cancel event');
  } finally {
    showCancelModal.value = false;
    selectedEvent.value = null;
  }
};

// Initialize data on component mount
onMounted(() => {
  fetchEvents();
});
</script>

<template>
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-2xl font-semibold text-gray-900">Scheduled Events</h1>
  
        <EventTypeTabs
          :event-types="eventTypes"
          :active-tab="activeTab"
          @tab-change="handleTabChange"
        />
  
        <!-- Events List -->
        <div v-if="events.length > 0" class="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
          <h2 class="px-4 py-4 text-lg font-medium text-gray-900">
            {{ activeEventType.name }} ({{ events.length }})
          </h2>
          <ul role="list" class="divide-y divide-gray-200">
            <li v-for="event in events" :key="event.id" class="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div class="flex items-center justify-between">
                <!-- Attendee Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center">
                    <div class="ml-4">
                      <div class="text-sm text-gray-900">{{ event.attendee_name }}</div>
                      <div class="text-sm text-gray-500">{{ event.attendee_email }}</div>
                    </div>
                  </div>
                </div>
  
                <!-- Actions -->
                <div class="ml-4 flex-shrink-0 flex space-x-2">
                  <button
                    @click="selectedEvent = event; showCancelModal = true"
                    class="text-gray-400 hover:text-red-500"
                    v-if="activeTab === 'upcoming'"
                  >
                    <Trash class="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          </ul>
  
          <!-- Pagination -->
          <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div class="flex-1 flex justify-between items-center">
              <button
                @click="handlePageChange(currentPage - 1)"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span class="text-sm text-gray-700">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <button
                @click="handlePageChange(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
  
        <!-- Empty State -->
        <div v-else class="mt-6 text-center py-12 bg-white shadow rounded-lg">
          <Calendar class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No events</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ activeTab === 'upcoming' ? "You don't have any upcoming events." : "You don't have any past events." }}
          </p>
        </div>
      </div>
  
      <!-- Cancel Event Modal -->
      <div v-if="showCancelModal" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <!-- Modal content -->
      </div>
    </div>
  </template>

<style scoped>
/* Add smooth transitions for hover states */
.hover\:bg-gray-50:hover {
  transition: background-color 150ms ease-in-out;
}

/* Ensure buttons have a nice hover effect */
button {
  transition: all 150ms ease-in-out;
}

/* Add subtle animation to the calendar icon in empty state */
.empty-state-icon {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>