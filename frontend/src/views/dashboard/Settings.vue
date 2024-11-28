<!-- src/views/dashboard/Settings.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from '@/plugins/axios'

interface EmailSettings {
  smtp_server: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
}

interface SMSSettings {
  provider: 'twilio' | 'custom' | null;
  account_sid?: string;
  auth_token?: string;
  from_number?: string;
  api_key?: string;
  api_url?: string;
}

interface Settings {
  working_hours: Record<string, any>;
  notification_settings: Record<string, any>;
  email_settings: EmailSettings;
  sms_settings: SMSSettings;
}

const activeTab = ref('general')
const settings = ref<Settings>({
  working_hours: {
    monday: { start: '09:00', end: '17:00', enabled: true },
    tuesday: { start: '09:00', end: '17:00', enabled: true },
    wednesday: { start: '09:00', end: '17:00', enabled: true },
    thursday: { start: '09:00', end: '17:00', enabled: true },
    friday: { start: '09:00', end: '17:00', enabled: true },
    saturday: { start: '09:00', end: '17:00', enabled: false },
    sunday: { start: '09:00', end: '17:00', enabled: false }
  },
  notification_settings: {
    email: {
      enabled: false,
      newBooking: true,
      canceledBooking: true,
      reminders: true
    },
    sms: {
      enabled: false,
      provider: null,
      usePayAsYouGo: false
    }
  },
  email_settings: {
    smtp_server: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    from_email: '',
    from_name: ''
  },
  sms_settings: {
    provider: null,
    account_sid: '',
    auth_token: '',
    from_number: '',
    api_key: '',
    api_url: ''
  }
})

const isLoading = ref(false)
const error = ref('')
const successMessage = ref('')
const testEmail = ref('')
const testPhone = ref('')
const isSendingTestEmail = ref(false)
const isSendingTestSMS = ref(false)

const fetchSettings = async () => {
  try {
    isLoading.value = true
    const response = await axios.get('/api/settings')
    settings.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Error loading settings'
  } finally {
    isLoading.value = false
  }
}

const saveSettings = async () => {
  try {
    isLoading.value = true
    await axios.put('/api/settings', settings.value)
    successMessage.value = 'Settings saved successfully'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Error saving settings'
  } finally {
    isLoading.value = false
  }
}

const sendTestEmail = async () => {
  try {
    isSendingTestEmail.value = true
    await axios.post('/api/test-email', { email: testEmail.value })
    successMessage.value = 'Test email sent successfully'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Error sending test email'
  } finally {
    isSendingTestEmail.value = false
  }
}

