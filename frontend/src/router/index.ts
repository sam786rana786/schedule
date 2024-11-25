import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/features',
      name: 'features',
      component: () => import('@/views/Features.vue')
    },
    {
      path: '/solutions',
      name: 'solutions',
      component: () => import('@/views/Solutions.vue')
    },
    {
      path: '/pricing',
      name: 'pricing',
      component: () => import('@/views/Pricing.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/Login.vue')
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/auth/SignUp.vue')
    },
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
  ],
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token'); // You might want to use a more secure auth check
  console.log('Navigation guard - Auth status:', !!isAuthenticated);
  console.log('Navigating to:', to.path);

  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('Auth required but not authenticated, redirecting to login');
    next('/login');
    return;
  } 
  if ((to.path === '/login' || to.path === '/signup') && isAuthenticated) {
    console.log('Already authenticated, redirecting to dashboard');
    next('/dashboard');
    return;
  }

  console.log('Proceeding with navigation');
  next();
  
});

export default router;
