<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DashboardStats from '@/components/dashboard/DashboardStats.vue';
import UpcomingMeetings from '@/components/dashboard/UpcomingMeetings.vue';
import EventTypes from '@/components/dashboard/EventTypes.vue';

interface Stats {
  upcoming: number;
  completed: number;
  canceled: number;
  totalTime: number;
}

const isLoading = ref(true);
const stats = ref<Stats>({
  upcoming: 0,
  completed: 0,
  canceled: 0,
  totalTime: 0
});

onMounted(async () => {
  try {
    // Fetch dashboard data
    // const response = await axios.get('/api/dashboard/stats');
    // stats.value = response.data;
    // Mock data for now
    stats.value = {
      upcoming: 5,
      completed: 12,
      canceled: 1,
      totalTime: 18
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
    </div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <!-- Stats Cards -->
      <div class="mt-8">
        <DashboardStats :stats="stats" :loading="isLoading" />
      </div>

      <!-- Main Content -->
      <div class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <!-- Upcoming Meetings -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-6">
            <h2 class="text-lg font-medium text-gray-900">Upcoming Meetings</h2>
            <UpcomingMeetings :loading="isLoading" />
          </div>
        </div>

        <!-- Event Types -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-6">
            <h2 class="text-lg font-medium text-gray-900">Event Types</h2>
            <EventTypes :loading="isLoading" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>