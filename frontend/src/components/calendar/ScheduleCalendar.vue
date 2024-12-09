<!-- src/components/calendar/ScheduleCalendar.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { useCalendarStore } from '@/stores/calendar';
import { useNotificationStore } from '@/stores/notification';

interface TimeSlot {
    time: string;
    available: boolean;
}

const emit = defineEmits(['date-select', 'time-select', 'schedule-confirm']);

const calendarStore = useCalendarStore();
const notificationStore = useNotificationStore();

const currentDate = ref(new Date());
const selectedDate = ref<Date | null>(null);
const selectedTime = ref<string | null>(null);
const showTimeSlots = ref(false);

// Calendar navigation
const prevMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1);
    showTimeSlots.value = false;
};

const nextMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1);
    showTimeSlots.value = false;
};

// Helper functions
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const formatTime = (hours: number, minutes: number) => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Generate time slots from 9 AM to 5 PM
const timeSlots = computed(() => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour < 17; hour++) {
        slots.push({ time: formatTime(hour, 0), available: true });
        slots.push({ time: formatTime(hour, 30), available: true });
    }
    return slots;
});

// Calendar days generation
const calendarDays = computed(() => {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push({ type: 'empty', day: null });
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isToday = new Date().toDateString() === date.toDateString();
        const isSelected = selectedDate.value?.toDateString() === date.toDateString();
        const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

        days.push({
            type: 'day',
            day,
            date,
            isToday,
            isSelected,
            isPast,
        });
    }

    return days;
});

// Helper function to combine date and time into ISO string
const combineDateAndTime = (date: Date, timeString: string): string => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined.toISOString();
};

// Calculate end time (30 minutes after start time)
const calculateEndTime = (date: Date, timeString: string): string => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const endTime = new Date(date);
    endTime.setHours(hours, minutes + 30, 0, 0);
    return endTime.toISOString();
};

const handleScheduleConfirm = async () => {
    if (!selectedDate.value || !selectedTime.value) return;

    try {
        const startTime = combineDateAndTime(selectedDate.value, selectedTime.value);
        const endTime = calculateEndTime(selectedDate.value, selectedTime.value);

        const eventData = {
            title: 'New Meeting',
            start_time: startTime,
            end_time: endTime,
            description: 'Scheduled meeting'
        };

        await calendarStore.createEvent(eventData);

        notificationStore.showNotification('success', 'Meeting scheduled successfully');

        // Reset selection
        selectedDate.value = null;
        selectedTime.value = null;
        showTimeSlots.value = false;

    } catch (error: any) {
        notificationStore.showNotification(
            'error',
            error.response?.data?.detail || 'Failed to schedule meeting'
        );
    }
};

const handleDateSelect = (date: Date) => {
    selectedDate.value = date;
    showTimeSlots.value = true;
    selectedTime.value = null;
    emit('date-select', date);
};
</script>

<template>
    <div class="max-w-4xl mx-auto p-4">
        <!-- Calendar Header -->
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
                <Calendar class="h-5 w-5" />
                <h2 class="text-xl font-semibold">
                    {{ currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }) }}
                </h2>
            </div>
            <div class="flex space-x-2">
                <button @click="prevMonth" class="p-2 hover:bg-gray-100 rounded-full">
                    <ChevronLeft class="h-5 w-5" />
                </button>
                <button @click="nextMonth" class="p-2 hover:bg-gray-100 rounded-full">
                    <ChevronRight class="h-5 w-5" />
                </button>
            </div>
        </div>

        <!-- Calendar Grid -->
        <div class="grid grid-cols-7 gap-2 mb-4">
            <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day"
                class="text-center text-sm font-medium text-gray-500">
                {{ day }}
            </div>

            <template v-for="(day, index) in calendarDays" :key="index">
                <div v-if="day.type === 'empty'" class="h-14" />
                <button v-else @click="() => !day.isPast && day.date && handleDateSelect(day.date)"
                    :disabled="day.isPast" :class="[
                        'h-14 rounded-lg relative',
                        day.isPast ? 'text-gray-400 cursor-not-allowed' :
                            day.isSelected ? 'bg-blue-600 text-white' :
                                day.isToday ? 'bg-blue-50' : 'hover:bg-gray-100'
                    ]">
                    <span class="absolute top-1 right-1 text-sm">{{ day.day }}</span>
                </button>
            </template>
        </div>

        <!-- Time Slots -->
        <div v-if="showTimeSlots && selectedDate" class="mt-6">
            <h3 class="text-lg font-medium mb-4">
                Available times for {{ selectedDate.toLocaleDateString() }}
            </h3>
            <div class="grid grid-cols-4 gap-2">
                <button v-for="slot in timeSlots" :key="slot.time" @click="selectedTime = slot.time" :class="[
                    'p-2 text-sm rounded-lg border',
                    selectedTime === slot.time
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:border-blue-500'
                ]">
                    {{ slot.time }}
                </button>
            </div>

            <!-- Confirm Button -->
            <div v-if="selectedTime" class="mt-6">
                <button @click="handleScheduleConfirm" :disabled="calendarStore.isLoading"
                    class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    <template v-if="calendarStore.isLoading">
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 inline-block" xmlns="http://www.w3.org/2000/svg"
                            fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        Scheduling...
                    </template>
                    <template v-else>
                        Confirm {{ selectedDate.toLocaleDateString() }} at {{ selectedTime }}
                    </template>
                </button>
            </div>
        </div>
    </div>
</template>