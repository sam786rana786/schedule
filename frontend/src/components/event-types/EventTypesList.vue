<!-- src/components/event-types/EventTypesList.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useEventTypeStore } from '@/stores/eventType';
import { useNotificationStore } from '@/stores/notification';
import { Clock, Link, Copy, Trash, Edit, MoreVertical } from 'lucide-vue-next';
import type { EventType } from '@/types/eventType';

const router = useRouter();
const eventTypeStore = useEventTypeStore();
const notificationStore = useNotificationStore();
const showDeleteModal = ref(false);
const selectedEventType = ref<EventType | null>(null);

onMounted(async () => {
  try {
    await eventTypeStore.fetchEventTypes();
  } catch (error) {
    console.error('Failed to fetch event types:', error);
  }
});

const handleEdit = (eventType: EventType) => {
  router.push(`/dashboard/event-types/${eventType.id}/edit`);
};

const handleDelete = async () => {
  if (!selectedEventType.value) return;
  
  try {
    await eventTypeStore.deleteEventType(selectedEventType.value.id);
    notificationStore.showNotification('success', 'Event type deleted successfully');
    showDeleteModal.value = false;
    selectedEventType.value = null;
  } catch (error) {
    notificationStore.showNotification('error', 'Failed to delete event type');
  }
};

const copyLink = async (slug: string) => {
  const link = `${window.location.origin}/schedule/${slug}`;
  try {
    await navigator.clipboard.writeText(link);
    notificationStore.showNotification('success', 'Link copied to clipboard');
  } catch (error) {
    notificationStore.showNotification('error', 'Failed to copy link');
  }
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};
</script>

<template>
  <div class="bg-white shadow rounded-lg">
    <!-- Header -->
    <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
      <div>
        <h3 class="text-lg font-medium text-gray-900">Event Types</h3>
        <p class="mt-1 text-sm text-gray-500">Manage your scheduling event types</p>
      </div>
      <RouterLink 
        to="/dashboard/event-types/new"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
      >
        New Event Type
      </RouterLink>
    </div>

    <!-- Loading State -->
    <div v-if="eventTypeStore.isLoading" class="p-8 text-center">
      <div class="inline-flex items-center">
        <svg class="animate-spin h-5 w-5 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading event types...
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!eventTypeStore.eventTypes.length" class="p-8 text-center">
      <div class="text-gray-500">
        <p class="mt-1">You haven't created any event types yet.</p>
        <RouterLink 
          to="/dashboard/event-types/new"
          class="inline-flex items-center px-4 py-2 mt-4 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
        >
          Create your first event type
        </RouterLink>
      </div>
    </div>

    <!-- Event Types List -->
    <div v-else class="divide-y divide-gray-200">
      <div v-for="eventType in eventTypeStore.eventTypes" :key="eventType.id" 
        class="px-4 py-4 sm:px-6 hover:bg-gray-50 flex items-center justify-between"
      >
        <!-- Event Type Info -->
        <div class="flex items-center space-x-4">
          <div class="h-10 w-10 rounded-lg flex items-center justify-center" :style="{ backgroundColor: eventType.color }">
            <Clock class="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 class="text-sm font-medium text-gray-900">{{ eventType.name }}</h4>
            <div class="flex items-center space-x-2 mt-1">
              <span class="text-sm text-gray-500">{{ formatDuration(eventType.duration) }}</span>
              <span v-if="!eventType.is_active" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                Inactive
              </span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center space-x-2">
          <button 
            @click="copyLink(eventType.slug)"
            class="p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
            title="Copy link"
          >
            <Copy class="h-5 w-5" />
          </button>
          <button 
            @click="handleEdit(eventType)"
            class="p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
            title="Edit"
          >
            <Edit class="h-5 w-5" />
          </button>
          <button 
            @click="selectedEventType = eventType; showDeleteModal = true"
            class="p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
            title="Delete"
          >
            <Trash class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div class="mt-3 text-center sm:mt-5">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Delete Event Type
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  Are you sure you want to delete "{{ selectedEventType?.name }}"? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              @click="handleDelete"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
            >
              Delete
            </button>
            <button
              @click="showDeleteModal = false; selectedEventType = null"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>