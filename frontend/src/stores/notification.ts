import { defineStore } from 'pinia'
import { ref } from 'vue'

type NotificationType = 'success' | 'error' | 'warning' | 'info'

export const useNotificationStore = defineStore('notification', () => {
  const notification = ref<{ type: NotificationType; message: string } | null>(null)

  function showNotification(type: NotificationType, message: string, duration = 5000) {
    notification.value = { type, message }

    setTimeout(() => {
      notification.value = null
    }, duration)
  }

  function clearNotification() {
    notification.value = null
  }

  return {
    notification,
    showNotification,
    clearNotification
  }
})