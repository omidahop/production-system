<template>
  <div class="space-y-6">
    <!-- Analysis Settings -->
    <div class="card">
      <div class="card-header">
        <h3 class="font-semibold text-gray-900">تنظیمات آنالیز</h3>
        <button @click="refreshAnalysis" class="btn btn-primary btn-sm" :disabled="isLoading">
          <LoadingSpinner v-if="isLoading" size="sm" color="white" class="ml-2" />
          <i v-else class="fas fa-sync ml-2"></i>
          به‌روزرسانی
        </button>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="form-label">حد آستانه افزایش (درصد):</label>
            <input 
              v-model.number="analysisSettings.threshold"
              @change="refreshAnalysis"
              type="number" 
              min="1" 
              max="100" 
              class="form-control"
            >
            <small class="text-gray-500">حداقل درصد افزایش برای نمایش هشدار</small>
          </div>
          
          <div>
            <label class="form-label">بازه زمانی بررسی (روز):</label>
            <input 
              v-model.number="analysisSettings.timeRange"
              @change="refreshAnalysis"
              type="number" 
              min="1" 
              max="30" 
              class="form-control"
            >
            <small class="text-gray-500">چند روز گذشته بررسی شود</small>
          </div>
          
          <div>
            <label class="form-label">مقایسه با (روز قبل):</label>
            <input 
              v-model.number="analysisSettings.comparisonDays"
              @change="refreshAnalysis"
              type="number" 
              min="1" 
              max="10" 
              class="form-control"
            >
            <small class="text-gray-500">با چند روز قبل مقایسه شود</small>
          </div>
        </div>
      </div>
    </div>

    <!-- User Info -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-center space-x-3 space-x-reverse">
        <i class="fas fa-user text-blue-600"></i>
        <span class="text-blue-800">
          کاربر فعلی: <strong>{{ authStore.profile?.full_name || 'کاربر میهمان' }}</strong>
        </span>
      </div>
    </div>

    <!-- Analysis Summary -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <i class="fas fa-exclamation-triangle text-red-500 text-xl"></i>
        </div>
        <div class="text-2xl font-bold text-red-600">{{ criticalAnomalies }}</div>
        <div class="text-sm text-gray-600">هشدار بحرانی</div>
      </div>
      
      <div class="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <i class="fas fa-exclamation-circle text-yellow-500 text-xl"></i>
        </div>
        <div class="text-2xl font-bold text-yellow-600">{{ warningAnomalies }}</div>
        <div class="text-sm text-gray-600">هشدار متوسط</div>
      </div>
      
      <div class="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <i class="fas fa-check-circle text-green-500 text-xl"></i>
        </div>
        <div class="text-2xl font-bold text-green-600">{{ normalEquipment }}</div>
        <div class="text-sm text-gray-600">تجهیزات عادی</div>
      </div>
      
      <div class="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <i class="fas fa-chart-bar text-blue-500 text-xl"></i>
        </div>
        <div class="text-2xl font-bold text-blue-600">{{ totalAnalyzed }}</div>
        <div class="text-sm text-gray-600">کل تجهیزات</div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <LoadingSpinner size="lg" />
      <p class="mt-4 text-gray-600">در حال آنالیز داده‌ها...</p>
    </div>

    <!-- No Anomalies -->
    <div v-else-if="anomalies.length === 0" class="text-center py-12">
      <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <i class="fas fa-check-circle text-4xl text-green-500"></i>
      </div>
      <h3 class="text-2xl font-bold text-gray-900 mb-2">عالی!</h3>
      <p class="text-gray-600 mb-6">هیچ افزایش غیرعادی‌ای در تجهیزات یافت نشد.</p>
      <p class="text-sm text-gray-500">
        تمام پارامترها در محدوده طبیعی (کمتر از {{ analysisSettings.threshold }}% افزایش) قرار دارند.
      </p>
    </div>

    <!-- Anomalies List -->
    <div v-else class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900">
        موارد مشکوک یافت شده ({{ anomalies.length }} مورد)
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="anomaly in anomalies"
          :key="`${anomaly.unit}-${anomaly.equipment}-${anomaly.parameter}`"
          @click="navigateToChart(anomaly)"
          class="analysis-card cursor-pointer"
          :class="[
            anomaly.unit === 'DRI1' ? 'dri1-style' : 'dri2-style',
            getSeverityClass(anomaly.increasePercentage)
          ]"
        >
          <div class="analysis-card-header">
            <div class="analysis-icon">
              <i :class="getParameterIcon(anomaly.parameter)" :style="{ color: getParameterColor(anomaly.parameter) }"></i>
            </div>
            <div class="severity-badge" :class="getSeverityClass(anomaly.increasePercentage)">
              {{ getSeverityText(anomaly.increasePercentage) }}
            </div>
          </div>
          
          <div class="analysis-card-body">
            <h4 class="analysis-title">{{ anomaly.parameterName }}</h4>
            <div class="analysis-equipment">
              <strong>{{ getEquipmentName(anomaly.equipment) }}</strong>
              <span class="text-sm text-gray-500">- {{ getUnitName(anomaly.unit) }}</span>
            </div>
            
            <div class="analysis-values">
              <div class="grid grid-cols-2 gap-4 mt-4">
                <div class="analysis-value-item">
                  <span class="analysis-label">مقدار فعلی:</span>
                  <span class="analysis-value current-value">{{ anomaly.currentValue }}</span>
                </div>
                <div class="analysis-value-item">
                  <span class="analysis-label">مقدار قبلی:</span>
                  <span class="analysis-value">{{ anomaly.previousValue }}</span>
                </div>
                <div class="analysis-value-item">
                  <span class="analysis-label">میزان افزایش:</span>
                  <span class="analysis-value increase-amount">+{{ anomaly.increaseAmount }}</span>
                </div>
                <div class="analysis-value-item">
                  <span class="analysis-label">درصد افزایش:</span>
                  <span class="analysis-value increase-percentage">+{{ anomaly.increasePercentage }}%</span>
                </div>
              </div>
            </div>
            
            <div class="analysis-date">
              <i class="fas fa-calendar ml-1"></i>
              {{ formatPersianDate(anomaly.date) }}
            </div>
          </div>
          
          <div class="analysis-card-footer">
            <span class="analysis-action-hint">
              <i class="fas fa-chart-line ml-1"></i>
              برای مشاهده نمودار کلیک کنید
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Analysis -->
    <div v-if="anomalies.length > 0" class="card">
      <div class="card-header">
        <h3 class="font-semibold text-gray-900">تحلیل تفصیلی</h3>
      </div>
      <div class="card-body">
        <div class="space-y-4">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 class="font-semibold text-red-800 mb-2">توصیه‌های ایمنی:</h4>
            <ul class="list-disc list-inside text-red-700 space-y-1">
              <li>تجهیزات با افزایش بیش از 50% نیاز به بررسی فوری دارند</li>
              <li>پارامترهای شتاب حساس‌تر از سرعت هستند</li>
              <li>افزایش همزمان چند پارامتر نشانه مشکل جدی است</li>
            </ul>
          </div>
          
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 class="font-semibold text-blue-800 mb-2">اقدامات پیشنهادی:</h4>
            <ul class="list-disc list-inside text-blue-700 space-y-1">
              <li>بررسی فیزیکی تجهیزات مشکوک</li>
              <li>کنترل روانکاری و تنظیمات</li>
              <li>رصد مستمر پارامترهای مشکوک</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useVibrationStore } from '@/stores/vibration'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { APP_CONFIG } from '@/utils/constants'
