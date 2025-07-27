<template>
  <div class="space-y-6">
    <!-- User Info -->
    <div class="card">
      <div class="card-body">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4 space-x-reverse">
            <div class="user-avatar bg-primary-600 text-white">
              {{ userInitial }}
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">
                {{ authStore.profile?.full_name || 'کاربر میهمان' }}
              </h3>
              <p class="text-sm text-gray-600">
                اپراتور تجهیزات - {{ formatPersianDate(new Date()) }}
              </p>
            </div>
          </div>
          <button @click="clearTodayCache" class="btn btn-warning btn-sm">
            <i class="fas fa-refresh ml-2"></i>
            پاک کردن کش امروز
          </button>
        </div>
      </div>
    </div>

    <!-- Mode Selection -->
    <div class="card">
      <div class="card-header">
        <h3 class="font-semibold text-gray-900">حالت ثبت داده</h3>
      </div>
      <div class="card-body">
        <div class="flex space-x-4 space-x-reverse">
          <button
            @click="setMode('new')"
            :class="[
              'btn flex-1',
              dataEntryState.mode === 'new' ? 'btn-primary' : 'btn-outline'
            ]"
          >
            <i class="fas fa-plus ml-2"></i>
            ثبت جدید
          </button>
          <button
            @click="setMode('edit')"
            :class="[
              'btn flex-1',
              dataEntryState.mode === 'edit' ? 'btn-primary' : 'btn-outline'
            ]"
          >
            <i class="fas fa-edit ml-2"></i>
            ویرایش
          </button>
        </div>
      </div>
    </div>

    <!-- New Entry Mode -->
    <div v-if="dataEntryState.mode === 'new'" class="space-y-6">
      <!-- Unit Selection -->
      <div class="card">
        <div class="card-header">
          <h3 class="font-semibold text-gray-900">انتخاب واحد</h3>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              @click="selectUnit('DRI1')"
              :class="[
                'unit-btn dri1',
                selectedUnit === 'DRI1' ? 'selected' : ''
              ]"
            >
              <i class="fas fa-industry text-2xl"></i>
              <span class="text-lg font-bold">واحد احیا مستقیم 1</span>
              <span class="text-sm opacity-75">DRI 1</span>
            </button>
            <button
              @click="selectUnit('DRI2')"
              :class="[
                'unit-btn dri2',
                selectedUnit === 'DRI2' ? 'selected' : ''
              ]"
            >
              <i class="fas fa-industry text-2xl"></i>
              <span class="text-lg font-bold">واحد احیا مستقیم 2</span>
              <span class="text-sm opacity-75">DRI 2</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Data Entry Interface -->
      <div v-if="selectedUnit" class="space-y-6">
        <!-- Current Status -->
        <div :class="[
          'data-entry-header',
          selectedUnit === 'DRI1' ? 'dri1' : 'dri2'
        ]">
          <div class="text-center space-y-2">
            <h3 class="text-xl font-bold">{{ getUnitName(selectedUnit) }}</h3>
            <p class="text-sm opacity-75">{{ formatPersianDate(new Date()) }}</p>
            
            <div class="mt-4">
              <h4 class="text-lg font-semibold mb-2">{{ currentEquipmentName }}</h4>
              <p class="text-sm mb-4">{{ currentParameterName }}</p>
              
              <!-- Progress Bar -->
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  :style="{ width: progressPercentage + '%' }"
                  :class="selectedUnit === 'DRI1' ? 'dri1' : 'dri2'"
                ></div>
              </div>
              <p class="text-xs mt-2">{{ progressPercentage }}% تکمیل شده</p>
            </div>
          </div>
        </div>

        <!-- Data Input -->
        <div class="card">
          <div class="card-body text-center">
            <div class="max-w-md mx-auto">
              <label class="form-label text-lg mb-4 block">
                مقدار {{ currentParameterName }}:
              </label>
              
              <input
                ref="dataInput"
                v-model="inputValue"
                @keypress.enter="handleDataInput"
                @input="validateInput"
                type="number"
                step="0.01"
                min="0"
                :max="currentMaxValue"
                class="form-control text-center text-2xl font-bold mb-4"
                :class="inputClass"
                placeholder="مقدار را وارد کنید..."
                :disabled="isLoading"
              >
              
              <div class="text-sm text-gray-600 mb-4">
                <i class="fas fa-info-circle ml-1"></i>
                حداکثر مقدار: {{ currentMaxValue }} | Enter برای ثبت
              </div>
              
              <!-- Current Equipment Note -->
              <div v-if="currentEquipmentNote" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div class="flex items-start space-x-2 space-x-reverse">
                  <i class="fas fa-sticky-note text-yellow-600 mt-0.5"></i>
                  <div class="text-right">
                    <p class="text-sm font-medium text-yellow-800">یادداشت فعلی:</p>
                    <p class="text-sm text-yellow-700">{{ currentEquipmentNote }}</p>
                  </div>
                </div>
              </div>
              
              <div class="flex space-x-3 space-x-reverse">
                <button 
                  @click="handleDataInput"
                  class="btn btn-success flex-1"
                  :disabled="!inputValue || isLoading"
                >
                  <LoadingSpinner v-if="isLoading" size="sm" color="white" class="ml-2" />
                  <i v-else class="fas fa-save ml-2"></i>
                  ذخیره
                </button>
                <button 
                  @click="resetEntry"
                  class="btn btn-warning"
                  :disabled="isLoading"
                >
                  <i class="fas fa-refresh"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Mode -->
    <div v-if="dataEntryState.mode === 'edit'" class="space-y-6">
      <!-- Unit Selection for Edit -->
      <div class="card">
        <div class="card-header">
          <h3 class="font-semibold text-gray-900">انتخاب واحد</h3>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              @click="selectEditUnit('DRI1')"
              :class="[
                'unit-btn dri1',
                editSelectedUnit === 'DRI1' ? 'selected' : ''
              ]"
            >
              <i class="fas fa-industry text-2xl"></i>
              <span class="text-lg font-bold">واحد احیا مستقیم 1</span>
            </button>
            <button
              @click="selectEditUnit('DRI2')"
              :class="[
                'unit-btn dri2',
                editSelectedUnit === 'DRI2' ? 'selected' : ''
              ]"
            >
              <i class="fas fa-industry text-2xl"></i>
              <span class="text-lg font-bold">واحد احیا مستقیم 2</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Equipment Selection -->
      <div v-if="editSelectedUnit" class="card">
        <div class="card-header">
          <h3 class="font-semibold text-gray-900">انتخاب تجهیز</h3>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="equipment in equipmentList"
              :key="equipment.id"
              @click="selectEditEquipment(equipment.id)"
              :class="[
                'equipment-card cursor-pointer',
                editSelectedUnit === 'DRI1' ? 'dri1' : 'dri2',
                editSelectedEquipment === equipment.id ? 'selected' : ''
              ]"
            >
              <div class="equipment-header">
                <div class="equipment-icon">
                  <i :class="equipment.icon"></i>
                </div>
                <div class="equipment-info">
                  <h4 class="font-semibold">{{ equipment.name }}</h4>
                  <p class="text-sm text-gray-600">{{ equipment.code }}</p>
                </div>
              </div>
              <div class="mt-3">
                <button 
                  @click.stop="showEquipmentNote(equipment.id)"
                  class="btn btn-sm btn-outline w-full"
                >
                  <i class="fas fa-sticky-note ml-2"></i>
                  یادداشت
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Parameter Selection -->
      <div v-if="editSelectedEquipment" class="card">
        <div class="card-header">
          <h3 class="font-semibold text-gray-900">انتخاب پارامتر</h3>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div
              v-for="parameter in parameterList"
              :key="parameter.id"
              @click="selectEditParameter(parameter.id)"
              :class="[
                'parameter-card cursor-pointer',
                editSelectedUnit === 'DRI1' ? 'dri1' : 'dri2',
                editSelectedParameter === parameter.id ? 'selected' : ''
              ]"
            >
              <div class="parameter-icon">
                <i :class="parameter.icon" :style="{ color: parameter.color }"></i>
              </div>
              <div class="parameter-name">{{ parameter.name }}</div>
              <div class="parameter-code">{{ parameter.code }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Input -->
      <div v-if="editSelectedParameter" class="card">
        <div class="card-header">
          <h3 class="font-semibold text-gray-900">ویرایش مقدار</h3>
        </div>
        <div class="card-body text-center">
          <div class="max-w-md mx-auto">
            <div class="mb-4">
              <span class="text-lg font-medium">مقدار فعلی: </span>
              <span class="text-2xl font-bold text-primary-600">
                {{ editCurrentValue || '--' }}
              </span>
            </div>
            
            <label class="form-label text-lg mb-4 block">
              مقدار جدید {{ getParameterName(editSelectedParameter) }}:
            </label>
            
            <input
              ref="editInput"
              v-model="editInputValue"
              @keypress.enter="saveEditedData"
              @input="validateEditInput"
              type="number"
              step="0.01"
              min="0"
              :max="getParameterMaxValue(editSelectedParameter)"
              class="form-control text-center text-2xl font-bold mb-4"
              :class="editInputClass"
              placeholder="مقدار جدید..."
              :disabled="isLoading"
            >
            
            <div class="text-sm text-gray-600 mb-4">
              حداکثر مقدار: {{ getParameterMaxValue(editSelectedParameter) }}
            </div>
            
            <div class="flex space-x-3 space-x-reverse">
              <button 
                @click="saveEditedData"
                class="btn btn-success flex-1"
                :disabled="!editInputValue || isLoading"
              >
                <LoadingSpinner v-if="isLoading" size="sm" color="white" class="ml-2" />
                <i v-else class="fas fa-save ml-2"></i>
                ذخیره تغییرات
              </button>
              <button 
                @click="cancelEdit"
                class="btn btn-secondary"
                :disabled="isLoading"
              >
                <i class="fas fa-times ml-2"></i>
                انصراف
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Equipment Note Modal -->
    <div v-if="showNoteModal" class="modal-backdrop" @click.self="showNoteModal = false">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">
            یادداشت تجهیز - {{ getEquipmentName(noteEquipmentId) }}
          </h3>
          <button @click="showNoteModal = false" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="form-label">یادداشت:</label>
            <textarea
              v-model="noteText"
              class="form-control"
              rows="4"
              maxlength="500"
              placeholder="یادداشت مربوط به این تجهیز..."
            ></textarea>
            <div class="text-xs text-gray-500 mt-1">
              {{ noteText?.length || 0 }} / 500 کاراکتر
            </div>
          </div>
          
          <div class="flex space-x-3 space-x-reverse">
            <button 
              @click="saveEquipmentNote"
              class="btn btn-success flex-1"
              :disabled="isLoading"
            >
              <LoadingSpinner v-if="isLoading" size="sm" color="white" class="ml-2" />
              ذخیره یادداشت
            </button>
            <button 
              @click="showNoteModal = false"
              class="btn btn-outline"
            >
              انصراف
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useVibrationStore } from '@/stores/vibration'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { APP_CONFIG } from '@/utils/constants'
import { formatPersianDate, getCurrentDate } from '@/utils/helpers'

