<template>
  <div class="space-y-6">
    <!-- Slideshow Controls -->
    <div class="card">
      <div class="card-header">
        <h3 class="font-semibold text-gray-900">کنترل اسلایدشو</h3>
        <div class="flex space-x-2 space-x-reverse">
          <button 
            @click="toggleFullscreen"
            class="btn btn-primary btn-sm"
            :class="{ 'btn-error': slideshowState.isFullscreen }"
          >
            <i :class="slideshowState.isFullscreen ? 'fas fa-compress' : 'fas fa-expand'" class="ml-2"></i>
            {{ slideshowState.isFullscreen ? 'خروج از تمام صفحه' : 'تمام صفحه' }}
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="form-label">تاریخ:</label>
            <input 
              v-model="slideshowSettings.date"
              type="date" 
              class="form-control"
              :disabled="slideshowState.isRunning"
            >
          </div>
          
          <div>
            <label class="form-label">سرعت (ثانیه):</label>
            <input 
              v-model.number="slideshowSettings.speed"
              @change="updateSpeed"
              type="number" 
              min="1" 
              max="10" 
              class="form-control"
            >
          </div>
        </div>
        
        <div class="flex justify-center space-x-4 space-x-reverse">
          <button 
            @click="startSlideshow"
            :disabled="slideshowState.isRunning || isLoading"
            class="btn btn-success"
          >
            <LoadingSpinner v-if="isLoading" size="sm" color="white" class="ml-2" />
            <i v-else class="fas fa-play ml-2"></i>
            شروع
          </button>
          
          <button 
            @click="pauseSlideshow"
            :disabled="!slideshowState.isRunning || slideshowState.isPaused"
            class="btn btn-warning"
          >
            <i class="fas fa-pause ml-2"></i>
            توقف
          </button>
          
          <button 
            @click="resumeSlideshow"
            :disabled="!slideshowState.isRunning || !slideshowState.isPaused"
            class="btn btn-primary"
          >
            <i class="fas fa-play ml-2"></i>
            ادامه
          </button>
          
          <button 
            @click="stopSlideshow"
            :disabled="!slideshowState.isRunning"
            class="btn btn-error"
          >
            <i class="fas fa-stop ml-2"></i>
            پایان
          </button>
        </div>
      </div>
    </div>

    <!-- Slideshow Display -->
    <div class="slideshow-container" :class="{ 'fullscreen': slideshowState.isFullscreen }">
      <div v-if="slideshowState.isFullscreen" class="fullscreen-header">
        <h2 class="text-white text-2xl font-bold">اسلایدشو داده‌های ویبره</h2>
        <button @click="toggleFullscreen" class="btn btn-error">
          <i class="fas fa-times ml-2"></i>
          خروج از تمام صفحه
        </button>
      </div>
      
      <div class="slideshow-display">
        <div class="slideshow-content">
          <!-- Equipment Name -->
          <div class="slideshow-equipment" :class="getUnitClass()">
            {{ currentDisplay.equipment }}
          </div>
          
          <!-- Parameter Name -->
          <div class="slideshow-parameter">
            {{ currentDisplay.parameter }}
          </div>
          
          <!-- Value Display -->
          <div 
            class="slideshow-value"
            :style="{ color: slideshowState.currentValueColor }"
          >
            {{ currentDisplay.value }}
          </div>
          
          <!-- Unit Display -->
          <div class="slideshow-unit">
            {{ currentDisplay.unit }}
          </div>
          
          <!-- Progress Indicator -->
          <div v-if="slideshowState.isRunning" class="slideshow-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: progressPercentage + '%' }"
                :class="getUnitClass()"
              ></div>
            </div>
            <div class="progress-text">
              {{ currentSlideIndex }} از {{ totalSlides }}
            </div>
          </div>
          
          <!-- Status Indicator -->
          <div class="slideshow-status">
            <div v-if="!slideshowState.isRunning" class="status-indicator idle">
              <i class="fas fa-play"></i>
              <span>آماده برای شروع</span>
            </div>
            <div v-else-if="slideshowState.isPaused" class="status-indicator paused">
              <i class="fas fa-pause"></i>
              <span>متوقف شده</span>
            </div>
            <div v-else class="status-indicator running">
              <i class="fas fa-play"></i>
              <span>در حال اجرا</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Slideshow Info -->
    <div v-if="slideshowState.isRunning" class="card">
      <div class="card-header">
        <h3 class="font-semibold text-gray-900">اطلاعات اسلایدشو</h3>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-4 bg-blue-50 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">{{ totalSlides }}</div>
            <div class="text-sm text-blue-800">کل اسلایدها</div>
          </div>
          <div class="text-center p-4 bg-green-50 rounded-lg">
            <div class="text-2xl font-bold text-green-600">{{ currentSlideIndex }}</div>
            <div class="text-sm text-green-800">اسلاید فعلی</div>
          </div>
          <div class="text-center p-4 bg-purple-50 rounded-lg">
            <div class="text-2xl font-bold text-purple-600">{{ slideshowSettings.speed }}s</div>
            <div class="text-sm text-purple-800">سرعت</div>
          </div>
          <div class="text-center p-4 bg-yellow-50 rounded-lg">
            <div class="text-2xl font-bold text-yellow-600">{{ estimatedTime }}</div>
            <div class="text-sm text-yellow-800">زمان باقی‌مانده</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Equipment Confirmation Modal -->
    <div v-if="showConfirmModal" class="modal-backdrop" @click.self="cancelConfirmation">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center ml-4">
            <i class="fas fa-question text-blue-600 text-xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">تجهیز بعدی</h3>
        </div>
        
        <div class="mb-6">
          <p class="text-gray-700">{{ confirmMessage }}</p>
        </div>
        
        <div class="flex space-x-3 space-x-reverse">
          <button @click="confirmNextEquipment" class="btn btn-success flex-1">
            <i class="fas fa-check ml-2"></i>
            بله
          </button>
          <button @click="cancelConfirmation" class="btn btn-error flex-1">
            <i class="fas fa-times ml-2"></i>
            متوقف کن
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useVibrationStore } from '@/stores/vibration'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { APP_CONFIG } from '@/utils/constants'
import { getCurrentDate, formatPersianDate, generateRandomColor } from '@/utils/helpers'

