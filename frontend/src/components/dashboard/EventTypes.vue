<script setup lang="ts">
defineProps<{
  loading: boolean;
}>();
</script>

<template>
  <div class="space-y-4">
    <!-- Add your event types content here -->
    <p v-if="loading">Loading event types...</p>
  </div>
</template>