const authStore = useAuthStore()
const vibrationStore = useVibrationStore()

// Refs
const dataInput = ref(null)
const editInput = ref(null)
const inputValue = ref('')
const editInputValue = ref('')
const isLoading = ref(false)
const showNoteModal = ref(false)
const noteEquipmentId = ref('')
const noteText = ref('')

// State
const selectedUnit = ref(null)
const editSelectedUnit = ref(null)
const editSelectedEquipment = ref(null)
const editSelectedParameter = ref(null)
const editCurrentValue = ref(null)
const currentEquipmentNote = ref('')

// Computed
const userInitial = computed(() => {
  const name = authStore.profile?.full_name || authStore.user?.email
  return name ? name.charAt(0).toUpperCase() : 'U'
})

const dataEntryState = computed(() => vibrationStore.dataEntryState)

const equipmentList = computed(() => {
  return vibrationStore.dataEntryEquipmentsByPriority
})

const parameterList = computed(() => {
  return vibrationStore.dataEntryParametersByPriority
})

const currentEquipment = computed(() => {
  if (!selectedUnit.value) return null
  const equipments = equipmentList.value
  return equipments[dataEntryState.value.currentEquipmentIndex] || null
})

const currentParameter = computed(() => {
  const parameters = parameterList.value
  return parameters[dataEntryState.value.currentParameterIndex] || null
})

