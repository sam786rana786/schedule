<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProfileStore } from '@/stores/profile';

interface NavItem {
  name: string;
  path: string;
  icon: string;
}
const profileStore = useProfileStore();
const route = useRoute();
const router = useRouter();

const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
  },
  {
    name: 'Calendar',
    path: '/dashboard/calendar',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
  },
  {
    name: 'Event Types',
    path: '/dashboard/event-types',
    icon: 'M4 6h16M4 10h16M4 14h16M4 18h16'
  },
  {
    name: 'Scheduled Events',
    path: '/dashboard/scheduled',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
  },
];

const isCurrentRoute = computed(() => (path: string) => route.path === path);
</script>

<template>
  <div class="hidden md:flex md:w-64 md:flex-col">
    <div class="flex flex-col flex-grow border-r border-gray-200 pt-5 bg-white overflow-y-auto">
      <div class="flex items-center flex-shrink-0 px-4">
        <img v-if="profileStore.profile?.company_logo" class="h-8 w-auto" :src="`http://127.0.0.1:8000${profileStore.profile.company_logo}`" alt="Schedule">
        <img v-else class="h-8 w-auto" src="@/assets/logo.png" alt="Schedule">
      </div>
      <div class="mt-5 flex-grow flex flex-col">
        <nav class="flex-1 px-2 bg-white space-y-1">
          <button v-for="item in navigationItems" :key="item.name" @click="router.push(item.path)"
            :class="[
              isCurrentRoute(item.path)
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'group w-full flex items-center px-2 py-2 text-sm font-medium rounded-md'
            ]">
            <svg :class="[
              isCurrentRoute(item.path) ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
              'mr-3 flex-shrink-0 h-6 w-6'
            ]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
            </svg>
            {{ item.name }}
          </button>
        </nav>
      </div>
      <!-- Footer section -->
      <div class="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div class="flex items-center">
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              Free Plan
            </p>
            <RouterLink to="/pricing"
              class="text-xs font-medium text-gray-500 group-hover:text-gray-700">
              Upgrade
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>