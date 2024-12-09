<script setup lang="ts">
import { useNotificationStore } from '@/stores/notification';
import { computed } from 'vue';
import { TransitionRoot } from '@headlessui/vue';
import { 
  XMarkIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon
} from '@heroicons/vue/24/outline';

const notificationStore = useNotificationStore();

const notification = computed(() => notificationStore.notification);

const icons = {
  success: CheckCircleIcon,
  error: ExclamationCircleIcon,
  warning: ExclamationCircleIcon,
  info: InformationCircleIcon
};

const colors = {
  success: 'bg-green-50 text-green-800',
  error: 'bg-red-50 text-red-800',
  warning: 'bg-yellow-50 text-yellow-800',
  info: 'bg-blue-50 text-blue-800'
};

const iconColors = {
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400'
};
</script>

<template>
  <TransitionRoot 
    appear
    as="div" 
    :show="!!notification"
    enter="transform ease-out duration-300 transition"
    enter-from="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to="translate-y-0 opacity-100 sm:translate-x-0"
    leave="transition ease-in duration-100"
    leave-from="opacity-100"
    leave-to="opacity-0"
  >
    <div 
      v-if="notification"
      class="fixed z-50 top-4 right-4 w-full max-w-sm overflow-hidden"
    >
      <div :class="[colors[notification.type], 'rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 p-4']">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <component 
              :is="icons[notification.type]"
              :class="[iconColors[notification.type], 'h-6 w-6']"
              aria-hidden="true"
            />
          </div>
          <div class="ml-3 w-0 flex-1 pt-0.5">
            <p class="text-sm font-medium">
              {{ notification.message }}
            </p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              class="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              @click="notificationStore.clearNotification"
            >
              <span class="sr-only">Close</span>
              <XMarkIcon class="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </TransitionRoot>
</template>