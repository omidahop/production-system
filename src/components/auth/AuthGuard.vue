<template>
  <div>
    <LoadingSpinner v-if="!authStore.isInitialized" fullScreen />
    <slot v-else-if="hasAccess" />
    <div v-else class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center">
        <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i class="fas fa-ban text-3xl text-red-500"></i>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">دسترسی مجاز نیست</h2>
        <p class="text-gray-600 mb-6">شما مجاز به دسترسی به این بخش نیستید.</p>
        <button @click="$router.push('/')" class="btn btn-primary">
          بازگشت به خانه
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const props = defineProps({
  requiresAuth: {
    type: Boolean,
    default: true
  },
  requiresAdmin: {
    type: Boolean,
    default: false
  },
  requiresModerator: {
    type: Boolean,
    default: false
  }
})

const authStore = useAuthStore()

const hasAccess = computed(() => {
  if (props.requiresAuth && !authStore.isAuthenticated) {
    return false
  }
  
  if (props.requiresAdmin && !authStore.isAdmin) {
    return false
  }
  
  if (props.requiresModerator && !authStore.isModerator && !authStore.isAdmin) {
    return false
  }
  
  return true
})
</script>