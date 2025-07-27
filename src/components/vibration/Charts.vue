<template>
  <div class="space-y-6">
    <!-- Chart Controls -->
    <div class="card">
      <div class="card-header">
        <h3 class="font-semibold text-gray-900">تنظیمات نمودار</h3>
        <div class="flex space-x-2 space-x-reverse">
          <button @click="toggleFullscreen" class="btn btn-primary btn-sm">
            <i :class="isFullscreen ? 'fas fa-compress' : 'fas fa-expand'" class="ml-2"></i>
            {{ isFullscreen ? 'خروج از تمام صفحه' : 'تمام صفحه' }}
          </button>
          <button @click="exportChart" class="btn btn-success btn-sm">
            <i class="fas fa-download ml-2"></i>
            دانلود نمودار
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="form-label">واحد:</label>
            <select v-model="chartFilters.unit" @change="updateChart" class="form-control">
              <option value="DRI1">DRI 1</option>
              <option value="DRI2">DRI 2</option>
            </select>
          </div>
          
          <div>
            <label class="form-label">تجهیز:</label>
            <select v-model="chartFilters.equipment" @change="updateChart" class="form-control">
              <option value="">انتخاب تجهیز</option>
              <option 
                v-for="equipment in equipmentList" 
                :key="equipment.id" 
                :value="equipment.id"
              >
                {{ equipment.name }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="form-label">از تاریخ:</label>
            <input 
              v-model="chartFilters.dateFrom" 
              @change="updateChart"
              type="date" 
              class="form-control"
            >
          </div>
          
          <div>
            <label class="form-label">تا تاریخ:</label>
            <input 
              v-model="chartFilters.dateTo" 
              @change="updateChart"
              type="date" 
              class="form-control"
            >
          </div>
        </div>
        
        <!-- Parameter Selection -->
        <div class="mt-4">
          <label class="form-label">انتخاب پارامترها:</label>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <label 
              v-for="parameter in parametersList" 
              :key="parameter.id"
              class="flex items-center space-x-2 space-x-reverse cursor-pointer"
            >
              <input 
                v-model="selectedParameters"
                :value="parameter.id"
                @change="updateChart"
                type="checkbox"
                class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              >
              <div class="flex items-center space-x-1 space-x-reverse">
                <i :class="parameter.icon" :style="{ color: parameter.color }" class="text-sm"></i>
                <span class="text-sm">{{ parameter.name }}</span>
              </div>
            </label>
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

    <!-- Chart Display -->
    <div class="card" :class="{ 'fixed inset-4 z-50': isFullscreen }">
      <div v-if="isFullscreen" class="card-header">
        <h3 class="font-semibold text-gray-900">
          نمودار {{ getEquipmentName(chartFilters.equipment) }}
        </h3>
        <button @click="toggleFullscreen" class="btn btn-error btn-sm">
          <i class="fas fa-times ml-2"></i>
          بستن
        </button>
      </div>
      
      <div class="card-body">
        <div v-if="isLoading" class="text-center py-12">
          <LoadingSpinner size="lg" />
          <p class="mt-4 text-gray-600">در حال بارگذاری نمودار...</p>
        </div>
        
        <div v-else-if="!chartFilters.equipment || selectedParameters.length === 0" class="text-center py-12">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fas fa-chart-line text-3xl text-gray-400"></i>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">نمودار</h3>
          <p class="text-gray-600 mb-4">لطفاً تجهیز و پارامترها را انتخاب کنید</p>
        </div>
        
        <div v-else-if="chartData.length === 0" class="text-center py-12">
          <div class="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fas fa-exclamation-triangle text-3xl text-yellow-500"></i>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">داده‌ای یافت نشد</h3>
          <p class="text-gray-600">برای تنظیمات انتخاب شده داده‌ای موجود نیست</p>
        </div>
        
        <div v-else class="chart-wrapper" :style="chartStyle">
          <canvas ref="chartCanvas" :id="chartId"></canvas>
        </div>
        
        <!-- Chart Info -->
        <div v-if="chartData.length > 0" class="mt-4 text-center text-sm text-gray-600">
          <p>{{ chartData.length }} نقطه داده نمایش داده شده</p>
        </div>
      </div>
    </div>

    <!-- Chart Statistics -->
    <div v-if="chartData.length > 0" class="card">
      <div class="card-header">
        <h3 class="font-semibold text-gray-900">آمار نمودار</h3>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-4 bg-blue-50 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">{{ chartData.length }}</div>
            <div class="text-sm text-blue-800">تعداد نقاط</div>
          </div>
          <div class="text-center p-4 bg-green-50 rounded-lg">
            <div class="text-2xl font-bold text-green-600">{{ selectedParameters.length }}</div>
            <div class="text-sm text-green-800">پارامترهای انتخابی</div>
          </div>
          <div class="text-center p-4 bg-purple-50 rounded-lg">
            <div class="text-2xl font-bold text-purple-600">{{ dateRange }}</div>
            <div class="text-sm text-purple-800">روز بررسی</div>
          </div>
          <div class="text-center p-4 bg-yellow-50 rounded-lg">
            <div class="text-2xl font-bold text-yellow-600">{{ averageValue }}</div>
            <div class="text-sm text-yellow-800">میانگین کلی</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useAuthStore } from '@/stores/auth'
