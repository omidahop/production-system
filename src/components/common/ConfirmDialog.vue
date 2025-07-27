<template>
  <div class="modal-backdrop" @click.self="$emit('cancel')">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
      <div class="flex items-center mb-4">
        <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center ml-4">
          <i class="fas fa-exclamation-triangle text-yellow-600 text-xl"></i>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">{{ title || 'تایید' }}</h3>
        </div>
      </div>
      
      <div class="mb-6">
        <p class="text-gray-700">{{ message || 'آیا مطمئن هستید؟' }}</p>
      </div>
      
      <div class="flex space-x-3 space-x-reverse">
        <button 
          @click="$emit('confirm')"
          class="btn btn-error flex-1"
        >
          <i class="fas fa-check ml-2"></i>
          {{ confirmText || 'تایید' }}
        </button>
        <button 
          @click="$emit('cancel')"
          class="btn btn-outline flex-1"
        >
          <i class="fas fa-times ml-2"></i>
          {{ cancelText || 'انصراف' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  message: String,
  confirmText: String,
  cancelText: String
})

defineEmits(['confirm', 'cancel'])
</script>