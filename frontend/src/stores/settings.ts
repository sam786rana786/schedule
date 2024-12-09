import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '@/plugins/axios'

interface WorkingHours {
  start: string
  end: string
  enabled: boolean
}

interface WeeklySchedule {
  monday: WorkingHours
  tuesday: WorkingHours
  wednesday: WorkingHours
  thursday: WorkingHours
  friday: WorkingHours
  saturday: WorkingHours
  sunday: WorkingHours
}

interface EmailSettings {
  smtp_server: string
  smtp_port: number
  smtp_username: string
  smtp_password: string
  from_email: string
  from_name: string
}

interface SMSSettings {
  provider: 'twilio' | 'google' | 'custom'
  account_sid?: string
  auth_token?: string
  from_number?: string
  api_key?: string
  api_url?: string
  project_id?: string
  credentials?: string
}

interface NotificationSettings {
  email: {
    enabled: boolean
    newBooking: boolean
    canceledBooking: boolean
    reminders: boolean
  }
  sms: {
    enabled: boolean
    provider: string | null
    usePayAsYouGo: boolean
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const workingHours = ref<WeeklySchedule>({
    monday: { start: '09:00', end: '17:00', enabled: true },
    tuesday: { start: '09:00', end: '17:00', enabled: true },
    wednesday: { start: '09:00', end: '17:00', enabled: true },
    thursday: { start: '09:00', end: '17:00', enabled: true },
    friday: { start: '09:00', end: '17:00', enabled: true },
    saturday: { start: '09:00', end: '17:00', enabled: false },
    sunday: { start: '09:00', end: '17:00', enabled: false }
  })

  const notificationSettings = ref<NotificationSettings>({
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
  })

  const emailSettings = ref<EmailSettings>({
    smtp_server: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    from_email: '',
    from_name: ''
  })

  const smsSettings = ref<SMSSettings>({
    provider: 'custom',
    account_sid: '',
    auth_token: '',
    from_number: '',
    api_key: '',
    api_url: ''
  })

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSettings() {
    try {
      isLoading.value = true
      const response = await axios.get('/api/settings')
      const data = response.data
      
      workingHours.value = data.working_hours
      notificationSettings.value = data.notification_settings
      emailSettings.value = data.email_settings
      smsSettings.value = data.sms_settings
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to load settings'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateSettings() {
    try {
      isLoading.value = true
      const response = await axios.put('/api/settings', {
        working_hours: workingHours.value,
        notification_settings: notificationSettings.value,
        email_settings: emailSettings.value,
        sms_settings: smsSettings.value
      })
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to update settings'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function testEmailSettings() {
    try {
      const response = await axios.post('/api/settings/test-email', emailSettings.value)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to test email settings'
      throw err
    }
  }

  async function testSMSSettings() {
    try {
      const response = await axios.post('/api/settings/test-sms', smsSettings.value)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to test SMS settings'
      throw err
    }
  }

  async function handlePayPalSubscription() {
    try {
      const response = await axios.post('/api/settings/subscribe-sms')
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to process subscription'
      throw err
    }
  }

  return {
    workingHours,
    notificationSettings,
    emailSettings,
    smsSettings,
    isLoading,
    error,
    fetchSettings,
    updateSettings,
    testEmailSettings,
    testSMSSettings,
    handlePayPalSubscription
  }
})