const currentEquipmentName = computed(() => {
  return currentEquipment.value?.name || ''
})

const currentParameterName = computed(() => {
  return currentParameter.value?.name || ''
})

const currentMaxValue = computed(() => {
  return currentParameter.value?.maxValue || 20
})

const progressPercentage = computed(() => {
  const totalParams = equipmentList.value.length * parameterList.value.length
  const currentProgress = (dataEntryState.value.currentEquipmentIndex * parameterList.value.length) + 
                         dataEntryState.value.currentParameterIndex
  return Math.round((currentProgress / totalParams) * 100)
})

const inputClass = computed(() => {
  if (!inputValue.value) return ''
  
  const isValid = validateVibrationValue(inputValue.value, currentParameter.value?.id)
  return isValid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
})

const editInputClass = computed(() => {
  if (!editInputValue.value) return ''
  
  const isValid = validateVibrationValue(editInputValue.value, editSelectedParameter.value)
  return isValid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
})

// Methods
const setMode = (mode) => {
  vibrationStore.setDataEntryMode(mode)
  resetStates()
}

const resetStates = () => {
  selectedUnit.value = null
  editSelectedUnit.value = null
  editSelectedEquipment.value = null
  editSelectedParameter.value = null
  editCurrentValue.value = null
  inputValue.value = ''
  editInputValue.value = ''
}

