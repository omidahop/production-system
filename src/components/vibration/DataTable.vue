<template>
  <table class="table w-full">
    <thead>
      <tr>
        <th class="text-right font-semibold bg-gray-100 sticky right-0 z-10">تجهیزات</th>
        <th 
          v-for="parameter in parametersList" 
          :key="parameter.id"
          class="text-center font-semibold bg-gray-100 min-w-20"
        >
          <div class="flex flex-col items-center space-y-1">
            <i :class="parameter.icon" :style="{ color: parameter.color }"></i>
            <div class="text-xs">
              <div class="font-medium">{{ parameter.name }}</div>
              <div class="text-gray-500">({{ parameter.code }})</div>
            </div>
          </div>
        </th>
        <th v-if="showNotes" class="text-center font-semibold bg-yellow-100 sticky left-0 z-10">
          <div class="flex items-center justify-center space-x-1 space-x-reverse">
            <i class="fas fa-sticky-note text-yellow-600"></i>
            <span>یادداشت</span>
          </div>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr 
        v-for="equipment in equipmentData" 
        :key="equipment.id"
        class="hover:bg-blue-50 transition-colors"
      >
        <!-- Equipment Name -->
        <td class="text-right font-medium bg-white sticky right-0 z-5 border-l-2 border-primary-200">
          <div class="flex items-center space-x-3 space-x-reverse p-2">
            <i :class="equipment.icon" :style="{ color: equipment.color }" class="text-lg"></i>
            <div>
              <div class="font-semibold text-sm">{{ equipment.name }}</div>
              <div class="text-xs text-gray-500">{{ equipment.code }}</div>
            </div>
          </div>
        </td>
        
        <!-- Parameter Values -->
        <td 
          v-for="parameter in parametersList" 
          :key="parameter.id"
          class="text-center"
        >
          <ParameterCell 
            :value="getParameterValue(equipment.id, parameter.id)"
            :parameter="parameter"
            :equipment="equipment.id"
            :unit="unit"
          />
        </td>
        
        <!-- Notes -->
        <td v-if="showNotes" class="bg-white sticky left-0 z-5 border-r-2 border-yellow-300">
          <NotesCell :notes="getEquipmentNotes(equipment.id)" />
        </td>
      </tr>
      
      <!-- Empty State Row -->
      <tr v-if="equipmentData.length === 0">
        <td :colspan="parametersList.length + (showNotes ? 2 : 1)" class="text-center py-8 text-gray-500">
          هیچ داده‌ای برای نمایش موجود نیست
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { computed } from 'vue'
import ParameterCell from './ParameterCell.vue'
import NotesCell from './NotesCell.vue'
import { APP_CONFIG } from '@/utils/constants'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  unit: {
    type: String,
    required: true
  },
  showNotes: {
    type: Boolean,
    default: true
  }
})

// Computed
const parametersList = computed(() => {
  return APP_CONFIG.parameters.sort((a, b) => a.order - b.order)
})

const equipmentData = computed(() => {
  // Get unique equipment from data and merge with master list
  const dataEquipment = [...new Set(props.data.map(item => item.equipment))]
  
  return APP_CONFIG.equipments.filter(equipment => 
    dataEquipment.includes(equipment.id)
  )
})

const getParameterValue = (equipmentId, parameterId) => {
  const item = props.data.find(d => d.equipment === equipmentId)
  return item?.parameters?.[parameterId]
}

const getEquipmentNotes = (equipmentId) => {
  const item = props.data.find(d => d.equipment === equipmentId)
  return item?.notes || ''
}
</script>

<style scoped>
.table {
  @apply border-collapse w-full;
  min-width: 100%;
}

.table th,
.table td {
  @apply border border-gray-300 p-2;
}

.table th {
  @apply bg-gray-100 font-semibold text-sm;
}

.table td {
  @apply bg-white text-sm;
}

.table tbody tr:nth-child(even) {
  @apply bg-gray-50;
}

.table tbody tr:hover {
  @apply bg-blue-50;
}

/* Sticky columns */
.sticky {
  position: sticky;
}

.z-10 {
  z-index: 10;
}

.z-5 {
  z-index: 5;
}
</style>