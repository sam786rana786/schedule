export const publicRoutes = [
    {
      path: '/schedule/:slug',
      name: 'public-booking',
      component: () => import('@/views/public/BookingPage.vue'),
      meta: { layout: 'public' }
    },
    {
      path: '/schedule/:slug/book',
      name: 'booking-form',
      component: () => import('@/views/public/BookingForm.vue'),
      meta: { layout: 'public' }
    },
    {
      path: '/bookings/:bookingId/confirmation',
      name: 'booking-confirmation',
      component: () => import('@/views/public/BookingConfirmation.vue'),
      meta: { layout: 'public' }
    },
    {
        path: '/',
        name: 'home',
        component: () => import('@/views/Home.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: '/features',
        name: 'features',
        component: () => import('@/views/Features.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: '/solutions',
        name: 'solutions',
        component: () => import('@/views/Solutions.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: '/pricing',
        name: 'pricing',
        component: () => import('@/views/Pricing.vue'),
        meta: { requiresAuth: false }
      },
  ]