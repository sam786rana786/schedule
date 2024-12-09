<!-- components/event-types/EventTypeTabs.vue -->
<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  tabs: Array<{ id: string, name: string }>;
  currentTab: string;
}>();

const emit = defineEmits(['tab-change']);

const handleTabChange = (tabId: string) => {
  emit('tab-change', tabId);
};
</script>

<template>
  <div class="border-b border-gray-200">
    <nav class="-mb-px flex" aria-label="Tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="handleTabChange(tab.id)"
        :class="[
          currentTab === tab.id
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          'w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm'
        ]"
      >
        {{ tab.name }}
      </button>
    </nav>
  </div>
</template>