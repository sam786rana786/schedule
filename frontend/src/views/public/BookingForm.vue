<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePublicBookingStore } from '@/stores/publicBooking';
import { useNotificationStore } from '@/stores/notification';
import { Clock, Map, MapPin } from 'lucide-vue-next';
import type { EventType, Question } from '@/types/eventType';

const route = useRoute();
const router = useRouter();
const bookingStore = usePublicBookingStore();
const notificationStore = useNotificationStore();

const eventType = ref<EventType | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const companyLogo = ref<string | null>(null);
const userPic = ref<string | null>(null);
const userName = ref<string | null>(null);
const company = ref<string | null>(null);
const timeZone = ref<string | null>(null);

interface FormData {
    name: string;
    email: string;
    phone: string;
    notes: string;
    location: string;
    answers: Record<string, string>;
}

const formData = ref<FormData>({
    name: '',
    email: '',
    phone: '',
    notes: '',
    location: '',
    answers: {}
});

const formatLocation = (locationType: string) => {
    switch (locationType) {
        case 'google_meet':
            return 'Google Meet';
        case 'zoom':
            return 'Zoom';
        case 'phone':
            return 'Phone Call';
        case 'in_person':
            return 'In Person';
        default:
            return locationType;
    }
};

const locationOptions = computed(() => {
    return eventType.value?.locations || [];
});

const selectedDateTime = computed(() => {
    if (!route.query.date || !route.query.time) return null;
    const date = new Date(route.query.date as string);
    const time = route.query.time as string;
    return `${date.toLocaleDateString()} at ${time}`;
});

onMounted(async () => {
    try {
        const { slug } = route.params;
        const { date, time } = route.query;

        if (!date || !time || typeof slug !== 'string') {
            router.push(`/schedule/${slug}`);
            return;
        }

        // Fetch event type using public store
        const fetchedEventType = await bookingStore.fetchPublicEventType(slug);
        eventType.value = fetchedEventType;

        if(eventType.value) {
            const profile = await bookingStore.getProfileByUserId(eventType.value.user_id.toString());
            companyLogo.value = profile.company_logo || null;
            userPic.value = profile.avatar_url || null;
            userName.value = profile.full_name || null;
            company.value = profile.company || null;
            timeZone.value = profile.time_zone || null;
        }

        if (!eventType.value) {
            error.value = 'Event type not found';
            return;
        }

        // Initialize answers object for each question
        if (eventType.value.questions) {
            eventType.value.questions.forEach(question => {
                formData.value.answers[question.id] = '';
            });
        }

        // Set default location if only one option is available
        if (eventType.value.locations?.length === 1) {
            formData.value.location = eventType.value.locations[0];
        }
    } catch (err) {
        error.value = 'Failed to load event type';
    } finally {
        isLoading.value = false;
    }
});

const convertTimeTo24Hour = (time: string): string => {
  const [hours, minutes] = time.split(/[: ]/); // Split by colon and space
  const isPM = time.toLowerCase().includes("pm");
  let hour24 = parseInt(hours, 10);

  if (isPM && hour24 !== 12) hour24 += 12; // Convert PM to 24-hour
  if (!isPM && hour24 === 12) hour24 = 0;  // Convert 12 AM to 0

  return `${String(hour24).padStart(2, "0")}:${minutes}`;
};

const handleSubmit = async () => {
    try {
        if (!eventType.value) return;
        const formattedDate = formatDateForBackend(route.query.date as string);
        const timeIn24Hour = convertTimeTo24Hour(route.query.time as string);

        // Validate required questions
        const missingRequired = eventType.value.questions?.filter(q =>
            q.required && !formData.value.answers[q.id]
        );

        if (missingRequired?.length) {
            notificationStore.showNotification('error', 'Please answer all required questions');
            return;
        }

        const bookingData = {
            event_type_id: eventType.value.id,
            date: formattedDate,
            time: timeIn24Hour,
            name: formData.value.name,
            email: formData.value.email,
            phone: formData.value.phone,
            notes: formData.value.notes,
            location: formData.value.location,
            answers: formData.value.answers
        };

        const booking = await bookingStore.createBooking(bookingData);

        router.push({
            name: 'booking-confirmation',
            params: { bookingId: booking.id.toString() }
        });
    } catch (error) {
        notificationStore.showNotification('error', 'Failed to create booking');
    }
};

const formatDateForBackend = (isoDate: string): string => {
  // Parse the ISO date string into a Date object
  const date = new Date(isoDate);
  
  // Format as YYYY-MM-DD
  // padStart ensures numbers less than 10 have leading zeros
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};
</script>