const vibrationStore = useVibrationStore()

// State
const isLoading = ref(false)
const showConfirmModal = ref(false)
const confirmMessage = ref('')

const slideshowSettings = ref({
  date: getCurrentDate(),
  speed: 3
})

// Computed
const slideshowState = computed(() => vibrationStore.slideshowState)

const currentDisplay = computed(() => {
  if (!slideshowState.value.isRunning) {
    return {
      equipment: 'اسلایدشو را شروع کنید',
      parameter: 'تاریخ را انتخاب کنید',
      value: '--',
      unit: ''
    }
  }
  
  const equipments = getEquipmentsByPriority()
  const parameters = getParametersByPriority()
  
  const currentEquipment = equipments[slideshowState.value.currentEquipmentIndex]
  const currentParameter = parameters[slideshowState.value.currentParameterIndex]
  
  if (!currentEquipment || !currentParameter) {
    return {
      equipment: 'پایان اسلایدشو',
      parameter: '',
      value: '--',
      unit: ''
    }
  }
  
  const dataKey = `${currentEquipment.id}_${currentEquipment.unit}`
  const value = slideshowState.value.data[dataKey]?.[currentParameter.id]
  const unit = currentParameter.type === 'velocity' ? 'mm/s' : 'g'
  
  return {
    equipment: currentEquipment.name,
    parameter: `${currentParameter.name} (${currentParameter.code})`,
    value: value !== undefined ? value : '--',
    unit: unit
  }
})

const totalSlides = computed(() => {
  const equipments = getEquipmentsByPriority()
  const parameters = getParametersByPriority()
  return equipments.length * parameters.length
})

const currentSlideIndex = computed(() => {
  if (!slideshowState.value.isRunning) return 0
  
  const parameters = getParametersByPriority()
  return (slideshowState.value.currentEquipmentIndex * parameters.length) + 
         slideshowState.value.currentParameterIndex + 1
})

