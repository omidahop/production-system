<template>
  <div class="flex items-center justify-center" :class="containerClass">
    <div 
      :class="[
        'animate-spin rounded-full border-4 border-solid',
        sizeClass,
        colorClass
      ]"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  color: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'white'].includes(value)
  },
  fullScreen: {
    type: Boolean,
    default: false
  }
})

const sizeClass = computed(() => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }
  return sizes[props.size]
})

const colorClass = computed(() => {
  const colors = {
    primary: 'border-primary-200 border-t-primary-600',
    secondary: 'border-gray-200 border-t-gray-600',
    white: 'border-white/20 border-t-white'
  }
  return colors[props.color]
})

const containerClass = computed(() => {
  return props.fullScreen ? 'fixed inset-0 bg-white/80 z-50' : ''
})
</script>