import { useVibrationStore } from '@/stores/vibration'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { APP_CONFIG } from '@/utils/constants'
import { formatPersianDate, getCurrentDate, subtractDaysFromDate } from '@/utils/helpers'

// Register Chart.js components
Chart.register(...registerables)

const authStore = useAuthStore()
const vibrationStore = useVibrationStore()

// State
const chartCanvas = ref(null)
const chartInstance = ref(null)
const isLoading = ref(false)
const isFullscreen = ref(false)
const chartData = ref([])
const selectedParameters = ref(['V1', 'GV1']) // Default selection

const chartId = ref('mainChart_' + Date.now()) // Unique ID

const chartFilters = ref({
  unit: 'DRI1',
  equipment: '',
  dateFrom: formatPersianDate(subtractDaysFromDate(new Date(), 7), 'yyyy-MM-dd'),
  dateTo: getCurrentDate()
})

// Computed
const equipmentList = computed(() => APP_CONFIG.equipments)
const parametersList = computed(() => APP_CONFIG.parameters.sort((a, b) => a.order - b.order))

const chartStyle = computed(() => {
  if (isFullscreen.value) {
    return {
      height: 'calc(100vh - 200px)',
      width: '100%'
    }
  }
  return {
    height: '400px',
    width: '100%'
  }
})

const dateRange = computed(() => {
  if (!chartFilters.value.dateFrom || !chartFilters.value.dateTo) return 0
  
  const start = new Date(chartFilters.value.dateFrom)
  const end = new Date(chartFilters.value.dateTo)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})

const averageValue = computed(() => {
  if (chartData.value.length === 0) return '0.00'
  
  let totalSum = 0
  let valueCount = 0
  
  chartData.value.forEach(item => {
    selectedParameters.value.forEach(paramId => {
      const value = item.parameters[paramId]
      if (typeof value === 'number') {
        totalSum += value
        valueCount++
      }
    })
  })
  
  return valueCount > 0 ? (totalSum / valueCount).toFixed(2) : '0.00'
})

// Methods
const updateChart = async () => {
  if (!chartFilters.value.equipment || selectedParameters.value.length === 0) {
    destroyChart()
    return
  }
  
  isLoading.value = true
  
  try {
    const data = await vibrationStore.getEquipmentData(
      chartFilters.value.unit,
      chartFilters.value.equipment,
      chartFilters.value.dateFrom,
      chartFilters.value.dateTo
    )
    
    chartData.value = data
    await nextTick()
    await renderChart()
    
  } catch (error) {
    window.$toast('خطا در بارگذاری داده‌های نمودار', 'error')
    console.error('Chart data loading error:', error)
  } finally {
    isLoading.value = false
  }
}