const progressPercentage = computed(() => {
  if (totalSlides.value === 0) return 0
  return Math.round((currentSlideIndex.value / totalSlides.value) * 100)
})

const estimatedTime = computed(() => {
  if (!slideshowState.value.isRunning) return '0m'
  
  const remainingSlides = totalSlides.value - currentSlideIndex.value
  const remainingSeconds = remainingSlides * slideshowSettings.value.speed
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
})

// Methods
const getEquipmentsByPriority = () => {
  return vibrationStore.equipmentsByPriority
}

const getParametersByPriority = () => {
  return vibrationStore.parametersByPriority
}

const getUnitClass = () => {
  const equipments = getEquipmentsByPriority()
  const currentEquipment = equipments[slideshowState.value.currentEquipmentIndex]
  
  if (!currentEquipment?.unit) return ''
  
  return currentEquipment.unit === 'DRI1' ? 'dri1' : 'dri2'
}

const startSlideshow = async () => {
  if (!slideshowSettings.value.date) {
    window.$toast('لطفاً تاریخ را انتخاب کنید', 'error')
    return
  }
  
  isLoading.value = true
  
  try {
    await vibrationStore.startSlideshow(slideshowSettings.value.date)
    
    // Start slideshow interval
    startSlideshowInterval()
    
    window.$toast('اسلایدشو شروع شد', 'success')
  } catch (error) {
    window.$toast(error.message, 'error')
  } finally {
    isLoading.value = false
  }
}

const startSlideshowInterval = () => {
  slideshowState.value.interval = setInterval(() => {
    showNextSlide()
  }, slideshowSettings.value.speed * 1000)
  
  showNextSlide()
}

const showNextSlide = () => {
  const equipments = getEquipmentsByPriority()
  const parameters = getParametersByPriority()
  
  if (slideshowState.value.currentEquipmentIndex >= equipments.length) {
    stopSlideshow()
    return
  }
  
  // Update value color with random color
  slideshowState.value.currentValueColor = generateRandomColor()
  
  // Move to next parameter
  slideshowState.value.currentParameterIndex++
  
  if (slideshowState.value.currentParameterIndex >= parameters.length) {
    // Last parameter of current equipment - ask for confirmation
    clearInterval(slideshowState.value.interval)
    slideshowState.value.currentParameterIndex = 0
    slideshowState.value.currentEquipmentIndex++
    
    if (slideshowState.value.currentEquipmentIndex < equipments.length) {
      showEquipmentConfirmation()
    } else {
      stopSlideshow()
    }
  }
}

const showEquipmentConfirmation = () => {
  const equipments = getEquipmentsByPriority()
  const nextEquipment = equipments[slideshowState.value.currentEquipmentIndex]
  
  if (!nextEquipment) return
  
  confirmMessage.value = `آیا به تجهیز ${nextEquipment.name} بروم؟`
  showConfirmModal.value = true
}

const confirmNextEquipment = () => {
  showConfirmModal.value = false
  
  if (slideshowState.value.isRunning) {
    startSlideshowInterval()
  }
}

const cancelConfirmation = () => {
  showConfirmModal.value = false
  stopSlideshow()
}

const pauseSlideshow = () => {
  vibrationStore.pauseSlideshow()
  clearInterval(slideshowState.value.interval)
  window.$toast('اسلایدشو متوقف شد', 'warning')
}

const resumeSlideshow = () => {
  vibrationStore.resumeSlideshow()
  startSlideshowInterval()
  window.$toast('اسلایدشو ادامه یافت', 'success')
}

const stopSlideshow = () => {
  vibrationStore.stopSlideshow()
  clearInterval(slideshowState.value.interval)
  showConfirmModal.value = false
  window.$toast('اسلایدشو پایان یافت', 'info')
}

const updateSpeed = () => {
  if (slideshowState.value.isRunning && !slideshowState.value.isPaused) {
    clearInterval(slideshowState.value.interval)
    startSlideshowInterval()
  }
}

