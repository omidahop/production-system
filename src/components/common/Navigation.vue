<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
    <nav class="flex space-x-2 space-x-reverse overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="$emit('update:activeTab', tab.id)"
        :class="[
          'flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap',
          activeTab === tab.id
            ? 'bg-primary-600 text-white shadow-md'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        ]"
      >
        <i :class="tab.icon"></i>
        <span>{{ tab.name }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
defineProps({
  tabs: {
    type: Array,
    required: true
  },
  activeTab: {
    type: String,
    required: true
  }
})

defineEmits(['update:activeTab'])
</script>