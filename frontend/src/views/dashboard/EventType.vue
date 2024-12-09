<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useEventTypeStore } from '@/stores/eventType';
import { useNotificationStore } from '@/stores/notification';
import EventTypesList from '@/components/event-types/EventTypesList.vue';

const eventTypeStore = useEventTypeStore();
const notificationStore = useNotificationStore();

onMounted(async () => {
  try {
    await eventTypeStore.fetchEventTypes();
  } catch (error) {
    console.error('Failed to fetch event types:', error);
  }
});

const handleToggle = async (id: number) => {
  try {
    await eventTypeStore.toggleEventType(id);
    notificationStore.showNotification('success', 'Event type updated successfully');
  } catch (error) {
    notificationStore.showNotification('error', 'Failed to update event type');
  }
};
</script>

<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold text-gray-900">Event Types</h1>
        <RouterLink
          to="/dashboard/event-types/new"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Create New Event Type
        </RouterLink>
      </div>
    </div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div class="py-4">
        <EventTypesList 
          :event-types="eventTypeStore.eventTypes"
          :is-loading="eventTypeStore.isLoading"
          @toggle="handleToggle" 
        />
      </div>
    </div>
  </div>
</template>