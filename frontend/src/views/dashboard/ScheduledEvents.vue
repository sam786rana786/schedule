<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useScheduledEventsStore } from '@/stores/scheduledEvents';
import { useNotificationStore } from '@/stores/notification';
import { Trash } from 'lucide-vue-next';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot
} from '@headlessui/vue';

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

const scheduledEventsStore = useScheduledEventsStore();
const notificationStore = useNotificationStore();

// State
const activeTab = ref<'upcoming' | 'past' | 'today'>('upcoming');
const currentPage = ref(1);
const searchQuery = ref('');

// Add new refs for cancel modal
const showCancelModal = ref(false);
const selectedEvent = ref<Event | null>(null);
const cancelReason = ref('');

// Computed properties for sections
const tabs = [
  { id: 'upcoming', label: 'Upcoming Events' },
  { id: 'today', label: 'Today\'s Events' },
  { id: 'past', label: 'Past Events' }
] as const;

// Methods
const handleTabChange = async (tab: 'upcoming' | 'past' | 'today') => {
  activeTab.value = tab;
  currentPage.value = 1; // Reset to first page on tab change
  await fetchEvents();
};

const formatEventTime = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    time: date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  };
};

const fetchEvents = async () => {
  await scheduledEventsStore.fetchEvents({
    status: activeTab.value,
    page: currentPage.value,
    q: searchQuery.value || undefined
  });
};

// Handle pagination
const handlePageChange = async (newPage: number) => {
  currentPage.value = newPage;
  await fetchEvents();
};

// Handle search
const handleSearch = async () => {
  currentPage.value = 1; // Reset to first page when searching
  await fetchEvents();
};

// Add cancel event handler
const handleCancelEvent = async () => {
  if (!selectedEvent.value || !cancelReason.value) return;

  try {
    await scheduledEventsStore.cancelEvent(
      selectedEvent.value.id,
      cancelReason.value
    );
    
    notificationStore.showNotification('success', 'Event cancelled successfully');
    showCancelModal.value = false;
    cancelReason.value = '';
    selectedEvent.value = null;
    
    // Refresh events list
    await fetchEvents();
  } catch (error) {
    console.error('Failed to cancel event:', error);
    notificationStore.showNotification('error', 'Failed to cancel event');
  }
};

// Watch for tab changes
watch([activeTab, currentPage], () => {
  fetchEvents();
});

onMounted(fetchEvents);
</script>

<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-2xl font-semibold text-gray-900">Scheduled Events</h1>

      <!-- Search Bar -->
      <div class="mt-4">
        <div class="max-w-md">
          <div class="relative">
            <input v-model="searchQuery" @input="handleSearch" type="text"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search events..." />
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center">
              <!-- Search Icon -->
              <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clip-rule="evenodd" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mt-4 border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button v-for="tab in tabs" :key="tab.id" @click="handleTabChange(tab.id)" :class="[
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm'
          ]">
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Loading State -->
      <div v-if="scheduledEventsStore.isLoading" class="mt-6 text-center">
        <div class="inline-flex items-center px-4 py-2">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          Loading events...
        </div>
      </div>

      <!-- Events List -->
      <div v-else-if="scheduledEventsStore.events.items.length > 0" class="mt-6">
        <ul role="list" class="divide-y divide-gray-200">
          <li v-for="event in scheduledEventsStore.events.items" :key="event.id" class="py-4">
            <div class="flex items-center space-x-4">
              <div class="flex-1">
                <h3 class="text-sm font-medium text-gray-900">{{ event.title }}</h3>
                <div class="mt-1 text-sm text-gray-500">
                  <div>{{ formatEventTime(event.start_time).date }}</div>
                  <div>{{ formatEventTime(event.start_time).time }} - {{ formatEventTime(event.end_time).time }}</div>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                <div>{{ event.attendee_name }}</div>
                <div>{{ event.attendee_email }}</div>
                <div>{{ event.attendee_phone }}</div>
              </div>
              <!-- Cancel Button -->
              <button @click="selectedEvent = event; showCancelModal = true"
                class="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50" title="Cancel Event">
                <Trash class="h-5 w-5" />
              </button>
            </div>
          </li>
        </ul>

        <!-- Pagination -->
        <div class="mt-4 flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <button @click="handlePageChange(currentPage - 1)" :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button @click="handlePageChange(currentPage + 1)"
              :disabled="currentPage === scheduledEventsStore.events.pages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="mt-6 text-center">
        <p class="text-gray-500">No events found</p>
      </div>
    </div>
  </div>

  <!-- Cancel Modal -->
  <TransitionRoot appear :show="showCancelModal" as="template">
    <Dialog as="div" @close="showCancelModal = false" class="relative z-50">
      <div class="fixed inset-0 bg-black/30" />

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <DialogTitle as="h3" class="text-lg font-medium text-gray-900">
              Cancel Event
            </DialogTitle>

            <div class="mt-4">
              <p class="text-sm text-gray-500">
                Are you sure you want to cancel this event? This will notify the attendee.
              </p>

              <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700">
                  Reason for cancellation
                </label>
                <textarea v-model="cancelReason" rows="3"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Please provide a reason for cancellation..." />
              </div>
            </div>

            <div class="mt-6 flex justify-end space-x-3">
              <button @click="showCancelModal = false"
                class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button @click="handleCancelEvent" :disabled="!cancelReason || !selectedEvent"
                class="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                Confirm Cancellation
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>