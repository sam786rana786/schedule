<!-- src/components/event-types/EventTypesList.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useEventTypeStore } from '@/stores/eventType';
import { useNotificationStore } from '@/stores/notification';
import { Clock, Link, Copy, Trash, Edit, MoreVertical, ClipboardIcon } from 'lucide-vue-next';
import type { EventType } from '@/types/eventType';
import { Switch } from '@headlessui/vue';

defineProps<{
  eventTypes: Array<EventType>;
  isLoading: boolean;
}>();

const emit = defineEmits(['toggle', 'copy-url']);

const handleToggle = (id: number) => {
  emit('toggle', id);
};

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
  <div v-if="isLoading" class="flex justify-center py-8">
    <div class="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
  </div>
  
  <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <div v-for="eventType in eventTypes" 
         :key="eventType.id" 
         class="bg-white overflow-hidden shadow rounded-lg">
      <div class="p-6">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">
            {{ eventType.name }}
          </h3>
          <Switch
            :modelValue="eventType.is_active"
            @update:modelValue="() => handleToggle(eventType.id)"
            class="relative inline-flex h-6 w-11 items-center rounded-full"
            :class="[
              eventType.is_active ? 'bg-blue-600' : 'bg-gray-200',
              'transition-colors duration-200 ease-in-out'
            ]"
          >
            <span class="sr-only">Toggle active state</span>
            <span
              :class="[
                eventType.is_active ? 'translate-x-6' : 'translate-x-1',
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform'
              ]"
            />
          </Switch>
        </div>
        
        <div class="mt-2">
          <p class="text-sm text-gray-500">{{ eventType.duration }} minutes</p>
        </div>
        <div class="flex items-center space-x-4 mt-4">
          <button
            @click="$emit('copy-url', eventType.slug)"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ClipboardIcon class="h-4 w-4 mr-2" />
            Copy Link
          </button>
        </div>
      </div>
    </div>
  </div>
</template>