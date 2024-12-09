<script setup lang="ts">
const solutions = [
  {
    title: 'Sales',
    description: 'Connect with prospects faster and close more deals.',
    features: [
      'Automated qualification',
      'Round-robin assignment',
      'Meeting analytics',
      'CRM integration'
    ],
    image: '/assets/sales-meeting.png'
  },
  {
    title: 'Customer Success',
    description: 'Deliver exceptional customer experience with efficient scheduling.',
    features: [
      'Recurring meetings',
      'Group sessions',
      'Custom reminder workflows',
      'Integration with help desk'
    ],
    image: '/assets/customer-success.png'
  },
  {
    title: 'Recruiting',
    description: 'Streamline your hiring process with automated scheduling.',
    features: [
      'Candidate self-scheduling',
      'Panel interviews',
      'Calendar coordination',
      'ATS integration'
    ],
    image: '/assets/recruiting.png'
  }
];
</script>

<template>
  <div class="bg-white">
    <div class="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Solutions for every team
        </h2>
        <p class="mt-4 text-xl text-gray-600">
          Scheduling automation tailored to your workflow
        </p>
      </div>

      <div class="mt-16 space-y-16">
        <div v-for="(solution, index) in solutions" :key="solution.title"
          :class="['relative', index % 2 === 1 ? 'lg:flex-row-reverse' : '']"
          class="lg:flex lg:items-center lg:space-x-8">
          <div class="lg:w-1/2">
            <img :src="solution.image" :alt="solution.title" class="rounded-lg shadow-lg" />
          </div>
          <div class="mt-6 lg:mt-0 lg:w-1/2">
            <h3 class="text-2xl font-bold text-gray-900">{{ solution.title }}</h3>
            <p class="mt-4 text-lg text-gray-500">{{ solution.description }}</p>
            <ul class="mt-8 space-y-4">
              <li v-for="feature in solution.features" :key="feature" class="flex items-center">
                <svg class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="ml-3 text-base text-gray-500">{{ feature }}</span>
              </li>
            </ul>
            <div class="mt-8">
              <RouterLink to="/signup"
                class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                Get started
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>