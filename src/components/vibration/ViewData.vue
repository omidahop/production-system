<template>
  <div class="space-y-6">
    <!-- Filters -->
    <div class="card">
      <div class="card-header">
        <h3 class="font-semibold text-gray-900">فیلترهای جستجو</h3>
        <div class="flex space-x-2 space-x-reverse">
          <button @click="exportData" class="btn btn-success btn-sm" :disabled="isLoading">
            <i class="fas fa-download ml-2"></i>
            خروجی Excel
          </button>
          <button @click="printTable" class="btn btn-secondary btn-sm">
            <i class="fas fa-print ml-2"></i>
            چاپ
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="form-label">واحد:</label>
            <select v-model="filters.unit" @change="loadData" class="form-control">
              <option value="">همه واحدها</option>
              <option value="DRI1">DRI 1</option>
              <option value="DRI2">DRI 2</option>
            </select>
          </div>
          
          <div>
            <label class="form-label">تاریخ:</label>
            <input 
              v-model="filters.date" 
              @change="loadData"
              type="date" 
              class="form-control"
            >
          </div>
          
          <div>
            <label class="form-label">تجهیز:</label>
            <select v-model="filters.equipment" @change="loadData" class="form-control">
              <option value="">همه تجهیزات</option>
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
            <label class="form-label">محدوده تاریخ:</label>
            <select v-model="dateRange" @change="handleDateRangeChange" class="form-control">
              <option value="today">امروز</option>
              <option value="yesterday">دیروز</option>
              <option value="week">هفته گذشته</option>
              <option value="month">ماه گذشته</option>
              <option value="custom">سفارشی</option>
            </select>
          </div>
        </div>
        
        <!-- Custom Date Range -->
        <div v-if="dateRange === 'custom'" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label class="form-label">از تاریخ:</label>
            <input 
              v-model="filters.dateFrom" 
              @change="loadData"
              type="date" 
              class="form-control"
            >
          </div>
          <div>
            <label class="form-label">تا تاریخ:</label>
            <input 
              v-model="filters.dateTo" 
              @change="loadData"
              type="date" 
              class="form-control"
            >
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

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-8">
      <LoadingSpinner size="lg" />
      <p class="mt-4 text-gray-600">در حال بارگذاری داده‌ها...</p>
    </div>

    <!-- Data Tables -->
    <div v-else-if="processedData.length > 0" class="space-y-6">
      <!-- Separate tables for each unit when no unit filter -->
      <div v-if="!filters.unit" class="space-y-6">
        <div
          v-for="unit in ['DRI1', 'DRI2']"
          :key="unit"
          class="table-container"
          :class="`table-${unit.toLowerCase()}`"
        >
          <div class="table-title" :class="unit.toLowerCase()">
            <div class="flex justify-between items-center">
              <div class="flex items-center space-x-2 space-x-reverse">
                <i class="fas fa-industry"></i>
                <span>{{ getUnitName(unit) }} - {{ getDisplayDate() }}</span>
              </div>
              <span class="text-sm opacity-75">
                {{ getUnitDataCount(unit) }} رکورد
              </span>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <DataTable 
              :data="getUnitData(unit)"
              :unit="unit"
              :show-notes="true"
            />
          </div>
        </div>
      </div>
      
      <!-- Single table when unit filter is applied -->
      <div v-else class="table-container" :class="`table-${filters.unit.toLowerCase()}`">
        <div class="table-title" :class="filters.unit.toLowerCase()">
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-2 space-x-reverse">
              <i class="fas fa-industry"></i>
              <span>{{ getUnitName(filters.unit) }} - {{ getDisplayDate() }}</span>
            </div>
            <span class="text-sm opacity-75">
              {{ processedData.length }} رکورد
            </span>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <DataTable 
            :data="processedData"
            :unit="filters.unit"
            :show-notes="true"
          />
        </div>
      </div>
    </div>

    <!-- No Data -->
    <div v-else class="text-center py-12">
      <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <i class="fas fa-table text-3xl text-gray-400"></i>
      </div>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">داده‌ای یافت نشد</h3>
      <p class="text-gray-600 mb-6">با فیلترهای انتخاب شده داده‌ای موجود نیست.</p>
      <button @click="resetFilters" class="btn btn-primary">
        <i class="fas fa-refresh ml-2"></i>
        بازنشانی فیلترها
      </button>
    </div>

    <!-- Statistics Summary -->
    <div v-if="processedData.length > 0" class="card">
      <div class="card-header">
        <h3 class="font-semibold text-gray-900">خلاصه آمار</h3>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-4 bg-blue-50 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">{{ totalRecords }}</div>
            <div class="text-sm text-blue-800">کل رکوردها</div>
          </div>
          <div class="text-center p-4 bg-green-50 rounded-lg">
            <div class="text-2xl font-bold text-green-600">{{ uniqueEquipment }}</div>
            <div class="text-sm text-green-800">تجهیزات منحصر</div>
          </div>
          <div class="text-center p-4 bg-purple-50 rounded-lg">
            <div class="text-2xl font-bold text-purple-600">{{ uniqueDates }}</div>
            <div class="text-sm text-purple-800">روزهای منحصر</div>
          </div>
          <div class="text-center p-4 bg-yellow-50 rounded-lg">
            <div class="text-2xl font-bold text-yellow-600">{{ averageValues }}</div>
            <div class="text-sm text-yellow-800">میانگین مقادیر</div>
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
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import DataTable from './DataTable.vue'
import { APP_CONFIG } from '@/utils/constants'
import { formatPersianDate, getCurrentDate, subtractDaysFromDate } from '@/utils/helpers'

const authStore = useAuthStore()
const vibrationStore = useVibrationStore()