const sendTestSMS = async () => {
  try {
    isSendingTestSMS.value = true
    await axios.post('/api/test-sms', { phone: testPhone.value })
    successMessage.value = 'Test SMS sent successfully'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Error sending test SMS'
  } finally {
    isSendingTestSMS.value = false
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-2xl font-semibold text-gray-900">Settings</h1>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <!-- Success Message -->
      <div v-if="successMessage"
        class="mt-4 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative">
        {{ successMessage }}
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mt-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {{ error }}
      </div>

      <!-- Tabs -->
      <div class="mt-6">
        <div class="sm:hidden">
          <select v-model="activeTab"
            class="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm">
            <option value="general">General</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>
        </div>
        <div class="hidden sm:block">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8" aria-label="Tabs">
              <button @click="activeTab = 'general'"
                :class="[activeTab === 'general' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']">
                General
              </button>
              <button @click="activeTab = 'email'"
                :class="[activeTab === 'email' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']">
                Email
              </button>
              <button @click="activeTab = 'sms'"
                :class="[activeTab === 'sms' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']">
                SMS
              </button>
            </nav>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="mt-6">
          <!-- General Settings Tab -->
          <div v-if="activeTab === 'general'">
            <form @submit.prevent="saveSettings" class="space-y-8 divide-y divide-gray-200">
              <!-- Working Hours -->
              <div class="space-y-6">
                <h3 class="text-lg font-medium text-gray-900">Working Hours</h3>
                <div class="space-y-4">
                  <div v-for="(hours, day) in settings.working_hours" :key="day"
                    class="flex items-center justify-between">
                    <div class="flex items-center">
                      <input :id="day" v-model="hours.enabled" type="checkbox"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                      <label :for="day" class="ml-2 text-sm font-medium text-gray-700 capitalize">
                        {{ day }}
                      </label>
                    </div>
                    <div class="flex space-x-4">
                      <input v-model="hours.start" type="time"
                        class="shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md" />
                      <span class="text-gray-500">to</span>
                      <input v-model="hours.end" type="time"
                        class="shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Notification Settings -->
              <div class="pt-8 space-y-6">
                <h3 class="text-lg font-medium text-gray-900">Notifications</h3>
                
                <!-- Email Notifications -->
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">Email Notifications</h4>
                      <p class="text-sm text-gray-500">Receive updates via email</p>
                    </div>
                    <input v-model="settings.notification_settings.email.enabled" type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  </div>
                  
                  <div class="ml-4 space-y-2" v-if="settings.notification_settings.email.enabled">
                    <div class="flex items-center">
                      <input id="newBooking" v-model="settings.notification_settings.email.newBooking" type="checkbox"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                      <label for="newBooking" class="ml-2 text-sm text-gray-700">New bookings</label>
                    </div>
                    <div class="flex items-center">
                      <input id="canceledBooking" v-model="settings.notification_settings.email.canceledBooking"
                        type="checkbox" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                      <label for="canceledBooking" class="ml-2 text-sm text-gray-700">Canceled bookings</label>
                    </div>
                    <div class="flex items-center">
                      <input id="reminders" v-model="settings.notification_settings.email.reminders" type="checkbox"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                      <label for="reminders" class="ml-2 text-sm text-gray-700">Reminders</label>
                    </div>
                  </div>
                </div>

                <!-- SMS Notifications -->
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">SMS Notifications</h4>
                      <p class="text-sm text-gray-500">Receive updates via SMS</p>
                    </div>
                    <input v-model="settings.notification_settings.sms.enabled" type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  </div>
                </div>
              </div>

              <div class="pt-8">
                <div class="flex justify-end">
                  <button type="submit"
                    class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Save Settings
                  </button>
                </div>
              </div>
            </form>
          </div>

          <!-- Email Settings Tab -->
          <div v-if="activeTab === 'email'">
            <form @submit.prevent="saveSettings" class="space-y-6">
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-3">
                  <label for="smtp_server" class="block text-sm font-medium text-gray-700">SMTP Server</label>
                  <div class="mt-1">
                    <input type="text" id="smtp_server" v-model="settings.email_settings.smtp_server"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="smtp.gmail.com" />
                  </div>
                </div>

                <div class="sm:col-span-3">
                  <label for="smtp_port" class="block text-sm font-medium text-gray-700">SMTP Port</label>
                  <div class="mt-1">
                    <input type="number" id="smtp_port" v-model="settings.email_settings.smtp_port"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="587" />
                  </div>
                </div>

                <div class="sm:col-span-3">
                  <label for="smtp_username" class="block text-sm font-medium text-gray-700">SMTP Username</label>
                  <div class="mt-1">
                    <input type="text" id="smtp_username" v-model="settings.email_settings.smtp_username"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="your@email.com" />
                  </div>
                </div>

                <div class="sm:col-span-3">
                  <label for="smtp_password" class="block text-sm font-medium text-gray-700">SMTP Password</label>
                  <div class="mt-1">
                    <input type="password" id="smtp_password" v-model="settings.email_settings.smtp_password"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                  </div>
                </div>

                <div class="sm:col-span-3">
                  <label for="from_email" class="block text-sm font-medium text-gray-700">From Email</label>
                  <div class="mt-1">
                    <input type="email" id="from_email" v-model="settings.email_settings.from_email"
                    class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="noreply@yourcompany.com" />
                  </div>
                </div>

                <div class="sm:col-span-3">
                  <label for="from_name" class="block text-sm font-medium text-gray-700">From Name</label>
                  <div class="mt-1">
                    <input type="text" id="from_name" v-model="settings.email_settings.from_name"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Your Company Name" />
                  </div>
                </div>
              </div>

              <div class="pt-5 border-t border-gray-200">
                <div class="flex justify-end">
                  <button type="submit"
                    class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Save Email Settings
                  </button>
                </div>
              </div>
            </form>

            <!-- Test Email Section -->
            <div class="mt-10 pt-10 border-t border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Test Email Configuration</h3>
              <div class="mt-4">
                <form @submit.prevent="sendTestEmail" class="sm:flex sm:items-center">
                  <div class="w-full sm:max-w-xs">
                    <label for="test-email" class="sr-only">Test email address</label>
                    <input type="email" id="test-email" v-model="testEmail"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter email address" />
                  </div>
                  <button type="submit"
                    :disabled="isSendingTestEmail"
                    class="mt-3 sm:mt-0 sm:ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <svg v-if="isSendingTestEmail" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                      </path>
                    </svg>
                    {{ isSendingTestEmail ? 'Sending...' : 'Send Test Email' }}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <!-- SMS Settings Tab -->
          <div v-if="activeTab === 'sms'">
            <form @submit.prevent="saveSettings" class="space-y-6">
              <div>
                <label for="sms-provider" class="block text-sm font-medium text-gray-700">SMS Provider</label>
                <select id="sms-provider" v-model="settings.sms_settings.provider"
                  class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                  <option value="twilio">Twilio</option>
                  <option value="custom">Custom API</option>
                </select>
              </div>

              <div v-if="settings.sms_settings.provider === 'twilio'" class="space-y-6">
                <div>
                  <label for="account-sid" class="block text-sm font-medium text-gray-700">Account SID</label>
                  <input type="text" id="account-sid" v-model="settings.sms_settings.account_sid"
                    class="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                </div>

                <div>
                  <label for="auth-token" class="block text-sm font-medium text-gray-700">Auth Token</label>
                  <input type="password" id="auth-token" v-model="settings.sms_settings.auth_token"
                    class="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                </div>

                <div>
                  <label for="from-number" class="block text-sm font-medium text-gray-700">From Number</label>
                  <input type="text" id="from-number" v-model="settings.sms_settings.from_number"
                    class="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                </div>
              </div>

              <div v-if="settings.sms_settings.provider === 'custom'" class="space-y-6">
                <div>
                  <label for="api-url" class="block text-sm font-medium text-gray-700">API URL</label>
                  <input type="url" id="api-url" v-model="settings.sms_settings.api_url"
                    class="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                </div>

                <div>
                  <label for="api-key" class="block text-sm font-medium text-gray-700">API Key</label>
                  <input type="password" id="api-key" v-model="settings.sms_settings.api_key"
                    class="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                </div>
              </div>

              <div class="pt-5">
                <div class="flex justify-end">
                  <button type="submit"
                    class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Save SMS Settings
                  </button>
                </div>
              </div>
            </form>

            <!-- Test SMS Section -->
            <div class="mt-10 pt-10 border-t border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Test SMS Configuration</h3>
              <div class="mt-4">
                <form @submit.prevent="sendTestSMS" class="sm:flex sm:items-center">
                  <div class="w-full sm:max-w-xs">
                    <label for="test-phone" class="sr-only">Test phone number</label>
                    <input type="tel" id="test-phone" v-model="testPhone"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter phone number" />
                  </div>
                  <button type="submit"
                    :disabled="isSendingTestSMS"
                    class="mt-3 sm:mt-0 sm:ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <svg v-if="isSendingTestSMS" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                      </path>
                    </svg>
                    {{ isSendingTestSMS ? 'Sending...' : 'Send Test SMS' }}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>