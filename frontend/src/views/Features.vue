<script setup lang="ts">
const features = [
  {
    title: 'Calendar Integration',
    description: 'Seamlessly sync with Google Calendar, Outlook, and other popular calendar services.',
    icon: '📅'
  },
  {
    title: 'Automated Reminders',
    description: 'Reduce no-shows with automated email and SMS reminders.',
    icon: '🔔'
  },
  {
    title: 'Custom Scheduling Rules',
    description: 'Set your availability preferences and buffer times between meetings.',
    icon: '⚙️'
  },
  {
    title: 'Team Scheduling',
    description: 'Coordinate meetings across team members with round-robin and collective scheduling.',
    icon: '👥'
  },
  {
    title: 'Custom Branding',
    description: 'Add your logo and customize the scheduling page to match your brand.',
    icon: '🎨'
  },
  {
    title: 'Analytics & Reporting',
    description: 'Track meeting trends and scheduling patterns with detailed analytics.',
    icon: '📊'
  }
];
</script>

<template>
  <div class="bg-white">
    <div class="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-3xl font-extrabold text-gray-900">All the features you need</h2>
        <p class="mt-4 text-lg text-gray-500">
          Everything you need to streamline your scheduling process and improve productivity.
        </p>
      </div>
      <div class="mt-12">
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="feature in features" :key="feature.title" class="pt-6">
            <div class="flow-root bg-gray-50 rounded-lg px-6 pb-8">
              <div class="-mt-6">
                <div class="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                  <span class="text-3xl">{{ feature.icon }}</span>
                </div>
                <h3 class="mt-8 text-lg font-medium text-gray-900 tracking-tight">{{ feature.title }}</h3>
                <p class="mt-5 text-base text-gray-500">
                  {{ feature.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>