import { formatPersianDate } from '@/utils/helpers'

const router = useRouter()
const authStore = useAuthStore()
const vibrationStore = useVibrationStore()

// State
const isLoading = ref(false)
const anomalies = ref([])

const analysisSettings = ref({
  threshold: 20,
  timeRange: 7,
  comparisonDays: 1
})

// Computed
const criticalAnomalies = computed(() => 
  anomalies.value.filter(a => a.increasePercentage >= 50).length
)

const warningAnomalies = computed(() => 
  anomalies.value.filter(a => a.increasePercentage >= 30 && a.increasePercentage < 50).length
)

const normalEquipment = computed(() => {
  const totalEquipment = APP_CONFIG.equipments.length * APP_CONFIG.units.length // 12 equipments * 2 units
  return totalEquipment - anomalies.value.length
})

const totalAnalyzed = computed(() => 
  APP_CONFIG.equipments.length * APP_CONFIG.units.length
)

// Methods
const refreshAnalysis = async () => {
  isLoading.value = true
  
  try {
    const results = await vibrationStore.findAnomalies(
      analysisSettings.value.threshold,
      analysisSettings.value.timeRange,
      analysisSettings.value.comparisonDays
    )
    
    anomalies.value = results
    
  } catch (error) {
    window.$toast('خطا در آنالیز داده‌ها', 'error')
    console.error('Analysis error:', error)
  } finally {
    isLoading.value = false
  }
}