const renderChart = async () => {
  if (!chartCanvas.value || chartData.value.length === 0) return
  
  destroyChart()
  
  const ctx = chartCanvas.value.getContext('2d')
  const dates = chartData.value.map(item => formatPersianDate(item.date))
  
  const datasets = selectedParameters.value.map(paramId => {
    const parameter = parametersList.value.find(p => p.id === paramId)
    if (!parameter) return null
    
    const values = chartData.value.map(item => item.parameters[paramId] || null)
    
    return {
      label: parameter.name,
      data: values,
      borderColor: parameter.color,
      backgroundColor: parameter.color + '20',
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      pointBackgroundColor: parameter.color,
      pointBorderColor: parameter.color,
      pointBorderWidth: 2,
      pointRadius: 4
    }
  }).filter(Boolean)
  
  chartInstance.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            font: {
              family: 'Vazirmatn',
              size: 12
            },
            padding: 20
          }
        },
        title: {
          display: true,
          text: `نمودار ${getEquipmentName(chartFilters.value.equipment)}`,
          font: {
            family: 'Vazirmatn',
            size: 16,
            weight: 'bold'
          }
        },
        tooltip: {
          titleFont: {
            family: 'Vazirmatn'
          },
          bodyFont: {
            family: 'Vazirmatn'
          },
          rtl: true,
          callbacks: {
            title: function(context) {
              return context[0].label
            },
            label: function(context) {
              const parameter = parametersList.value.find(p => p.name === context.dataset.label)
              const unit = parameter?.type === 'velocity' ? 'mm/s' : 'g'
              return `${context.dataset.label}: ${context.parsed.y} ${unit}`
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'تاریخ',
            font: {
              family: 'Vazirmatn',
              size: 14
            }
          },
          ticks: {
            font: {
              family: 'Vazirmatn'
            }
          }
        },
        y: {
          title: {
            display: true,
            text: 'مقدار',
            font: {
              family: 'Vazirmatn',
              size: 14
            }
          },
          beginAtZero: true,
          ticks: {
            font: {
              family: 'Vazirmatn'
            }
          }
        }
      },
      elements: {
        point: {
          hoverRadius: 8
        }
      }
    }
  })
}

const destroyChart = () => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
    chartInstance.value = null
  }
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  
  nextTick(() => {
    if (chartInstance.value) {
      chartInstance.value.resize()
    }
  })
}

const exportChart = () => {
  if (!chartInstance.value) {
    window.$toast('نموداری برای دانلود موجود نیست', 'warning')
    return
  }
  
  try {
    const url = chartInstance.value.toBase64Image('image/png', 1)
    const link = document.createElement('a')
    link.download = `chart-${chartFilters.value.equipment}-${getCurrentDate()}.png`
    link.href = url
    link.click()
    
    window.$toast('نمودار با موفقیت دانلود شد', 'success')
  } catch (error) {
    window.$toast('خطا در دانلود نمودار', 'error')
  }
}

const getEquipmentName = (equipmentId) => {
  const equipment = equipmentList.value.find(e => e.id === equipmentId)
  return equipment?.name || equipmentId
}

// Handle window resize for fullscreen
const handleResize = () => {
  if (chartInstance.value) {
    setTimeout(() => {
      chartInstance.value.resize()
    }, 100)
  }
}

// Watchers
watch(isFullscreen, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
    window.addEventListener('resize', handleResize)
  } else {
    document.body.style.overflow = ''
    window.removeEventListener('resize', handleResize)
  }
  
  nextTick(() => {
    if (chartInstance.value) {
      chartInstance.value.resize()
    }
  })
})

// Lifecycle
onMounted(() => {
  // Set default equipment
  if (equipmentList.value.length > 0) {
    chartFilters.value.equipment = equipmentList.value[0].id
    updateChart()
  }
})

onUnmounted(() => {
  destroyChart()
  window.removeEventListener('resize', handleResize)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.chart-wrapper {
  position: relative;
}

.fixed.inset-4 {
  position: fixed;
  top: 1rem;
  right: 1rem;
  bottom: 1rem;
  left: 1rem;
}

/* Custom scrollbar for fullscreen */
.card.fixed {
  overflow-y: auto;
}

.card.fixed::-webkit-scrollbar {
  width: 8px;
}

.card.fixed::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.card.fixed::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.card.fixed::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>