const toggleFullscreen = () => {
  slideshowState.value.isFullscreen = !slideshowState.value.isFullscreen
  
  if (slideshowState.value.isFullscreen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// Lifecycle
onMounted(() => {
  // Keyboard shortcuts
  const handleKeydown = (event) => {
    if (event.key === ' ' || event.key === 'Spacebar') { // Space bar
      event.preventDefault()
      if (slideshowState.value.isRunning) {
        if (slideshowState.value.isPaused) {
          resumeSlideshow()
        } else {
          pauseSlideshow()
        }
      }
    } else if (event.key === 'Escape') {
      if (slideshowState.value.isFullscreen) {
        toggleFullscreen()
      } else if (slideshowState.value.isRunning) {
        stopSlideshow()
      }
    }
  }
  
  document.addEventListener('keydown', handleKeydown)
  
  return () => {
    document.removeEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  clearInterval(slideshowState.value.interval)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.slideshow-container {
  @apply bg-white rounded-xl border border-gray-200 p-8 text-center relative overflow-hidden min-h-96;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.slideshow-container.fullscreen {
  @apply fixed inset-0 bg-gray-900 z-50 flex flex-col;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

.fullscreen-header {
  @apply flex justify-between items-center p-6 border-b border-gray-700;
}

.slideshow-display {
  @apply flex-1 flex items-center justify-center;
}

.slideshow-content {
  @apply space-y-6;
}

.slideshow-equipment {
  @apply text-3xl font-bold text-gray-900 mb-4;
  transition: all 0.5s ease;
}

.slideshow-container.fullscreen .slideshow-equipment {
  @apply text-5xl text-white;
}

.slideshow-equipment.dri1 {
  @apply text-blue-600;
}

.slideshow-equipment.dri2 {
  @apply text-red-600;
}

.slideshow-parameter {
  @apply text-xl text-gray-600 mb-6;
  transition: all 0.5s ease;
}

.slideshow-container.fullscreen .slideshow-parameter {
  @apply text-3xl text-gray-300;
}

.slideshow-value {
  @apply text-6xl font-bold mb-4;
  text-shadow: 0 0 20px currentColor;
  animation: valueGlow 2s ease-in-out infinite alternate;
  transition: all 0.5s ease;
}

.slideshow-container.fullscreen .slideshow-value {
  @apply text-8xl;
}

@keyframes valueGlow {
  from {
    text-shadow: 0 0 20px currentColor;
    transform: scale(1);
  }
  to {
    text-shadow: 0 0 30px currentColor;
    transform: scale(1.02);
  }
}

.slideshow-unit {
  @apply text-lg text-gray-500 mb-8;
  transition: all 0.5s ease;
}

.slideshow-container.fullscreen .slideshow-unit {
  @apply text-2xl text-gray-400;
}

.slideshow-progress {
  @apply space-y-4;
}

.progress-bar {
  @apply w-full bg-gray-300 rounded-full h-3 overflow-hidden;
}

.slideshow-container.fullscreen .progress-bar {
  @apply h-4;
}

.progress-fill {
  @apply h-full bg-blue-600 transition-all duration-500 rounded-full;
}

.progress-fill.dri1 {
  @apply bg-blue-600;
}

.progress-fill.dri2 {
  @apply bg-red-600;
}

.progress-text {
  @apply text-sm text-gray-600;
}

.slideshow-container.fullscreen .progress-text {
  @apply text-lg text-gray-400;
}

.slideshow-status {
  @apply mt-8;
}

.status-indicator {
  @apply inline-flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-full text-sm font-medium;
}

.status-indicator.idle {
  @apply bg-gray-100 text-gray-700;
}

.status-indicator.running {
  @apply bg-green-100 text-green-700;
}

.status-indicator.paused {
  @apply bg-yellow-100 text-yellow-700;
}

.slideshow-container.fullscreen .status-indicator {
  @apply text-lg px-6 py-3;
}

.slideshow-container.fullscreen .status-indicator.idle {
  @apply bg-gray-800 text-gray-300;
}

.slideshow-container.fullscreen .status-indicator.running {
  @apply bg-green-800 text-green-300;
}

.slideshow-container.fullscreen .status-indicator.paused {
  @apply bg-yellow-800 text-yellow-300;
}
</style>