const selectUnit = async (unitId) => {
  selectedUnit.value = unitId
  try {
    await vibrationStore.selectUnit(unitId)
    await nextTick()
    if (dataInput.value) {
      dataInput.value.focus()
    }
  } catch (error) {
    window.$toast(error.message, 'error')
  }
}

const selectEditUnit = (unitId) => {
  editSelectedUnit.value = unitId
  editSelectedEquipment.value = null
  editSelectedParameter.value = null
}

const selectEditEquipment = (equipmentId) => {
  editSelectedEquipment.value = equipmentId
  editSelectedParameter.value = null
}

const selectEditParameter = async (parameterId) => {
  editSelectedParameter.value = parameterId
  
  try {
    // Load current value
    const data = await vibrationStore.getEquipmentData(
      editSelectedUnit.value,
      editSelectedEquipment.value,
      getCurrentDate(),
      getCurrentDate()
    )
    
    if (data.length > 0) {
      editCurrentValue.value = data[0].parameters[parameterId] || '--'
    } else {
      editCurrentValue.value = '--'
    }
    
    editInputValue.value = editCurrentValue.value === '--' ? '' : editCurrentValue.value
    
    await nextTick()
    if (editInput.value) {
      editInput.value.focus()
    }
  } catch (error) {
    window.$toast('خطا در دریافت مقدار فعلی', 'error')
  }
}

const validateInput = () => {
  // Real-time validation visual feedback
}

const validateEditInput = () => {
  // Real-time validation visual feedback
}

const validateVibrationValue = (value, parameterId) => {
  return vibrationStore.validateVibrationValue(value, parameterId)
}

const handleDataInput = async () => {
  if (!inputValue.value || !currentParameter.value) return
  
  const isValid = validateVibrationValue(inputValue.value, currentParameter.value.id)
  if (!isValid) {
    window.$toast(`مقدار باید بین 0 تا ${currentMaxValue.value} باشد`, 'error')
    return
  }
  
  isLoading.value = true
  
  try {
    // Save parameter value
    const equipmentId = currentEquipment.value.id
    const parameterId = currentParameter.value.id
    const value = parseFloat(inputValue.value)
    
    // Update local data
    if (!dataEntryState.value.dateData[equipmentId]) {
      dataEntryState.value.dateData[equipmentId] = {}
    }
    dataEntryState.value.dateData[equipmentId][parameterId] = value
    
    // Move to next parameter
    const parameters = parameterList.value
    dataEntryState.value.currentParameterIndex++
    
    if (dataEntryState.value.currentParameterIndex >= parameters.length) {
      // Last parameter of this equipment - ask for note
      await showEquipmentNoteDialog(equipmentId)
    } else {
      // Continue with next parameter
      inputValue.value = ''
      await nextTick()
      if (dataInput.value) {
        dataInput.value.focus()
      }
    }
  } catch (error) {
    window.$toast(error.message, 'error')
  } finally {
    isLoading.value = false
  }
}

