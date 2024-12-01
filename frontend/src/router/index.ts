import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { publicRoutes } from './public'
import { authRoutes } from './auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...publicRoutes,
    ...authRoutes,   
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/dashboard/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard/profile',
      name: 'profile',
      component: () => import('@/views/dashboard/Profile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard/settings',
      name: 'settings',
      component: () => import('@/views/dashboard/Settings.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard/calendar',
      name: 'calendar',
      component: () => import('@/views/dashboard/Calendar.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard/event-types',
      name: 'event-types',
      component: () => import('@/views/dashboard/EventType.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard/event-types/new',
      name: 'new-event-type',
      component: () => import('@/views/dashboard/EventTypeForm.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard/event-types/:id/edit',
      name: 'edit-event-type',
      component: () => import('@/views/dashboard/EventTypeForm.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard/scheduled',
      name: 'scheduled-events',
      component: () => import('@/views/dashboard/ScheduledEvents.vue'),
      meta: { requiresAuth: true }
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Check if route requires auth
  if (to.meta.requiresAuth) {
    try {
      // Verify token validity
      const isValid = await authStore.checkAuth();
      
      if (!isValid) {
        // Redirect to login with message if token is invalid
        next({
          path: '/login',
          query: { 
            returnUrl: to.fullPath,
            message: 'Logged out due to inactivity'
          }
        });
        return;
      }
    } catch (error) {
      // Handle any errors during auth check
      next({
        path: '/login',
        query: { 
          returnUrl: to.fullPath,
          message: 'Authentication error occurred'
        }
      });
      return;
    }
  }
  
  // If the user is authenticated and tries to access login/signup pages
  if (authStore.isAuthenticated && (to.path === '/login' || to.path === '/signup')) {
    next('/dashboard');
    return;
  }
  
  next();
});

export default router;
