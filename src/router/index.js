import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROUTE_NAMES } from '@/utils/constants'

const routes = [
  {
    path: '/login',
    name: ROUTE_NAMES.LOGIN,
    component: () => import('@/views/LoginView.vue'),
    meta: {
      requiresAuth: false,
      title: 'ورود به سیستم'
    }
  },
  {
    path: '/',
    name: ROUTE_NAMES.DASHBOARD,
    component: () => import('@/views/DashboardView.vue'),
    meta: {
      requiresAuth: true,
      title: 'داشبورد'
    }
  },
  {
    path: '/vibration-system',
    name: ROUTE_NAMES.VIBRATION_SYSTEM,
    component: () => import('@/views/VibrationSystemView.vue'),
    meta: {
      requiresAuth: true,
      title: 'سیستم ثبت ویبره'
    }
  },
  {
    path: '/mechanical-net',
    name: ROUTE_NAMES.MECHANICAL_NET,
    component: () => import('@/views/MechanicalNetView.vue'),
    meta: {
      requiresAuth: true,
      title: 'شبکه مکانیک'
    }
  },
  {
    path: '/admin',
    name: ROUTE_NAMES.ADMIN,
    component: () => import('@/views/AdminView.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: 'پنل مدیریت'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/components/common/ErrorMessage.vue'),
    props: {
      title: '404',
      message: 'صفحه مورد نظر یافت نشد',
      showHomeButton: true
    },
    meta: {
      title: 'صفحه یافت نشد'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth if not already initialized
  if (!authStore.isInitialized) {
    await authStore.initAuth()
  }
  
  // Set page title
  document.title = to.meta.title ? `${to.meta.title} - ${import.meta.env.VITE_APP_TITLE || 'سیستم جامع تولید'}` : 'سیستم جامع تولید'
  
  // Check authentication requirement
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Check admin requirement
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    if (window.$toast) {
      window.$toast('شما مجاز به دسترسی به این بخش نیستید', 'error')
    }
    next('/')
    return
  }
  
  // Redirect to dashboard if already authenticated and trying to access login
  if (to.name === ROUTE_NAMES.LOGIN && authStore.isAuthenticated) {
    next('/')
    return
  }
  
  next()
})

export default router