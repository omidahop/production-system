<template>
  <div id="app" :class="{ 'dark': isDark }">
    <LoadingSpinner v-if="isLoading" class="fixed inset-0 flex items-center justify-center z-50 bg-white bg-opacity-75" />
    
    <router-view v-else />
    
    <!-- Toast Notifications -->
    <div class="fixed top-4 right-4 space-y-2 z-50">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'toast',
          toast.type,
          'transform transition-all duration-300'
        ]"
      >
        <div class="flex items-center p-4">
          <i 
            :class="[
              'fas mr-3',
              {
                'fa-check-circle text-green-500': toast.type === 'success',
                'fa-exclamation-triangle text-yellow-500': toast.type === 'warning',
                'fa-times-circle text-red-500': toast.type === 'error',
                'fa-info-circle text-blue-500': toast.type === 'info'
              }
            ]"
          ></i>
          <span class="flex-1 text-sm font-medium">{{ toast.message }}</span>
          <button 
            @click="removeToast(toast.id)"
            class="mr-2 text-gray-400 hover:text-gray-600"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      v-if="showConfirmDialog"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      @confirm="confirmDialog.onConfirm"
      @cancel="hideConfirmDialog"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(true)
const isDark = ref(false)
const toasts = ref([])
const showConfirmDialog = ref(false)
const confirmDialog = ref({
  title: '',
  message: '',
  onConfirm: () => {}
})

// Toast Management
const addToast = (message, type = 'info', duration = 5000) => {
  const id = Date.now()
  const toast = { id, message, type }
  toasts.value.push(toast)
  
  setTimeout(() => {
    removeToast(id)
  }, duration)
}

const removeToast = (id) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// Confirm Dialog Management
const showConfirm = (title, message, onConfirm) => {
  confirmDialog.value = { title, message, onConfirm }
  showConfirmDialog.value = true
}

const hideConfirmDialog = () => {
  showConfirmDialog.value = false
  confirmDialog.value = { title: '', message: '', onConfirm: () => {} }
}

// Theme Management
const toggleTheme = () => {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

const loadTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  } else {
    // Auto-detect system preference
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
}

// Global Event Listeners
const setupGlobalListeners = () => {
  // Global error handler
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    addToast('خطای غیرمنتظره‌ای رخ داد', 'error')
  })

  // Network status
  window.addEventListener('online', () => {
    addToast('اتصال برقرار شد', 'success')
  })

  window.addEventListener('offline', () => {
    addToast('اتصال قطع شد', 'warning')
  })

  // PWA update available
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
        addToast('نسخه جدید در دسترس است', 'info', 10000)
      }
    })
  }
}

// Initialize App
const initApp = async () => {
  try {
    loadTheme()
    setupGlobalListeners()
    
    // Initialize auth
    await authStore.initAuth()
    
    // Provide global methods
    window.$toast = addToast
    window.$confirm = showConfirm
    window.$toggleTheme = toggleTheme
    
  } catch (error) {
    console.error('App initialization error:', error)
    addToast('خطا در راه‌اندازی برنامه', 'error')
  } finally {
    isLoading.value = false
  }
}

// Watch for auth changes
watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (!isAuth && router.currentRoute.value.meta?.requiresAuth !== false) {
      router.push('/login')
    }
  }
)

onMounted(initApp)
</script>

<style>
/* Global styles are in src/style.css */
</style>