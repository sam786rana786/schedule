<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import axios from '@/plugins/axios';
import { useProfileStore } from '@/stores/profile'

interface TimezoneOption {
  value: string;
  label: string;
}

const profileStore = useProfileStore()
const successMessage = ref('')
const companyLogoFile = ref<File | null>(null)
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)
const timezones = ref<TimezoneOption[]>([]);

// Create computed properties with default values
const profile = computed(() => {
  return {
    scheduling_url: profileStore.profile?.scheduling_url ?? '',
    bio: profileStore.profile?.bio ?? '',
    welcome_message: profileStore.profile?.welcome_message ?? '',
    phone: profileStore.profile?.phone ?? '',
    job_title: profileStore.profile?.job_title ?? '',
    full_name: profileStore.profile?.full_name ?? '',
    company: profileStore.profile?.company ?? '',
    time_zone: profileStore.profile?.time_zone ?? '',
    avatar_url: profileStore.profile?.avatar_url ?? '',
    company_logo: profileStore.profile?.company_logo ?? ''
  }
})

// Fetch available timezones
const fetchTimezones = async () => {
  try {
    const response = await axios.get('/api/profile/timezones');
    timezones.value = response.data;
  } catch (error) {
    console.error('Failed to fetch timezones:', error);
  }
};

const handleCompanyLogoChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    companyLogoFile.value = target.files[0]
  }
}

const handleAvatarChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    avatarFile.value = target.files[0]
    avatarPreview.value = URL.createObjectURL(target.files[0])
  }
}

const updateProfile = async () => {
  try {
    const formData = new FormData()
    
    // Create profile data object with all required fields
    const profileData = {
      scheduling_url: profile.value.scheduling_url || '',
      bio: profile.value.bio || '',
      welcome_message: profile.value.welcome_message || '',
      phone: profile.value.phone || '',
      job_title: profile.value.job_title || '',
      full_name: profile.value.full_name || '',
      company: profile.value.company || '',
      time_zone: profile.value.time_zone || 'UTC' // Provide default timezone
    }

    // Add profile data as JSON string
    formData.append('profile_data', JSON.stringify(profileData))

    // Add files if selected
    if (companyLogoFile.value) {
      formData.append('company_logo', companyLogoFile.value)
    }
    
    if (avatarFile.value) {
      formData.append('avatar', avatarFile.value)
    }

    // Log the form data for debugging
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value)
    }

    await profileStore.updateProfile(formData)
    successMessage.value = 'Profile updated successfully!'
    
    // Clear file inputs
    const companyLogoInput = document.getElementById('company_logo') as HTMLInputElement
    const avatarInput = document.getElementById('avatar') as HTMLInputElement
    if (companyLogoInput) companyLogoInput.value = ''
    if (avatarInput) avatarInput.value = ''
    
    // Clear preview
    if (avatarPreview.value) {
      URL.revokeObjectURL(avatarPreview.value)
      avatarPreview.value = null
    }
  } catch (err: any) {
    console.error('Profile update failed:', err)
    // Display error message to user
    if (err.response?.data?.detail) {
      successMessage.value = `Error: ${err.response.data.detail}`
    } else {
      successMessage.value = 'Error updating profile. Please try again.'
    }
  }
}

// Cleanup preview URL when component unmounts
onUnmounted(() => {
  if (avatarPreview.value) {
    URL.revokeObjectURL(avatarPreview.value)
  }
})

onMounted(async () => {
  await Promise.all([    
    profileStore.fetchProfile(),
    fetchTimezones()
  ]);
})
</script>

<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h2 class="text-xl font-semibold text-gray-900 mb-6">Profile Settings</h2>

    <!-- Alerts -->
    <div v-if="profileStore.error" class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
      {{ profileStore.error }}
    </div>

    <div v-if="successMessage" 
         class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
      {{ successMessage }}
    </div>

    <form @submit.prevent="updateProfile" class="space-y-6">
      <!-- Avatar Section -->
      <div>
        <label class="block text-sm font-medium text-gray-700">Profile Photo</label>
        <div class="mt-1 flex items-center space-x-5">
          <div class="flex-shrink-0">
            <div class="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100">
              <img
                v-if="avatarPreview || profile.avatar_url"
                :src="avatarPreview || `http://127.0.0.1:8000${profile.avatar_url}`"
                alt="Avatar Preview"
                class="h-full w-full object-cover"
              />
              <span v-else class="h-full w-full flex items-center justify-center text-gray-400">
                <svg class="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
            </div>
          </div>
          <div class="flex flex-col space-y-2">
            <label
              for="avatar"
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
            >
              Change Photo
              <input
                id="avatar"
                type="file"
                accept="image/*"
                @change="handleAvatarChange"
                class="sr-only"
              />
            </label>
            <p class="text-xs text-gray-500">
              JPG, PNG, GIF up to 2MB
            </p>
          </div>
        </div>
      </div>

      <!-- Other form fields -->
      <div>
        <label for="full_name" class="block text-sm font-medium text-gray-700">Full Name</label>
        <input
          id="full_name"
          v-model="profile.full_name"
          type="text"
          class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label for="job_title" class="block text-sm font-medium text-gray-700">Job Title</label>
        <input
          id="job_title"
          v-model="profile.job_title"
          type="text"
          class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label for="company" class="block text-sm font-medium text-gray-700">Company</label>
        <input
          id="company"
          v-model="profile.company"
          type="text"
          class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label for="bio" class="block text-sm font-medium text-gray-700">Bio</label>
        <textarea
          id="bio"
          v-model="profile.bio"
          rows="3"
          class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        ></textarea>
      </div>

      <div>
        <label for="company_logo" class="block text-sm font-medium text-gray-700">Company Logo</label>
        <div class="mt-1 flex items-center space-x-4">
          <img
            v-if="profile.company_logo"
            :src="`http://127.0.0.1:8000${profile.company_logo}`"
            alt="Company Logo"
            class="h-12 w-12 object-contain"
          />
          <input
            id="company_logo"
            type="file"
            accept="image/*"
            @change="handleCompanyLogoChange"
            class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
      <label for="timezone" class="block text-sm font-medium text-gray-700">Timezone</label>
      <select
        id="timezone"
        v-model="profile.time_zone"
        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
      >
        <option value="">Select a timezone</option>
        <option v-for="tz in timezones" :key="tz.value" :value="tz.value">
          {{ tz.label }}
        </option>
      </select>
    </div>

      <!-- Phone -->
      <div>
        <label for="phone" class="block text-sm font-medium text-gray-700">Phone</label>
        <input
          id="phone"
          v-model="profile.phone"
          type="tel"
          class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <!-- Welcome Message -->
      <div>
        <label for="welcome_message" class="block text-sm font-medium text-gray-700">Welcome Message</label>
        <textarea
          id="welcome_message"
          v-model="profile.welcome_message"
          rows="2"
          class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        ></textarea>
      </div>

      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="profileStore.isLoading"
          class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            v-if="profileStore.isLoading"
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {{ profileStore.isLoading ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </form>
  </div>
</template>