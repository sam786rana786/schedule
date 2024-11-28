<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, RouterView } from 'vue-router';
import MainLayout from './layouts/MainLayout.vue';
import DashboardLayout from './layouts/DashboardLayout.vue';
import Notification from './components/common/Notification.vue';

const route = useRoute();

const isDashboard = computed(() => {
  const isAuthenticated = !!localStorage.getItem('token');
  const isDashboardRoute = route.path.startsWith('/dashboard');
  
  // Only show dashboard layout if both conditions are true
  return isAuthenticated && isDashboardRoute;
});

const isAuthRoute = computed(() => {
  return ['/login', '/signup', '/forgot-password'].includes(route.path);
});

</script>

<template>
  <Notification />
  <template v-if="isDashboard">
    <DashboardLayout>
      <RouterView />
    </DashboardLayout>
  </template>
  
  <template v-else>
    <MainLayout>
      <RouterView />
    </MainLayout>
  </template>
</template>