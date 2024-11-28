<script setup lang="ts">
import { onMounted } from 'vue';
import EventTypesList from '@/components/event-types/EventTypesList.vue';
import { useEventTypeStore } from '@/stores/eventType';

const eventTypeStore = useEventTypeStore();

onMounted(async () => {
  try {
    await eventTypeStore.fetchEventTypes();
  } catch (error) {
    console.error('Failed to fetch event types:', error);
  }
});
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
        <EventTypesList />
      </div>
    </div>
  </div>
</template>