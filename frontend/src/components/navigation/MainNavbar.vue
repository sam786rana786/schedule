<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

const isMenuOpen = ref(false);
</script>

<template>
  <nav class="bg-white border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <RouterLink to="/" class="flex-shrink-0">
            <img class="h-8 w-auto" src="@/assets/logo.png" alt="Schedule" />
          </RouterLink>
          <div class="hidden md:ml-6 md:flex md:space-x-8">
            <RouterLink to="/features" class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900">
              Features
            </RouterLink>
            <RouterLink to="/solutions"
              class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
              Solutions
            </RouterLink>
            <RouterLink to="/pricing"
              class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
              Pricing
            </RouterLink>
          </div>
        </div>
        <div class="hidden md:ml-6 md:flex md:items-center">
          <RouterLink to="/login" class="text-sm font-medium text-gray-500 hover:text-gray-900 px-4">
            Sign In
          </RouterLink>
          <RouterLink to="/signup"
            class="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            Sign Up
          </RouterLink>
        </div>
        <!-- Mobile menu button -->
        <div class="flex items-center md:hidden">
          <button @click="isMenuOpen = !isMenuOpen"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
            <span class="sr-only">Open main menu</span>
            <!-- Icon when menu is closed -->
            <svg v-if="!isMenuOpen" class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <!-- Icon when menu is open -->
            <svg v-else class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <!-- Mobile menu -->
    <div v-if="isMenuOpen" class="md:hidden">
      <div class="pt-2 pb-3 space-y-1">
        <RouterLink to="/features"
          class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
          Features
        </RouterLink>
        <RouterLink to="/solutions"
          class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
          Solutions
        </RouterLink>
        <RouterLink to="/pricing"
          class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
          Pricing
        </RouterLink>
      </div>
      <div class="pt-4 pb-3 border-t border-gray-200">
        <div class="space-y-1">
          <RouterLink to="/login"
            class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
            Sign In
          </RouterLink>
          <RouterLink to="/signup"
            class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
            Sign Up
          </RouterLink>
        </div>
      </div>
    </div>
  </nav>
</template>