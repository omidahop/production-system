<template>
  <div class="notes-container">
    <div v-if="notes && notes.trim()" class="has-notes">
      <div class="notes-content">
        <i class="fas fa-comment text-blue-500 text-sm"></i>
        <span 
          class="notes-text"
          :title="notes"
        >
          {{ truncatedNotes }}
        </span>
      </div>
      <button 
        v-if="notes.length > 30"
        @click="showFullNotes = !showFullNotes"
        class="expand-btn"
      >
        <i :class="showFullNotes ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
      </button>
      
      <!-- Full Notes Modal -->
      <div 
        v-if="showFullNotes && notes.length > 30" 
        class="notes-modal"
        @click.stop
      >
        <div class="notes-modal-content">
          <div class="flex justify-between items-start mb-2">
            <h4 class="font-semibold text-gray-900">یادداشت کامل</h4>
            <button @click="showFullNotes = false" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <p class="text-sm text-gray-700 leading-relaxed">{{ notes }}</p>
        </div>
      </div>
    </div>
    <div v-else class="no-notes">
      <i class="fas fa-minus text-gray-300"></i>
      <span class="text-gray-400 text-xs">بدون یادداشت</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  notes: {
    type: String,
    default: ''
  }
})

const showFullNotes = ref(false)

const truncatedNotes = computed(() => {
  if (!props.notes) return ''
  if (props.notes.length <= 30) return props.notes
  return props.notes.substring(0, 30) + '...'
})
</script>

<style scoped>
.notes-container {
  @apply relative p-2 min-w-40 max-w-60;
}

.has-notes {
  @apply relative;
}

.notes-content {
  @apply flex items-start space-x-2 space-x-reverse;
}

.notes-text {
  @apply text-xs text-gray-700 break-words leading-tight;
}

.expand-btn {
  @apply mt-1 text-xs text-blue-500 hover:text-blue-700 transition-colors;
}

.no-notes {
  @apply flex flex-col items-center space-y-1 text-center opacity-60;
}

.notes-modal {
  @apply absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-20;
}

.notes-modal-content {
  @apply bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs;
}
</style>