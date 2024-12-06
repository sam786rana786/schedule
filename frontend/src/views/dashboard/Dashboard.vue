<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DashboardStats from '@/components/dashboard/DashboardStats.vue';
import UpcomingMeetings from '@/components/dashboard/UpcomingMeetings.vue';
import EventTypes from '@/components/dashboard/EventTypes.vue';
import axios from 'axios';

interface Stats {
  upcoming: number;    // was todayUpcoming
  completed: number;   // was pastEvents 
  canceled: number;    // was nextDayEvents
  totalTime: number;   // was totalTimeToday
}

interface Event {
  startTime: string;
  endTime: string;
  duration: number;
}

interface EventType {
  id: number;
  name: string;
  duration: number;
  color?: string;
}

const isLoading = ref(true);
const stats = ref<Stats>({
  upcoming: 0,
  completed: 0,
  canceled: 0,
  totalTime: 0
});

const eventTypes = ref<EventType[]>([]);

const getTodayDateRange = () => {
  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const endOfDay = new Date(now.setHours(23, 59, 59, 999));
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return {
    now: new Date(),
    startOfDay,
    endOfDay,
    tomorrow
  };
};

const fetchEventTypes = async () => {
  try {
    const response = await axios.get('/api/event-types');
    eventTypes.value = response.data;
  } catch (error) {
    console.error('Error fetching event types:', error);
  }
};

onMounted(async () => {
  try {
    await Promise.all([
      fetchEventTypes(),
      (async () => {
        const { now, startOfDay, endOfDay, tomorrow } = getTodayDateRange();
        
        const response = await axios.get('/api/events', {
          params: {
            startDate: startOfDay.toISOString(),
            endDate: tomorrow.toISOString()
          }
        });
    
        const events: Event[] = response.data;
        
        stats.value = {
          upcoming: events.filter(event => 
            new Date(event.startTime) >= now && 
            new Date(event.startTime) <= endOfDay
          ).length,
          
          completed: events.filter(event => 
            new Date(event.startTime) >= startOfDay && 
            new Date(event.startTime) < now
          ).length,
          
          canceled: events.filter(event => 
            new Date(event.startTime) >= endOfDay && 
            new Date(event.startTime) < tomorrow
          ).length,
          
          totalTime: events
            .filter(event => 
              new Date(event.startTime) >= startOfDay && 
              new Date(event.startTime) <= endOfDay
            )
            .reduce((total, event) => total + event.duration, 0)
        };
      })()
    ]);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
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
            <EventTypes :event-types="eventTypes" :loading="isLoading" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>