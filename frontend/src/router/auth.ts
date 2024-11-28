export const authRoutes = [
    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/auth/Login.vue'),
        meta: { requiresAuth: false, isAuthRoute: true }
    },
    {
        path: '/signup',
        name: 'signup',
        component: () => import('@/views/auth/SignUp.vue'),
        meta: { requiresAuth: false, isAuthRoute: true }
    },
]