// src/components/navigation/DashboardNavbar.vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import type { Menu } from 'lucide-vue-next'; // You might need to install lucide-vue-next
import { useProfileStore } from '@/stores/profile';

interface UserDropdownItem {
  label: string;
  action: () => void;
}

const profileStore = useProfileStore();
const router = useRouter();
const isProfileMenuOpen = ref(false);
const searchQuery = ref('');
const dropdownRef = ref<HTMLElement | null>(null)

const toggleDropdown = () => {
  isProfileMenuOpen.value = !isProfileMenuOpen.value
}

const closeDropdown = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isProfileMenuOpen.value = false
  }
}

const handleLogout = () => {
  localStorage.removeItem('token');
  router.push('/login');
};

const userDropdownItems: UserDropdownItem[] = [
  {
    label: 'Your Profile',
    action: () => router.push('/dashboard/profile')
  },
  {
    label: 'Settings',
    action: () => router.push('/dashboard/settings')
  },
  {
    label: 'Sign out',
    action: handleLogout
  }
];

onMounted(() => {
  document.addEventListener('click', closeDropdown)
  router.afterEach(() => {
    isProfileMenuOpen.value = false
  })
  profileStore.fetchProfile() // Fetch profile when navbar mounts
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<template>
  <nav class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Left section -->
        <div class="flex">
          <!-- Search input -->
          <div class="flex-1 flex items-center pl-2 md:ml-6">
            <!-- <div class="max-w-lg w-full lg:max-w-xs">
              <label for="search" class="sr-only">Search</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                    fill="currentColor">
                    <path fill-rule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clip-rule="evenodd" />
                  </svg>
                </div>
                <input v-model="searchQuery" id="search"
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search" type="search">
              </div>
            </div> -->
          </div>
        </div>

        <!-- Right section -->
        <div class="flex items-center">
          <!-- Notifications -->
          <button
            class="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <span class="sr-only">View notifications</span>
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          <!-- Profile dropdown -->
          <div class="ml-3 relative" ref="dropdownRef">
            <div>
              <button @click="toggleDropdown" type="button"
                class="max-w-xs bg-white rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                id="user-menu-button">
                <span class="sr-only">Open user menu</span>
                <img v-if="profileStore.profile?.company_logo" class="h-8 w-8 rounded-full"
                  :src="`http://127.0.0.1:8000${profileStore.profile.avatar_url}`"
                  alt="">
                <img v-else class="h-8 w-8 rounded-full"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="">
              </button>
            </div>

            <div v-if="isProfileMenuOpen"
              class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
              role="menu">
              <button v-for="item in userDropdownItems" :key="item.label" @click="item.action"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                {{ item.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>