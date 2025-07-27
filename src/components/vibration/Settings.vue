<template>
  <div class="space-y-6">
    <!-- User Info -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-center space-x-3 space-x-reverse">
        <i class="fas fa-user text-blue-600"></i>
        <span class="text-blue-800">
          کاربر فعلی: <strong>{{ authStore.profile?.full_name || 'کاربر میهمان' }}</strong>
        </span>
      </div>
    </div>

    <!-- Theme Settings -->
    <div class="card">
      <div class="card-header">
        <h3 class="font-semibold text-gray-900">تنظیمات ظاهری</h3>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="form-label">تم:</label>
            <select v-model="localSettings.theme" @change="saveSettings" class="form-control">
              <option value="light">روشن</option>
              <option value="dark">تاریک</option>
              <option value="auto">خودکار</option>
            </select>
          </div>
          
          <div>
            <label class="form-label">رنگ اصلی:</label>
            <input 
              v-model="localSettings.primaryColor" 
              @change="saveSettings"
              type="color" 
              class="form-control h-12"
            >
          </div>
          
          <div>
            <label class="form-label">رنگ DRI1:</label>
            <input 
              v-model="localSettings.dri1Color" 
              @change="saveSettings"
              type="color" 
              class="form-control h-12"
            >
          </div>
          
          <div>
            <label class="form-label">رنگ DRI2:</label>
            <input 
              v-model="localSettings.dri2Color" 
              @change="saveSettings"
              type="color" 
              class="form-control h-12"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Parameter Settings -->
    <div class="card">
      <div class="card-header">
        <h3 class="font-semibold text-gray-900">تنظیمات پارامترها</h3>
      </div>
      <div class="card-body">
        <div class="mb-4">
          <label class="form-label">حالت نمایش پارامترها:</label>
          <select v-model="localSettings.parameterMode" @change="saveSettings" class="form-control">
            <option value="default">ترتیب پیش‌فرض</option>
            <option value="velocity-first">سرعت اول</option>
            <option value="custom">ترتیب سفارشی</option>
          </select>
        </div>
        
        <!-- Custom Parameter Order -->
        <div v-if="localSettings.parameterMode === 'custom'" class="mt-4">
          <label class="form-label">ترتیب پارامترها:</label>
          <div class="parameter-reorder-list">
            <div
              v-for="(parameter, index) in sortedParameters"
              :key="parameter.id"
              class="parameter-item"
              draggable="true"
              @dragstart="handleDragStart(parameter, index)"
              @dragover="handleDragOver"
              @drop="handleDrop(index)"
            >
              <div class="flex items-center space-x-3 space-x-reverse">
                <div class="drag-handle">
                  <i class="fas fa-grip-vertical text-gray-400"></i>
                </div>
                <div class="parameter-info flex-1">
                  <div class="flex items-center space-x-2 space-x-reverse">
                    <i :class="parameter.icon" :style="{ color: parameter.color }"></i>
                    <span class="font-medium">{{ parameter.name }}</span>
                    <span class="text-sm text-gray-500">({{ parameter.code }})</span>
                  </div>
                </div>
                <div class="parameter-order">
                  <span class="text-sm text-gray-600">{{ index + 1 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Equipment Priority Settings -->
    <div class="card">
      <div class="card-header">
        <h3 class="font-semibold text-gray-900">اولویت تجهیزات</h3>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- DRI1 Equipment Order -->
          <div>
            <h4 class="font-medium text-blue-600 mb-4">واحد DRI1</h4>
            <div class="equipment-list">
              <div
                v-for="(equipment, index) in getDRI1Equipment"
                :key="equipment.id + '_DRI1'"
                class="equipment-item dri1"
                draggable="true"
                @dragstart="handleEquipmentDragStart(equipment, 'DRI1', index)"
                @dragover="handleDragOver"
                @drop="handleEquipmentDrop('DRI1', index)"
              >
                <div class="flex items-center space-x-3 space-x-reverse">
                  <div class="drag-handle">
                    <i class="fas fa-grip-vertical text-blue-400"></i>
                  </div>
                  <div class="equipment-info flex-1">
                    <div class="flex items-center space-x-2 space-x-reverse">
                      <i :class="equipment.icon" :style="{ color: equipment.color }"></i>
                      <span class="font-medium">{{ equipment.name }}</span>
                    </div>
                    <div class="text-sm text-gray-500">{{ equipment.code }}</div>
                  </div>
                  <div class="equipment-order">
                    <span class="text-sm text-blue-600">{{ index + 1 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- DRI2 Equipment Order -->
          <div>
            <h4 class="font-medium text-red-600 mb-4">واحد DRI2</h4>
            <div class="equipment-list">
              <div
                v-for="(equipment, index) in getDRI2Equipment"
                :key="equipment.id + '_DRI2'"
                class="equipment-item dri2"
                draggable="true"
                @dragstart="handleEquipmentDragStart(equipment, 'DRI2', index)"
                @dragover="handleDragOver"
                @drop="handleEquipmentDrop('DRI2', index)"
              >
                <div class="flex items-center space-x-3 space-x-reverse">
                  <div class="drag-handle">
                    <i class="fas fa-grip-vertical text-red-400"></i>
                  </div>
                  <div class="equipment-info flex-1">
                    <div class="flex items-center space-x-2 space-x-reverse">
                      <i :class="equipment.icon" :style="{ color: equipment.color }"></i>
                      <span class="font-medium">{{ equipment.name }}</span>
                    </div>
                    <div class="text-sm text-gray-500">{{ equipment.code }}</div>
                  </div>
                  <div class="equipment-order">
                    <span class="text-sm text-red-600">{{ index + 1 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Entry Settings -->
    <div class="card">
      <div class="card-header">
        <h3 class="font-semibold text-gray-900">تنظیمات ثبت داده</h3>
      </div>
      <div class="card-body">
        <div class="mb-4">
          <label class="form-label">حالت نمایش پارامترها در ثبت داده:</label>
          <select v-model="localSettings.dataEntryParameterMode" @change="saveSettings" class="form-control">
            <option value="default">ترتیب پیش‌فرض</option>
            <option value="velocity-first">سرعت اول</option>
            <option value="custom">ترتیب سفارشی</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Analysis Settings -->
    <div class="card">
      <div class="card-header">
        <h3 class="font-semibold text-gray-900">تنظیمات آنالیز</h3>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="form-label">حد آستانه (درصد):</label>
            <input 
              v-model.number="localSettings.analysisThreshold" 
              @change="saveSettings"
              type="number" 
              min="1" 
              max="100" 
              class="form-control"
            >
          </div>
          
          <div>
            <label class="form-label">بازه زمانی (روز):</label>
            <input 
              v-model.number="localSettings.analysisTimeRange" 
              @change="saveSettings"
              type="number" 
              min="1" 
              max="30" 
              class="form-control"
            >
          </div>
          
          <div>
            <label class="form-label">مقایسه با (روز قبل):</label>
            <input 
              v-model.number="localSettings.analysisComparisonDays" 
              @change="saveSettings"
              type="number" 
              min="1" 
              max="10" 
              class="form-control"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="card">
      <div class="card-header">
        <h3 class="font-semibold text-gray-900">عملیات</h3>
      </div>
      <div class="card-body">
        <div class="flex space-x-4 space-x-reverse">
          <button @click="resetToDefaults" class="btn btn-warning">
            <i class="fas fa-undo ml-2"></i>
            بازگردانی به حالت اولیه
          </button>
          
          <button @click="exportSettings" class="btn btn-success">
            <i class="fas fa-download ml-2"></i>
            خروجی تنظیمات
          </button>
          
          <button @click="showImportModal = true" class="btn btn-primary">
            <i class="fas fa-upload ml-2"></i>
            بارگذاری تنظیمات
          </button>
        </div>
      </div>
    </div>

    <!-- Import Settings Modal -->
    <div v-if="showImportModal" class="modal-backdrop" @click.self="showImportModal = false">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">بارگذاری تنظیمات</h3>
          <button @click="showImportModal = false" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="form-label">فایل تنظیمات:</label>
            <input 
              ref="importInput"
              type="file" 
              accept=".json"
              @change="handleImportFile"
              class="form-control"
            >
          </div>
          
          <div class="flex space-x-3 space-x-reverse">
            <button 
              @click="importSettings"
              :disabled="!importedSettings"
              class="btn btn-success flex-1"
            >
              <i class="fas fa-check ml-2"></i>
              اعمال تنظیمات
            </button>
            <button 
              @click="showImportModal = false"
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
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useVibrationStore } from '@/stores/vibration'
import { APP_CONFIG } from '@/utils/constants'

const authStore = useAuthStore()
const vibrationStore = useVibrationStore()

// State
const localSettings = ref({})
const showImportModal = ref(false)
const importedSettings = ref(null)
const importInput = ref(null)
const draggedItem = ref(null)
const draggedItemIndex = ref(null)

// Computed
const sortedParameters = computed(() => {
  return APP_CONFIG.parameters
    .slice()
    .sort((a, b) => {
      const aPriority = localSettings.value.parameterPriority[a.id] || a.order
      const bPriority = localSettings.value.parameterPriority[b.id] || b.order
      return aPriority - bPriority
    })
})

const getDRI1Equipment = computed(() => {
  return APP_CONFIG.equipments
    .slice()
    .sort((a, b) => {
      const aPriority = localSettings.value.equipmentPriority[`${a.id}_DRI1`] || 0
      const bPriority = localSettings.value.equipmentPriority[`${b.id}_DRI1`] || 0
      return aPriority - bPriority
    })
})

const getDRI2Equipment = computed(() => {
  return APP_CONFIG.equipments
    .slice()
    .sort((a, b) => {
      const aPriority = localSettings.value.equipmentPriority[`${a.id}_DRI2`] || 0
      const bPriority = localSettings.value.equipmentPriority[`${b.id}_DRI2`] || 0
      return aPriority - bPriority
    })
})

// Methods
const loadSettings = () => {
  localSettings.value = { ...vibrationStore.settings }
}

const saveSettings = () => {
  try {
    // Update store settings
    Object.assign(vibrationStore.settings, localSettings.value)
    
    // Save to localStorage
    vibrationStore.saveSettings()
    
    window.$toast('تنظیمات ذخیره شد', 'success')
  } catch (error) {
    window.$toast('خطا در ذخیره تنظیمات', 'error')
  }
}

const resetToDefaults = () => {
  if (window.$confirm) {
    window.$confirm(
      'بازگردانی تنظیمات',
      'آیا می‌خواهید تمام تنظیمات به حالت اولیه بازگردانده شود؟',
      () => {
        vibrationStore.resetSettings()
        loadSettings()
        window.$toast('تنظیمات به حالت اولیه بازگردانده شد', 'success')
      }
    )
  }
}

const exportSettings = () => {
  try {
    const settingsJson = JSON.stringify(localSettings.value, null, 2)
    const blob = new Blob([settingsJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `vibration-settings-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(url)
    
    window.$toast('تنظیمات با موفقیت دانلود شد', 'success')
  } catch (error) {
    window.$toast('خطا در دانلود تنظیمات', 'error')
  }
}

const handleImportFile = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      importedSettings.value = JSON.parse(e.target.result)
      window.$toast('فایل بارگذاری شد', 'success')
    } catch (error) {
      window.$toast('فایل معتبر نیست', 'error')
      importedSettings.value = null
    }
  }
  reader.readAsText(file)
}

const importSettings = () => {
  if (!importedSettings.value) return
  
  try {
    localSettings.value = { ...importedSettings.value }
    saveSettings()
    
    showImportModal.value = false
    importedSettings.value = null
    if (importInput.value) {
      importInput.value.value = ''
    }
    
    window.$toast('تنظیمات با موفقیت بارگذاری شد', 'success')
  } catch (error) {
    window.$toast('خطا در بارگذاری تنظیمات', 'error')
  }
}

// Drag and Drop for Parameters
const handleDragStart = (parameter, index) => {
  draggedItem.value = parameter
  draggedItemIndex.value = index
}

const handleDragOver = (event) => {
  event.preventDefault()
}

const handleDrop = (dropIndex) => {
  if (draggedItem.value && draggedItemIndex.value !== null) {
    const draggedIndex = draggedItemIndex.value
    
    // Swap priorities
    const parameters = sortedParameters.value
    const newPriorities = {}
    
    parameters.forEach((param, index) => {
      let newIndex = index
      
      if (index === draggedIndex) {
        newIndex = dropIndex
      } else if (index === dropIndex) {
        newIndex = draggedIndex
      }
      
      newPriorities[param.id] = newIndex + 1
    })
    
    localSettings.value.parameterPriority = newPriorities
    saveSettings()
    
    draggedItem.value = null
    draggedItemIndex.value = null
  }
}

// Drag and Drop for Equipment
const handleEquipmentDragStart = (equipment, unit, index) => {
  draggedItem.value = equipment
  draggedItemIndex.value = index
  draggedItem.value.unit = unit
}

const handleEquipmentDrop = (unit, dropIndex) => {
  if (draggedItem.value && draggedItemIndex.value !== null && draggedItem.value.unit === unit) {
    const draggedIndex = draggedItemIndex.value
    
    // Get current equipment list for this unit
    const equipmentList = unit === 'DRI1' ? getDRI1Equipment.value : getDRI2Equipment.value
    const newPriorities = {}
    
    equipmentList.forEach((eq, index) => {
      let newIndex = index
      
      if (index === draggedIndex) {
        newIndex = dropIndex
      } else if (index === dropIndex) {
        newIndex = draggedIndex
      }
      
      newPriorities[`${eq.id}_${unit}`] = newIndex + 1
    })
    
    // Update equipment priorities
    Object.assign(localSettings.value.equipmentPriority, newPriorities)
    saveSettings()
    
    draggedItem.value = null
    draggedItemIndex.value = null
  }
}

// Lifecycle
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.parameter-reorder-list,
.equipment-list {
  @apply space-y-3;
}

.parameter-item,
.equipment-item {
  @apply bg-white border border-gray-200 rounded-lg p-4 cursor-move hover:shadow-md transition-all duration-200;
}

.equipment-item.dri1 {
  @apply border-blue-200 hover:border-blue-400;
}

.equipment-item.dri2 {
  @apply border-red-200 hover:border-red-400;
}

.drag-handle {
  @apply cursor-grab active:cursor-grabbing;
}

.parameter-info,
.equipment-info {
  @apply flex-1;
}

.parameter-order,
.equipment-order {
  @apply w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold;
}

/* Drag and drop visual feedback */
.parameter-item:hover,
.equipment-item:hover {
  @apply transform -translate-y-1;
}

.parameter-item.dragging,
.equipment-item.dragging {
  @apply opacity-50 transform rotate-2;
}
</style>