// State
const isLoading = ref(false)
const vibrationData = ref([])
const dateRange = ref('today')

const filters = ref({
  unit: '',
  date: getCurrentDate(),
  equipment: '',
  dateFrom: '',
  dateTo: ''
})

// Computed
const equipmentList = computed(() => APP_CONFIG.equipments)

const processedData = computed(() => {
  let data = vibrationData.value
  
  // Apply equipment filter
  if (filters.value.equipment) {
    data = data.filter(item => item.equipment === filters.value.equipment)
  }
  
  return data
})

const totalRecords = computed(() => processedData.value.length)

const uniqueEquipment = computed(() => {
  const equipment = new Set(processedData.value.map(item => item.equipment))
  return equipment.size
})

const uniqueDates = computed(() => {
  const dates = new Set(processedData.value.map(item => item.date))
  return dates.size
})

const averageValues = computed(() => {
  if (processedData.value.length === 0) return 0
  
  let totalSum = 0
  let valueCount = 0
  
  processedData.value.forEach(item => {
    Object.values(item.parameters).forEach(value => {
      if (typeof value === 'number') {
        totalSum += value
        valueCount++
      }
    })
  })
  
  return valueCount > 0 ? (totalSum / valueCount).toFixed(2) : 0
})

// Methods
const loadData = async () => {
  isLoading.value = true
  
  try {
    const queryFilters = { ...filters.value }
    
    // Remove empty filters
    Object.keys(queryFilters).forEach(key => {
      if (!queryFilters[key]) {
        delete queryFilters[key]
      }
    })
    
    const data = await vibrationStore.loadVibrationData(queryFilters)
    vibrationData.value = data
    
  } catch (error) {
    window.$toast('خطا در بارگذاری داده‌ها', 'error')
    console.error('Error loading data:', error)
  } finally {
    isLoading.value = false
  }
}

const handleDateRangeChange = () => {
  const today = new Date()
  
  switch (dateRange.value) {
    case 'today':
      filters.value.date = getCurrentDate()
      filters.value.dateFrom = ''
      filters.value.dateTo = ''
      break
    case 'yesterday':
      const yesterday = subtractDaysFromDate(today, 1)
      filters.value.date = formatPersianDate(yesterday, 'yyyy-MM-dd')
      filters.value.dateFrom = ''
      filters.value.dateTo = ''
      break
    case 'week':
      filters.value.date = ''
      filters.value.dateFrom = formatPersianDate(subtractDaysFromDate(today, 7), 'yyyy-MM-dd')
      filters.value.dateTo = getCurrentDate()
      break
    case 'month':
      filters.value.date = ''
      filters.value.dateFrom = formatPersianDate(subtractDaysFromDate(today, 30), 'yyyy-MM-dd')
      filters.value.dateTo = getCurrentDate()
      break
    case 'custom':
      filters.value.date = ''
      break
  }
  
  loadData()
}

const getUnitName = (unitId) => {
  const unit = APP_CONFIG.units.find(u => u.id === unitId)
  return unit?.name || unitId
}

const getDisplayDate = () => {
  if (filters.value.date) {
    return formatPersianDate(filters.value.date)
  } else if (filters.value.dateFrom && filters.value.dateTo) {
    return `${formatPersianDate(filters.value.dateFrom)} تا ${formatPersianDate(filters.value.dateTo)}`
  }
  return 'همه تاریخ‌ها'
}

const getUnitData = (unit) => {
  return processedData.value.filter(item => item.unit === unit)
}

const getUnitDataCount = (unit) => {
  return getUnitData(unit).length
}

const resetFilters = () => {
  filters.value = {
    unit: '',
    date: getCurrentDate(),
    equipment: '',
    dateFrom: '',
    dateTo: ''
  }
  dateRange.value = 'today'
  loadData()
}

const exportData = async () => {
  if (processedData.value.length === 0) {
    window.$toast('داده‌ای برای خروجی وجود ندارد', 'warning')
    return
  }
  
  try {
    const csvData = await vibrationStore.exportData(filters.value)
    
    // Create and download file
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `vibration-data-${getCurrentDate()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    window.$toast('فایل CSV با موفقیت دانلود شد', 'success')
  } catch (error) {
    window.$toast('خطا در ایجاد فایل خروجی', 'error')
  }
}

const printTable = () => {
  const printContent = document.querySelector('.table-container')
  if (!printContent) {
    window.$toast('داده‌ای برای چاپ وجود ندارد', 'warning')
    return
  }
  
  const printWindow = window.open('', '', 'width=800,height=600')
  printWindow.document.write(`
    <html>
      <head>
        <title>گزارش داده‌های ویبره</title>
        <style>
          body { font-family: 'Vazirmatn', sans-serif; direction: rtl; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .header { text-align: center; margin-bottom: 20px; }
          .info { margin-bottom: 10px; color: #666; }
          .user-info { text-align: left; font-size: 0.9rem; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>گزارش داده‌های ویبره تجهیزات</h2>
          <div class="info">تاریخ: ${getDisplayDate()}</div>
          <div class="user-info">کاربر: ${authStore.profile?.full_name || 'کاربر میهمان'}</div>
        </div>
        ${printContent.innerHTML}
      </body>
    </html>
  `)
  
  printWindow.document.close()
  printWindow.print()
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.table-container {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden;
}

.table-container.table-dri1 {
  @apply border-l-4 border-l-blue-500;
}

.table-container.table-dri2 {
  @apply border-l-4 border-l-red-500;
}

.table-title {
  @apply px-6 py-4 border-b border-gray-200 bg-gray-50 font-semibold;
}

.table-title.dri1 {
  @apply bg-blue-600 text-white;
}

.table-title.dri2 {
  @apply bg-red-600 text-white;
}
</style>