const getSeverityClass = (percentage) => {
  if (percentage >= 50) return 'severity-critical'
  if (percentage >= 30) return 'severity-high'
  if (percentage >= 20) return 'severity-medium'
  return 'severity-low'
}

const getSeverityText = (percentage) => {
  if (percentage >= 50) return 'بحرانی'
  if (percentage >= 30) return 'بالا'
  if (percentage >= 20) return 'متوسط'
  return 'پایین'
}

const getParameterIcon = (parameterId) => {
  const parameter = APP_CONFIG.parameters.find(p => p.id === parameterId)
  return parameter?.icon || 'fas fa-chart-line'
}

const getParameterColor = (parameterId) => {
  const parameter = APP_CONFIG.parameters.find(p => p.id === parameterId)
  return parameter?.color || '#666'
}

const getEquipmentName = (equipmentId) => {
  const equipment = APP_CONFIG.equipments.find(e => e.id === equipmentId)
  return equipment?.name || equipmentId
}

const getUnitName = (unitId) => {
  const unit = APP_CONFIG.units.find(u => u.id === unitId)
  return unit?.name || unitId
}

const navigateToChart = (anomaly) => {
  // Navigate to charts view with pre-filled filters
  const chartParams = {
    unit: anomaly.unit,
    equipment: anomaly.equipment,
    parameter: anomaly.parameter
  }
  
  // Store chart params in session storage for chart component
  sessionStorage.setItem('chartParams', JSON.stringify(chartParams))
  
  // Show notification
  window.$toast(`نمودار ${getEquipmentName(anomaly.equipment)} بارگذاری می‌شود...`, 'info')
  
  // Navigate to parent view if we're in a sub-component context
  // This assumes the parent component handles chart view switching
  window.dispatchEvent(new CustomEvent('switchToChart', { detail: chartParams }))
}

// Lifecycle
onMounted(() => {
  refreshAnalysis()
})
</script>

<style scoped>
.analysis-card {
  @apply bg-white border-2 border-gray-200 rounded-xl p-6 transition-all duration-200 hover:shadow-lg;
}

.analysis-card.dri1-style {
  @apply border-blue-200 hover:border-blue-400 hover:bg-blue-50;
}

.analysis-card.dri2-style {
  @apply border-red-200 hover:border-red-400 hover:bg-red-50;
}

.analysis-card-header {
  @apply flex items-center justify-between mb-4;
}

.analysis-icon {
  @apply w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl;
}

.severity-badge {
  @apply px-3 py-1 rounded-full text-xs font-bold uppercase;
}

.severity-critical {
  @apply bg-red-100 text-red-800;
}

.severity-high {
  @apply bg-orange-100 text-orange-800;
}

.severity-medium {
  @apply bg-yellow-100 text-yellow-800;
}

.severity-low {
  @apply bg-green-100 text-green-800;
}

.analysis-card-body {
  @apply space-y-3;
}

.analysis-title {
  @apply text-lg font-semibold text-gray-900;
}

.analysis-equipment {
  @apply text-gray-700;
}

.analysis-value-item {
  @apply flex flex-col space-y-1;
}

.analysis-label {
  @apply text-xs text-gray-500;
}

.analysis-value {
  @apply text-sm font-semibold;
}

.current-value {
  @apply text-blue-600;
}

.increase-amount {
  @apply text-orange-600;
}

.increase-percentage {
  @apply text-red-600;
}

.analysis-date {
  @apply flex items-center text-sm text-gray-600 mt-4;
}

.analysis-card-footer {
  @apply mt-4 pt-4 border-t border-gray-200 text-center;
}

.analysis-action-hint {
  @apply text-xs text-gray-500 flex items-center justify-center;
}
</style>