const showEquipmentNoteDialog = async (equipmentId) => {
  const equipment = APP_CONFIG.equipments.find(e => e.id === equipmentId)
  const equipmentName = equipment?.name || equipmentId
  
  if (window.$confirm) {
    window.$confirm(
      'یادداشت تجهیز',
      `آیا برای ${equipmentName} یادداشتی دارید؟`,
      async () => {
        noteEquipmentId.value = equipmentId
        noteText.value = currentEquipmentNote.value
        showNoteModal.value = true
      },
      async () => {
        await finalizeEquipmentSave(equipmentId, '')
      }
    )
  } else {
    // Fallback without note
    await finalizeEquipmentSave(equipmentId, '')
  }
}

const saveEquipmentNote = async () => {
  await finalizeEquipmentSave(noteEquipmentId.value, noteText.value)
  showNoteModal.value = false
}

const finalizeEquipmentSave = async (equipmentId, notes) => {
  const equipmentData = dataEntryState.value.dateData[equipmentId]
  
  const data = {
    unit: selectedUnit.value,
    equipment: equipmentId,
    date: getCurrentDate(),
    parameters: equipmentData,
    notes: notes,
    user_id: authStore.user.id
  }
  
  try {
    await vibrationStore.saveVibrationData(data)
    
    const equipment = APP_CONFIG.equipments.find(e => e.id === equipmentId)
    window.$toast(`${equipment?.name || equipmentId} ذخیره شد`, 'success')
    
    // Reset for next equipment
    currentEquipmentNote.value = ''
    inputValue.value = ''
    
    // Move to next equipment
    const equipments = equipmentList.value
    dataEntryState.value.currentParameterIndex = 0
    dataEntryState.value.currentEquipmentIndex++
    
    if (dataEntryState.value.currentEquipmentIndex >= equipments.length) {
      window.$toast('تمام تجهیزات تکمیل شد!', 'success')
      dataEntryState.value.currentEquipmentIndex = 0
      setMode('edit')
    }
    
    await nextTick()
    if (dataInput.value) {
      dataInput.value.focus()
    }
  } catch (error) {
    window.$toast('خطا در ذخیره داده', 'error')
  }
}

const saveEditedData = async () => {
  if (!editInputValue.value || !editSelectedParameter.value) return
  
  const isValid = validateVibrationValue(editInputValue.value, editSelectedParameter.value)
  if (!isValid) {
    const maxValue = getParameterMaxValue(editSelectedParameter.value)
    window.$toast(`مقدار باید بین 0 تا ${maxValue} باشد`, 'error')
    return
  }
  
  isLoading.value = true
  
  try {
    const data = {
      unit: editSelectedUnit.value,
      equipment: editSelectedEquipment.value,
      date: getCurrentDate(),
      parameters: {
        [editSelectedParameter.value]: parseFloat(editInputValue.value)
      },
      user_id: authStore.user.id
    }
    
    await vibrationStore.saveVibrationData(data)
    
    editCurrentValue.value = parseFloat(editInputValue.value)
    window.$toast('داده با موفقیت ویرایش شد', 'success')
  } catch (error) {
    window.$toast('خطا در ذخیره داده', 'error')
  } finally {
    isLoading.value = false
  }
}

const cancelEdit = () => {
  editSelectedUnit.value = null
  editSelectedEquipment.value = null
  editSelectedParameter.value = null
  editInputValue.value = ''
}

const resetEntry = () => {
  dataEntryState.value.currentEquipmentIndex = 0
  dataEntryState.value.currentParameterIndex = 0
  inputValue.value = ''
  nextTick(() => {
    if (dataInput.value) {
      dataInput.value.focus()
    }
  })
}

const showEquipmentNote = async (equipmentId) => {
  try {
    const data = await vibrationStore.getEquipmentData(
      editSelectedUnit.value,
      equipmentId,
      getCurrentDate(),
      getCurrentDate()
    )
    
    noteEquipmentId.value = equipmentId
    noteText.value = (data.length > 0 && data[0].notes) ? data[0].notes : ''
    showNoteModal.value = true
  } catch (error) {
    window.$toast('خطا در دریافت یادداشت', 'error')
  }
}

