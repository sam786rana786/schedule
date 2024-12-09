<script setup lang="ts">
defineProps<{
  loading: boolean;
}>();
</script>

<template>
  <div class="space-y-4">
    <!-- Add your upcoming meetings content here -->
    <p v-if="loading">Loading meetings...</p>
  </div>
</template>