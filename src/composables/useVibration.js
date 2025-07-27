import { ref, computed } from 'vue'
import { useVibrationStore } from '@/stores/vibration'

export function useVibration() {
  const vibrationStore = useVibrationStore()
  const isLoading = ref(false)

  const vibrationData = computed(() => vibrationStore.vibrationData)
  const settings = computed(() => vibrationStore.settings)
  const dataEntryState = computed(() => vibrationStore.dataEntryState)

  const saveData = async (data) => {
    isLoading.value = true
    try {
      await vibrationStore.saveVibrationData(data)
      return true
    } finally {
      isLoading.value = false
    }
  }

  const loadData = async (filters = {}) => {
    isLoading.value = true
    try {
      return await vibrationStore.loadVibrationData(filters)
    } finally {
      isLoading.value = false
    }
  }

  const validateValue = (value, parameterId) => {
    return vibrationStore.validateVibrationValue(value, parameterId)
  }

  const exportData = async (filters = {}) => {
    try {
      return await vibrationStore.exportData(filters)
    } catch (error) {
      throw error
    }
  }

  return {
    // State
    vibrationData,
    settings,
    dataEntryState,
    isLoading,
    
    // Actions
    saveData,
    loadData,
    validateValue,
    exportData
  }
}