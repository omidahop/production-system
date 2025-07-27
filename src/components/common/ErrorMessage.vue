<template>
  <div class="flex flex-col items-center justify-center min-h-64 p-8">
    <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
      <i class="fas fa-exclamation-triangle text-3xl text-red-500"></i>
    </div>
    
    <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ title || 'خطا!' }}</h2>
    
    <p class="text-gray-600 text-center mb-6 max-w-md">
      {{ message || 'متأسفانه خطایی رخ داده است. لطفاً دوباره تلاش کنید.' }}
    </p>
    
    <div class="flex space-x-4 space-x-reverse">
      <button 
        v-if="showRetry"
        @click="$emit('retry')"
        class="btn btn-primary"
      >
        <i class="fas fa-redo ml-2"></i>
        تلاش مجدد
      </button>
      
      <button 
        v-if="showHomeButton"
        @click="$router.push('/')"
        class="btn btn-outline"
      >
        <i class="fas fa-home ml-2"></i>
        بازگشت به خانه
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  message: String,
  showRetry: {
    type: Boolean,
    default: true
  },
  showHomeButton: {
    type: Boolean,
    default: true
  }
})

defineEmits(['retry'])
</script>