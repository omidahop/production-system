import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import vibrationService from '@/services/vibrationService'
import { APP_CONFIG, STORAGE_KEYS } from '@/utils/constants'
import { getCurrentDate } from '@/utils/helpers'

export const useVibrationStore = defineStore('vibration', () => {
  // State
  const vibrationData = ref([])
  const todayData = ref({})
  const isLoading = ref(false)
  const error = ref(null)
  const settings = ref({
    theme: 'light',
    primaryColor: '#2563eb',
    dri1Color: '#3b82f6',
    dri2Color: '#ef4444',
    equipmentPriority: {},
    parameterPriority: {},
    parameterMode: 'default',
    dataEntryEquipmentPriority: {},
    dataEntryParameterPriority: {},
    dataEntryParameterMode: 'default',
    analysisThreshold: 20,
    analysisTimeRange: 7,
    analysisComparisonDays: 1
  })

  // Data Entry State
  const dataEntryState = ref({
    mode: 'new',
    selectedUnit: null,
    currentEquipmentIndex: 0,
    currentParameterIndex: 0,
    currentData: {},
    dateData: {},
    editSelectedUnit: null,
    editSelectedEquipment: null,
    editSelectedParameter: null,
    editCurrentValue: null,
    currentEquipmentNote: ''
  })

  // Slideshow State
  const slideshowState = ref({
    isRunning: false,
    isPaused: false,
    currentDate: null,
    currentEquipmentIndex: 0,
    currentParameterIndex: 0,
    interval: null,
    speed: 3000,
    data: {},
    isFullscreen: false,
    currentValueColor: '#3b82f6'
  })

  // Computed
  const equipmentsByPriority = computed(() => {
    if (Object.keys(settings.value.equipmentPriority).length > 0) {
      return Object.entries(settings.value.equipmentPriority)
        .sort(([,a], [,b]) => a - b)
        .map(([id]) => {
          const baseId = id.replace('_DRI1', '').replace('_DRI2', '')
          const equipment = APP_CONFIG.equipments.find(e => e.id === baseId)
          if (equipment) {
            return {
              ...equipment,
              unit: id.includes('_DRI1') ? 'DRI1' : id.includes('_DRI2') ? 'DRI2' : null,
              priorityId: id
            }
          }
          return null
        })
        .filter(Boolean)
    }
    return APP_CONFIG.equipments
  })

  const parametersByPriority = computed(() => {
    if (settings.value.parameterMode === 'default') {
      return APP_CONFIG.parameters.sort((a, b) => a.order - b.order)
    } else if (settings.value.parameterMode === 'velocity-first') {
      const velocityParams = APP_CONFIG.parameters.filter(p => p.type === 'velocity')
      const accelerationParams = APP_CONFIG.parameters.filter(p => p.type === 'acceleration')
      return [...velocityParams, ...accelerationParams]
    } else if (settings.value.parameterMode === 'custom' && Object.keys(settings.value.parameterPriority).length > 0) {
      return Object.entries(settings.value.parameterPriority)
        .sort(([,a], [,b]) => a - b)
        .map(([id]) => APP_CONFIG.parameters.find(p => p.id === id))
        .filter(Boolean)
    }
    return APP_CONFIG.parameters.sort((a, b) => a.order - b.order)
  })

  const dataEntryEquipmentsByPriority = computed(() => {
    if (!dataEntryState.value.selectedUnit) return APP_CONFIG.equipments
    
    const unitId = dataEntryState.value.selectedUnit
    if (Object.keys(settings.value.dataEntryEquipmentPriority).length > 0) {
      const priorityEntries = Object.entries(settings.value.dataEntryEquipmentPriority)
        .filter(([key]) => key.includes(unitId))
        .sort(([,a], [,b]) => a - b)
      
      if (priorityEntries.length > 0) {
        return priorityEntries.map(([key]) => {
          const equipmentId = key.replace(`_${unitId}`, '')
          return APP_CONFIG.equipments.find(e => e.id === equipmentId)
        }).filter(Boolean)
      }
    }
    return APP_CONFIG.equipments
  })

  const dataEntryParametersByPriority = computed(() => {
    if (settings.value.dataEntryParameterMode === 'default') {
      return APP_CONFIG.parameters.sort((a, b) => a.order - b.order)
    } else if (settings.value.dataEntryParameterMode === 'velocity-first') {
      const velocityParams = APP_CONFIG.parameters.filter(p => p.type === 'velocity')
      const accelerationParams = APP_CONFIG.parameters.filter(p => p.type === 'acceleration')
      return [...velocityParams, ...accelerationParams]
    } else if (settings.value.dataEntryParameterMode === 'custom' && Object.keys(settings.value.dataEntryParameterPriority).length > 0) {
      return Object.entries(settings.value.dataEntryParameterPriority)
        .sort(([,a], [,b]) => a - b)
        .map(([id]) => APP_CONFIG.parameters.find(p => p.id === id))
        .filter(Boolean)
    }
    return APP_CONFIG.parameters.sort((a, b) => a.order - b.order)
  })

  // Actions
  const saveVibrationData = async (data) => {
    isLoading.value = true
    error.value = null
    
    try {
      await vibrationService.saveVibrationData(data)
      
      // Update local state
      const existingIndex = vibrationData.value.findIndex(
        d => d.unit === data.unit && d.equipment === data.equipment && d.date === data.date
      )
      
      if (existingIndex >= 0) {
        vibrationData.value[existingIndex] = data
      } else {
        vibrationData.value.unshift(data)
      }
      
      return true
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const loadVibrationData = async (filters = {}) => {
    isLoading.value = true
    error.value = null
    
    try {
      const data = await vibrationService.getVibrationData(filters)
      vibrationData.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const loadTodayData = async (unit) => {
    try {
      const data = await vibrationService.getTodayData(unit)
      
      const processedData = {}
      data.forEach(item => {
        processedData[item.equipment] = { ...item.parameters }
      })
      
      todayData.value = processedData
      return processedData
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const getUnitStatistics = async (unit) => {
    try {
      return await vibrationService.getUnitStatistics(unit)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const findAnomalies = async (threshold = null, timeRange = null, comparisonDays = null) => {
    try {
      return await vibrationService.findAnomalies(
        threshold || settings.value.analysisThreshold,
        timeRange || settings.value.analysisTimeRange,
        comparisonDays || settings.value.analysisComparisonDays
      )
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const exportData = async (filters = {}) => {
    try {
      return await vibrationService.exportDataToCSV(filters)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Settings Management
  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEYS.VIBRATION_SETTINGS)
      if (savedSettings) {
        settings.value = {
          ...settings.value,
          ...JSON.parse(savedSettings)
        }
      }
      initializeDefaultPriorities()
    } catch (err) {
      console.error('Error loading settings:', err)
      initializeDefaultPriorities()
    }
  }

  const saveSettings = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.VIBRATION_SETTINGS, JSON.stringify(settings.value))
      return true
    } catch (err) {
      error.value = 'خطا در ذخیره تنظیمات'
      throw err
    }
  }

    const resetSettings = () => {
    settings.value = {
      theme: 'light',
      primaryColor: '#2563eb',
      dri1Color: '#3b82f6',
      dri2Color: '#ef4444',
      equipmentPriority: {},
      parameterPriority: {},
      parameterMode: 'default',
      dataEntryEquipmentPriority: {},
      dataEntryParameterPriority: {},
      dataEntryParameterMode: 'default',
      analysisThreshold: 20,
      analysisTimeRange: 7,
      analysisComparisonDays: 1
    }
    initializeDefaultPriorities()
    saveSettings()
  }

  const initializeDefaultPriorities = () => {
    if (Object.keys(settings.value.equipmentPriority).length === 0) {
      let priority = 1
      ['DRI1', 'DRI2'].forEach(unit => {
        APP_CONFIG.equipments.forEach(equipment => {
          settings.value.equipmentPriority[`${equipment.id}_${unit}`] = priority++
        })
      })
    }
    
    if (Object.keys(settings.value.parameterPriority).length === 0) {
      APP_CONFIG.parameters.forEach((parameter) => {
        settings.value.parameterPriority[parameter.id] = parameter.order
      })
    }

    if (Object.keys(settings.value.dataEntryParameterPriority).length === 0) {
      APP_CONFIG.parameters.forEach((parameter) => {
        settings.value.dataEntryParameterPriority[parameter.id] = parameter.order
      })
    }
  }

  // Data Entry Management
  const setDataEntryMode = (mode) => {
    dataEntryState.value.mode = mode
    resetDataEntryState()
  }

  const resetDataEntryState = () => {
    dataEntryState.value = {
      ...dataEntryState.value,
      currentEquipmentIndex: 0,
      currentParameterIndex: 0,
      currentData: {},
      dateData: {},
      editSelectedUnit: null,
      editSelectedEquipment: null,
      editSelectedParameter: null,
      editCurrentValue: null,
      currentEquipmentNote: ''
    }
  }

  const selectUnit = async (unitId) => {
    dataEntryState.value.selectedUnit = unitId
    dataEntryState.value.currentEquipmentIndex = 0
    dataEntryState.value.currentParameterIndex = 0
    dataEntryState.value.dateData = {}
    dataEntryState.value.currentData = {}
    dataEntryState.value.currentEquipmentNote = ''

    await loadTodayDataForEntry(unitId)
  }

  const loadTodayDataForEntry = async (unitId) => {
    try {
      const today = getCurrentDate()
      const data = await vibrationService.getVibrationData({ 
        unit: unitId, 
        date: today 
      })
      
      const processedData = {}
      data.forEach(item => {
        processedData[item.equipment] = { ...item.parameters }
      })
      
      dataEntryState.value.dateData = processedData
      await setNextIncompletePosition()
      
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const setNextIncompletePosition = async () => {
    const equipments = dataEntryEquipmentsByPriority.value
    const parameters = dataEntryParametersByPriority.value
    
    for (let i = 0; i < equipments.length; i++) {
      const equipment = equipments[i]
      const equipmentData = dataEntryState.value.dateData[equipment.id]
      
      if (!equipmentData) {
        dataEntryState.value.currentEquipmentIndex = i
        dataEntryState.value.currentParameterIndex = 0
        return
      }
      
      const validParams = parameters.filter(param => {
        const value = equipmentData[param.id]
        return value !== undefined && 
               value !== null && 
               value !== '' &&
               !isNaN(value)
      })
      
      if (validParams.length < parameters.length) {
        dataEntryState.value.currentEquipmentIndex = i
        dataEntryState.value.currentParameterIndex = validParams.length
        return
      }
    }
    
    dataEntryState.value.currentEquipmentIndex = 0
    dataEntryState.value.currentParameterIndex = 0
  }

  // Slideshow Management
  const startSlideshow = async (date) => {
    try {
      const allData = await vibrationService.getVibrationData({ date })
      
      if (allData.length === 0) {
        throw new Error('داده‌ای برای این تاریخ موجود نیست')
      }
      
      const processedData = {}
      allData.forEach(item => {
        const key = `${item.equipment}_${item.unit}`
        processedData[key] = item.parameters
      })
      
      slideshowState.value = {
        ...slideshowState.value,
        isRunning: true,
        isPaused: false,
        currentDate: date,
        currentEquipmentIndex: 0,
        currentParameterIndex: 0,
        data: processedData
      }
      
      return true
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const pauseSlideshow = () => {
    slideshowState.value.isPaused = true
  }

  const resumeSlideshow = () => {
    slideshowState.value.isPaused = false
  }

  const stopSlideshow = () => {
    slideshowState.value = {
      isRunning: false,
      isPaused: false,
      currentDate: null,
      currentEquipmentIndex: 0,
      currentParameterIndex: 0,
      interval: null,
      speed: 3000,
      data: {},
      isFullscreen: false,
      currentValueColor: '#3b82f6'
    }
  }

  // Validation
  const validateVibrationValue = (value, parameterId) => {
    const num = parseFloat(value)
    if (isNaN(num) || num < 0) return false
    
    const parameter = APP_CONFIG.parameters.find(p => p.id === parameterId)
    if (!parameter) return false
    
    const maxValue = parameter.type === 'velocity' ? 20 : 2
    const decimalPlaces = (num.toString().split('.')[1] || '').length
    if (decimalPlaces > 2) return false
    
    return num <= maxValue
  }

  // Real-time subscriptions
  const subscribeToVibrationData = (callback) => {
    return vibrationService.subscribeToVibrationData(callback)
  }

  // Return store interface
  return {
    // State
    vibrationData,
    todayData,
    isLoading,
    error,
    settings,
    dataEntryState,
    slideshowState,
    
    // Computed
    equipmentsByPriority,
    parametersByPriority,
    dataEntryEquipmentsByPriority,
    dataEntryParametersByPriority,
    
    // Actions
    saveVibrationData,
    loadVibrationData,
    loadTodayData,
    getUnitStatistics,
    findAnomalies,
    exportData,
    
    // Settings
    loadSettings,
    saveSettings,
    resetSettings,
    
    // Data Entry
    setDataEntryMode,
    resetDataEntryState,
    selectUnit,
    loadTodayDataForEntry,
    setNextIncompletePosition,
    
    // Slideshow
    startSlideshow,
    pauseSlideshow,
    resumeSlideshow,
    stopSlideshow,
    
    // Utilities
    validateVibrationValue,
    subscribeToVibrationData
  }
})