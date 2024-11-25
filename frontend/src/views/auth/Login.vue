// src/components/navigation/DashboardNavbar.vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile'

const profileStore = useProfileStore()
const isProfileDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const router = useRouter()

const toggleDropdown = () => {
  isProfileDropdownOpen.value = !isProfileDropdownOpen.value
}

const closeDropdown = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isProfileDropdownOpen.value = false
  }
}

const handleNavigation = (path: string) => {
  router.push(path)
  isProfileDropdownOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
  router.afterEach(() => {
    isProfileDropdownOpen.value = false
  })
  profileStore.fetchProfile() // Fetch profile when navbar mounts
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<template>
  <nav class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center">
            <img v-if="profileStore.profile?.company_logo" 
                 :src="`http://127.0.0.1:8000${profileStore.profile.company_logo}`" 
                 class="h-8 w-auto"
                 alt="Company logo" />
            <img v-else 
                 src="@/assets/logo.svg" 
                 class="h-8 w-auto" 
                 alt="Default logo" />
          </div>
        </div>

        <!-- Profile Dropdown -->
        <div class="ml-3 relative" ref="dropdownRef">
          <button @click="toggleDropdown"
            class="flex items-center max-w-xs bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <span class="sr-only">Open user menu</span>
            <img class="h-8 w-8 rounded-full"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="" />
          </button>

          <div v-if="isProfileDropdownOpen"
            class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100">
            <div class="py-1">
              <a @click="handleNavigation('/dashboard')"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                Dashboard
              </a>
              <a @click="handleNavigation('/profile')"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                Profile Settings
              </a>
            </div>
            <div class="py-1">
              <a @click="handleNavigation('/logout')"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                Sign out
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>