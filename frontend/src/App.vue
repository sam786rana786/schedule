<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, RouterView } from 'vue-router';
import MainLayout from './layouts/MainLayout.vue';
import DashboardLayout from './layouts/DashboardLayout.vue';

const route = useRoute();
const isDashboard = computed(() => route.path.startsWith('/dashboard'));
</script>

<template>
  <MainLayout v-if="!isDashboard">
    <RouterView />
  </MainLayout>
  <DashboardLayout v-else>
    <RouterView />
  </DashboardLayout>
</template>