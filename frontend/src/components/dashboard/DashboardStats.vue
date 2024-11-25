<script setup lang="ts">
interface Stats {
  upcoming: number;
  completed: number;
  canceled: number;
  totalTime: number;
}

interface Props {
  stats: Stats;
  loading: boolean;
}

defineProps<Props>();
</script>

<template>
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
    <div v-for="(value, key) in stats" :key="key" class="bg-white overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-1">
            <div class="text-sm font-medium text-gray-500 truncate capitalize">
              {{ key }}
            </div>
            <div class="mt-1 text-3xl font-semibold text-gray-900">
              {{ value }}
              <span v-if="key === 'totalTime'" class="text-sm text-gray-500">hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>