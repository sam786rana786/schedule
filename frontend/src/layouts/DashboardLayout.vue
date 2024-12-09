<script setup lang="ts">
import DashboardNavbar from '@/components/navigation/DashboardNavbar.vue';
import DashboardSidebar from '@/components/navigation/DashboardSidebar.vue';
</script>

<template>
  <div class="min-h-screen flex">
    <DashboardSidebar />
    <div class="flex-1 flex flex-col">
      <DashboardNavbar />
      <main class="flex-1 bg-gray-50 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>