<script setup lang="ts">
interface Plan {
  name: string;
  price: number;
  frequency: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}
const plans: Plan[] = [
  {
    name: 'Basic',
    price: 0,
    frequency: 'month',
    features: [
      'One calendar',
      'Basic scheduling',
      'Email notifications',
      'Google Calendar integration'
    ],
    cta: 'Start for free',
    highlighted: false
  },
  {
    name: 'Professional',
    price: 15,
    frequency: 'month',
    features: [
      'Multiple calendars',
      'Custom branding',
      'Group meetings',
      'SMS notifications',
      'Analytics dashboard',
      'Priority support'
    ],
    cta: 'Start free trial',
    highlighted: true
  },
  {
    name: 'Team',
    price: 25,
    frequency: 'month/user',
    features: [
      'Everything in Professional',
      'Team scheduling',
      'Admin controls',
      'SAML SSO',
      'API access',
      'Dedicated support'
    ],
    cta: 'Contact sales',
    highlighted: false
  }
];
</script>

<template>
  <div class="bg-gray-50">
    <div class="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Simple, transparent pricing
        </h2>
        <p class="mt-4 text-xl text-gray-600">
          Choose the plan that best fits your needs
        </p>
      </div>

      <div class="mt-16 grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div v-for="plan in plans" :key="plan.name" :class="[
          'rounded-lg shadow-lg divide-y divide-gray-200',
          plan.highlighted ? 'border-2 border-blue-500' : ''
        ]">
          <div class="p-6">
            <h3 class="text-2xl font-medium text-gray-900">{{ plan.name }}</h3>
            <p class="mt-4">
              <span class="text-4xl font-extrabold">${{ plan.price }}</span>
              <span class="text-base font-medium text-gray-500">/{{ plan.frequency }}</span>
            </p>
            <p class="mt-4 text-sm text-gray-500">
              {{ plan.description }}
            </p>
            <RouterLink :to="'/signup'" :class="[
              'mt-8 block w-full py-3 px-6 border rounded-md text-center font-medium',
              plan.highlighted
                ? 'bg-blue-500 border-transparent text-white hover:bg-blue-600'
                : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
            ]">
              {{ plan.cta }}
            </RouterLink>
          </div>
          <div class="px-6 pt-6 pb-8">
            <h4 class="text-sm font-medium text-gray-900 tracking-wide">Features</h4>
            <ul class="mt-6 space-y-4">
              <li v-for="feature in plan.features" :key="feature" class="flex">
                <svg class="flex-shrink-0 h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="ml-3 text-base text-gray-500">{{ feature }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>