const clearTodayCache = () => {
  if (window.$confirm) {
    window.$confirm(
      'پاک کردن کش',
      'آیا می‌خواهید کش داده‌های امروز پاک شود؟',
      () => {
        // Clear today's cache
        dataEntryState.value.dateData = {}
        dataEntryState.value.currentEquipmentIndex = 0
        dataEntryState.value.currentParameterIndex = 0
        inputValue.value = ''
        window.$toast('کش امروز پاک شد', 'success')
      }
    )
  }
}

// Helper functions
const getUnitName = (unitId) => {
  const unit = APP_CONFIG.units.find(u => u.id === unitId)
  return unit?.name || unitId
}

const getEquipmentName = (equipmentId) => {
  const equipment = APP_CONFIG.equipments.find(e => e.id === equipmentId)
  return equipment?.name || equipmentId
}

const getParameterName = (parameterId) => {
  const parameter = APP_CONFIG.parameters.find(p => p.id === parameterId)
  return parameter?.name || parameterId
}

const getParameterMaxValue = (parameterId) => {
  const parameter = APP_CONFIG.parameters.find(p => p.id === parameterId)
  return parameter?.maxValue || 20
}

// Lifecycle
onMounted(() => {
  vibrationStore.loadSettings()
  
  // Setup keyboard shortcuts
  const handleKeydown = (event) => {
    if (event.key === 'Enter' && event.target === dataInput.value) {
      handleDataInput()
    }
  }
  
  document.addEventListener('keydown', handleKeydown)
  
  return () => {
    document.removeEventListener('keydown', handleKeydown)
  }
})

// Watchers
watch(selectedUnit, (newUnit) => {
  if (newUnit) {
    vibrationStore.selectUnit(newUnit)
  }
})
</script>

<style scoped>
.unit-btn {
  @apply p-6 border-2 border-gray-200 rounded-xl bg-white hover:shadow-lg transition-all duration-200 flex flex-col items-center space-y-3 cursor-pointer;
}

.unit-btn.dri1 {
  @apply border-blue-200 hover:border-blue-400 hover:bg-blue-50;
}

.unit-btn.dri2 {
  @apply border-red-200 hover:border-red-400 hover:bg-red-50;
}

.unit-btn.selected {
  @apply transform scale-105 shadow-xl;
}

.unit-btn.selected.dri1 {
  @apply border-blue-500 bg-blue-50;
}

.unit-btn.selected.dri2 {
  @apply border-red-500 bg-red-50;
}

.data-entry-header {
  @apply bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6;
}

.data-entry-header.dri2 {
  @apply from-red-50 to-red-100 border-red-200;
}

.progress-bar {
  @apply w-full bg-gray-200 rounded-full h-3 overflow-hidden;
}

.progress-fill {
  @apply h-full bg-blue-600 transition-all duration-500 rounded-full;
}

.progress-fill.dri2 {
  @apply bg-red-600;
}

.equipment-card {
  @apply bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200;
}

.equipment-card.dri1 {
  @apply border-blue-200 hover:border-blue-400;
}

.equipment-card.dri2 {
  @apply border-red-200 hover:border-red-400;
}

.equipment-card.selected {
  @apply border-blue-500 bg-blue-50 shadow-lg;
}

.equipment-card.dri2.selected {
  @apply border-red-500 bg-red-50;
}

.parameter-card {
  @apply bg-white border-2 border-gray-200 rounded-lg p-3 text-center hover:shadow-md transition-all duration-200;
}

.parameter-card.dri1 {
  @apply border-blue-200 hover:border-blue-400;
}

.parameter-card.dri2 {
  @apply border-red-200 hover:border-red-400;
}

.parameter-card.selected {
  @apply border-blue-500 bg-blue-50 shadow-lg;
}

.parameter-card.dri2.selected {
  @apply border-red-500 bg-red-50;
}

.parameter-icon {
  @apply w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2;
}

.parameter-name {
  @apply font-medium text-sm mb-1;
}

.parameter-code {
  @apply text-xs text-gray-500;
}
</style>