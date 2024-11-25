<script setup lang="ts">
import MainNavbar from '@/components/navigation/MainNavbar.vue';
import MainFooter from '@/components/navigation/MainFooter.vue';
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <MainNavbar />
    <main class="flex-grow">
      <slot />
    </main>
    <MainFooter />
  </div>
</template>