<template>
    <div class="min-h-screen bg-gray-50 py-12">
        <div class="max-w-4xl mx-auto flex flex-col lg:flex-row bg-white shadow rounded-lg overflow-hidden">
            <!-- Left Section: Event Details -->
            <div class="flex-shrink-0 w-full lg:w-1/2 p-6 bg-gray-100 border-r border-gray-200">
                <img :src="`http://127.0.0.1:8000${companyLogo}`" alt="Company Logo" class="mb-4">
                <hr />
                <h2 class="text-lg font-bold text-gray-800 mb-2">{{ eventType?.name }}</h2>
                <p class="text-sm text-gray-600 mt-2">
                {{ eventType?.duration }} min
                </p>
                <div class="mt-4 text-sm text-gray-600 space-y-2">
                <div class="flex items-center mb-4">
                    <MapPin class="h-5 w-5 mr-2 text-gray-500" />
                    <span>{{ company }}</span>
                </div>
                <div class="flex items-center mb-4">
                    <Clock class="h-5 w-5 mr-2 text-gray-500" />
                    <span>
                    {{ selectedDateTime }}
                    </span>
                </div>
                <div class="flex items-center mb-4">
                    <Map class="h-5 w-5 mr-2 text-gray-500" />
                    <span>{{ timeZone }}</span>
                </div>
                </div>
                <p class="mt-6 text-sm text-gray-700">
                Meeting is with <strong>{{ userName }}</strong>.
                </p>
            </div>
            <!-- Loading State -->
            <div v-if="isLoading" class="flex justify-center py-12">
                <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                </svg>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="text-center py-12">
                <div class="text-red-600 text-lg">{{ error }}</div>
                <button @click="router.push('/')" class="mt-4 text-blue-600 hover:text-blue-500">
                    Return to Homepage
                </button>
            </div>           

            <!-- Booking Form -->
            <div v-else-if="eventType" class="w-full lg:w-2/3 p-6">

                <form @submit.prevent="handleSubmit" class="px-4 py-5 sm:p-6 space-y-6">
                    <!-- Basic Information -->
                    <div class="space-y-4">
                        <div>
                            <label for="name" class="block text-sm font-medium text-gray-700">
                                Name
                                <span class="text-red-500">*</span>
                            </label>
                            <input type="text" id="name" v-model="formData.name" required
                                class="mt-1 block w-full px-2 py-2 border rounded-md shadow-sm focus:ring-blue-500 hover:border-blue-500 focus:border-blue-600 sm:text-sm" />
                        </div>

                        <div>
                            <label for="email" class="block text-sm font-medium text-gray-700">Email
                                <span class="text-red-500">*</span>
                            </label>
                            <input type="email" id="email" v-model="formData.email" required
                                class="mt-1 block w-full border px-2 py-2 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label for="phone" class="block text-sm font-medium text-gray-700">Contact Number
                                <span class="text-red-500">*</span>
                            </label>
                            <input type="tel" id="phone" v-model="formData.phone" required
                                class="mt-1 block w-full px-2 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>

                        <!-- Location Selection -->
                        <div v-if="locationOptions.length > 1">
                            <label for="location" class="block text-sm font-medium text-gray-700">Location</label>
                            <select id="location" v-model="formData.location" required
                                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option value="">Select a location</option>
                                <option v-for="location in locationOptions" :key="location" :value="location">
                                    {{ formatLocation(location) }}
                                </option>
                            </select>
                        </div>

                        <!-- Custom Questions -->
                        <div v-if="eventType.questions?.length" class="space-y-4">
                            <div v-for="question in eventType.questions" :key="question.id">
                                <label :for="question.id" class="block text-sm font-medium text-gray-700">
                                    {{ question.label }}
                                    <span v-if="question.required" class="text-red-500">*</span>
                                </label>

                                <!-- Text Input -->
                                <input v-if="question.type === 'text'" :id="question.id"
                                    v-model="formData.answers[question.id]" type="text" :required="question.required"
                                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />

                                <!-- Textarea -->
                                <textarea v-else-if="question.type === 'textarea'" :id="question.id"
                                    v-model="formData.answers[question.id]" :required="question.required" rows="3"
                                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>

                                <!-- Select -->
                                <select v-else-if="question.type === 'select'" :id="question.id"
                                    v-model="formData.answers[question.id]" :required="question.required"
                                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                    <option value="">Select an option</option>
                                    <option v-for="option in question.options" :key="option" :value="option">
                                        {{ option }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Form Actions -->
                    <div class="flex items-center justify-between pt-4 border-gray-200">
                        <button type="button" @click="router.back()"
                            class="text-sm font-medium text-white rounded-md hover:text-gray-500 bg-yellow-600 px-4 py-2 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                            Back
                        </button>
                        <button type="submit"
                            class="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Schedule Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>