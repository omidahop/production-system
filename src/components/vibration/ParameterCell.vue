<template>
  <div class="parameter-cell-container">
    <div v-if="value !== undefined && value !== null && value !== ''" class="parameter-value-display">
      <span 
        class="parameter-value"
        :class="getValueClass(value, parameter.type)"
      >
        {{ formatValue(value) }}
      </span>
      <div class="value-indicator" :class="getIndicatorClass(value, parameter.type)"></div>
    </div>
    <div v-else class="no-value">
      <span class="text-gray-400">--</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: [Number, String],
  parameter: {
    type: Object,
    required: true
  },
  equipment: String,
  unit: String
})

const formatValue = (value) => {
  if (value === null || value === undefined) return '--'
  return parseFloat(value).toFixed(2)
}

const getValueClass = (value, parameterType) => {
  const numValue = parseFloat(value)
  const maxValue = parameterType === 'velocity' ? 20 : 2
  const threshold = maxValue * 0.8 // 80% threshold
  
  if (numValue >= threshold) {
    return 'text-red-600 font-bold' // High value - danger
  } else if (numValue >= threshold * 0.6) {
    return 'text-yellow-600 font-semibold' // Medium value - warning  
  } else {
    return 'text-green-600 font-medium' // Low value - safe
  }
}

const getIndicatorClass = (value, parameterType) => {
  const numValue = parseFloat(value)
  const maxValue = parameterType === 'velocity' ? 20 : 2
  const threshold = maxValue * 0.8
  
  if (numValue >= threshold) {
    return 'bg-red-500'
  } else if (numValue >= threshold * 0.6) {
    return 'bg-yellow-500'
  } else {
    return 'bg-green-500'
  }
}
</script>

<style scoped>
.parameter-cell-container {
  @apply flex items-center justify-center p-1;
}

.parameter-value-display {
  @apply flex flex-col items-center space-y-1;
}

.parameter-value {
  @apply text-sm;
}

.value-indicator {
  @apply w-2 h-2 rounded-full;
}

.no-value {
  @apply flex items-center justify-center;
}
</style>