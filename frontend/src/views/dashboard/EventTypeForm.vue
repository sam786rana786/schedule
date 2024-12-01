<!-- src/components/event-types/EventTypeForm.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useEventTypeStore } from '@/stores/eventType';
import { useNotificationStore } from '@/stores/notification';
import type { EventType, Question } from '@/types/eventType';

const router = useRouter();
const route = useRoute();
const eventTypeStore = useEventTypeStore();
const notificationStore = useNotificationStore();

const isEditing = ref(!!route.params.id);
const isLoading = ref(false);

interface BookingRules {
  future_limit: number;
  min_notice: number;
}

interface FormData {
  name: string;
  description: string;
  duration: number;
  color: string;
  locations: string[];
  questions: any[]; // Define proper type if known
  is_active: boolean;
  booking_rules: BookingRules;
}

const defaultQuestions = [
  {
    id: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    isDefault: true
  },
  {
    id: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    isDefault: true
  },
  {
    id: 'phone',
    label: 'Phone Number',
    type: 'tel',
    required: true,
    isDefault: true
  }
];

const formData = ref<FormData>({
  name: '',
  description: '',
  duration: 30,
  color: '#3B82F6',
  locations: [],
  questions: [],
  is_active: false,
  booking_rules: {
    future_limit: 30,
    min_notice: 24
  }
});

const availableDurations = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' }
] as const;

const locationOptions = [
  { value: 'google_meet', label: 'Google Meet' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'in_person', label: 'In Person' },
  { value: 'phone', label: 'Phone Call' }
] as const;

onMounted(async () => {
  if (isEditing.value) {
    try {
      isLoading.value = true;
      const eventTypeId = Number(route.params.id);
      const existingEventType = eventTypeStore.eventTypes.find(et => et.id === eventTypeId);
      if (existingEventType) {
        formData.value = {
          ...existingEventType,
          description: existingEventType.description || '',
          questions: existingEventType.questions || [],
          locations: existingEventType.locations || [],
          is_active: existingEventType.is_active || false,
          booking_rules: {
            future_limit: existingEventType.booking_rules?.future_limit || 30,
            min_notice: existingEventType.booking_rules?.min_notice || 24
          }
        };
      } else {
        throw new Error('Event type not found');
      }
    } catch (error) {
      notificationStore.showNotification('error', 'Failed to load event type');
      router.push('/dashboard/event-types');
    } finally {
      isLoading.value = false;
    }
  }
});

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const addQuestion = () => {
  const newQuestion: Question = {
    id: generateUUID(),
    type: 'text',
    label: '',
    required: false,
    options: []
  };
  formData.value.questions.push(newQuestion);
};

const removeQuestion = (index: number) => {
  formData.value.questions.splice(index, 1);
};

const handleSubmit = async () => {
  try {
    isLoading.value = true;

    if (isEditing.value) {
      await eventTypeStore.updateEventType(Number(route.params.id), formData.value);
    } else {
      await eventTypeStore.createEventType(formData.value);
    }
    notificationStore.showNotification('success', 'Event type saved successfully');
    router.push('/dashboard/event-types');
  } catch (error) {
    notificationStore.showNotification('error', 'Failed to save event type');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="bg-white shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Basic Information -->
        <div>
          <h3 class="text-lg font-medium text-gray-900">Basic Information</h3>
          <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div class="sm:col-span-4">
              <label for="name" class="block text-sm font-medium text-gray-700">Event Name</label>
              <div class="mt-1">
                <input type="text" id="name" v-model="formData.name" required
                  class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
              </div>
            </div>

            <div class="sm:col-span-6">
              <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
              <div class="mt-1">
                <textarea id="description" v-model="formData.description" rows="3"
                  class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"></textarea>
              </div>
            </div>

            <!-- Duration and Color selection fields -->
            <div class="sm:col-span-2">
              <label for="duration" class="block text-sm font-medium text-gray-700">Duration</label>
              <div class="mt-1">
                <select id="duration" v-model="formData.duration"
                  class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md">
                  <option v-for="duration in availableDurations" :key="duration.value" :value="duration.value">
                    {{ duration.label }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Color Picker -->
            <div class="sm:col-span-2">
              <label for="color" class="block text-sm font-medium text-gray-700">Color</label>
              <div class="mt-1">
                <input type="color" id="color" v-model="formData.color"
                  class="h-10 w-full rounded-md border-gray-300" />
              </div>
            </div>

            <!-- Is Active Toggle -->
            <div class="sm:col-span-2">
              <div class="relative flex items-start">
                <div class="flex items-center h-5">
                  <input id="is_active" type="checkbox" v-model="formData.is_active"
                    class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
                </div>
                <div class="ml-3 text-sm">
                  <label for="is_active" class="font-medium text-gray-700">Active</label>
                  <p class="text-gray-500">Make this event type available for booking</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Location Options -->
        <div class="border-t border-gray-200 pt-6">
          <h3 class="text-lg font-medium text-gray-900">Location Options</h3>
          <div class="mt-4 space-y-4">
            <div v-for="location in locationOptions" :key="location.value" class="flex items-center">
              <input type="checkbox" :id="location.value" :value="location.value" v-model="formData.locations"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <label :for="location.value" class="ml-3 text-sm text-gray-700">
                {{ location.label }}
              </label>
            </div>
          </div>
        </div>

        <!-- Default Questions Section -->
        <div class="border-t border-gray-200 pt-6">
          <h3 class="text-lg font-medium text-gray-900">Default Questions</h3>
          <p class="mt-1 text-sm text-gray-500">These questions are always included and required</p>

          <div class="mt-4 space-y-4">
            <div v-for="question in defaultQuestions" :key="question.id"
              class="flex items-start p-4 bg-gray-50 rounded-lg opacity-75">
              <div class="flex-1">
                <div class="flex items-center">
                  <span class="text-sm font-medium text-gray-900">{{ question.label }}</span>
                  <span class="ml-2 text-xs text-red-500">Required</span>
                </div>
                <span class="text-sm text-gray-500">{{ question.type }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Questions Section -->
        <div class="border-t border-gray-200 pt-6">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">Additional Questions</h3>
            <button type="button" @click="addQuestion"
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Add Question
            </button>
          </div>

          <div class="mt-4 space-y-4">
            <div v-for="(question, index) in formData.questions" :key="question.id"
              class="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div class="flex-1">
                <div class="mb-4">
                  <label :for="`question-${index}-label`"
                    class="block text-sm font-medium text-gray-700">Question</label>
                  <input :id="`question-${index}-label`" v-model="question.label" type="text"
                    class="mt-1 block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md" />
                </div>
                <div class="flex items-center space-x-4">
                  <div>
                    <label :for="`question-${index}-type`" class="block text-sm font-medium text-gray-700">Type</label>
                    <select :id="`question-${index}-type`" v-model="question.type"
                      class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                      <option value="text">Text</option>
                      <option value="textarea">Long Text</option>
                      <option value="select">Multiple Choice</option>
                    </select>
                  </div>
                  <div class="flex items-center h-full pt-6">
                    <input :id="`question-${index}-required`" v-model="question.required" type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <label :for="`question-${index}-required`" class="ml-2 block text-sm text-gray-700">Required</label>
                  </div>
                </div>
              </div>
              <button type="button" @click="removeQuestion(index)" class="text-gray-400 hover:text-gray-500">
                <span class="sr-only">Remove question</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-3 pt-6">
          <button type="button" @click="router.back()"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" :disabled="isLoading"
            class="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {{ isEditing ? 'Update' : 'Create' }} Event Type
          </button>
        </div>
      </form>
    </div>
  </div>
</template>