<template>
  <div class="space-y-6">
    <!-- Overview Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-users text-2xl text-blue-600"></i>
          </div>
          <div class="mr-4">
            <p class="text-sm font-medium text-gray-600">کاربران فعال</p>
            <p class="text-2xl font-bold text-gray-900">{{ systemStats.totalUsers || 0 }}</p>
            <p class="text-xs text-green-600">+{{ Math.floor(Math.random() * 10) }}% این ماه</p>
          </div>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-chart-line text-2xl text-green-600"></i>
          </div>
          <div class="mr-4">
            <p class="text-sm font-medium text-gray-600">رکوردهای ویبره</p>
            <p class="text-2xl font-bold text-gray-900">{{ systemStats.totalVibrationRecords || 0 }}</p>
            <p class="text-xs text-green-600">+{{ Math.floor(Math.random() * 20) }}% این هفته</p>
          </div>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-comments text-2xl text-purple-600"></i>
          </div>
          <div class="mr-4">
            <p class="text-sm font-medium text-gray-600">پست‌های اجتماعی</p>
            <p class="text-2xl font-bold text-gray-900">{{ systemStats.totalPosts || 0 }}</p>
            <p class="text-xs text-blue-600">+{{ Math.floor(Math.random() * 15) }}% امروز</p>
          </div>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-comment text-2xl text-yellow-600"></i>
          </div>
          <div class="mr-4">
            <p class="text-sm font-medium text-gray-600">نظرات</p>
            <p class="text-2xl font-bold text-gray-900">{{ systemStats.totalComments || 0 }}</p>
            <p class="text-xs text-purple-600">+{{ Math.floor(Math.random() * 25) }}% امروز</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Users Growth Chart -->
      <div class="card">
        <div class="card-header">
          <h3 class="font-semibold text-gray-900">رشد کاربران</h3>
          <button @click="refreshUsersChart" class="btn btn-primary btn-sm">
            <i class="fas fa-sync ml-2"></i>
            به‌روزرسانی
          </button>
        </div>
        <div class="card-body">
          <div class="chart-container" style="height: 300px;">
            <canvas ref="usersChart" id="usersChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Activity Chart -->
      <div class="card">
        <div class="card-header">
          <h3 class="font-semibold text-gray-900">فعالیت روزانه</h3>
          <button @click="refreshActivityChart" class="btn btn-primary btn-sm">
            <i class="fas fa-sync ml-2"></i>
            به‌روزرسانی
          </button>
        </div>
        <div class="card-body">
          <div class="chart-container" style="height: 300px;">
            <canvas ref="activityChart" id="activityChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- System Performance -->
    <div class="card">
      <div class="card-header">
        <h3 class="font-semibold text-gray-900">عملکرد سیستم</h3>
        <div class="flex space-x-2 space-x-reverse">
          <button @click="refreshPerformanceData" class="btn btn-primary btn-sm" :disabled="isLoading">
            <LoadingSpinner v-if="isLoading" size="sm" color="white" class="ml-2" />
            <i v-else class="fas fa-sync ml-2"></i>
            به‌روزرسانی
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Response Time -->
          <div class="text-center">
            <div class="w-20 h-20 mx-auto mb-4 relative">
              <svg class="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  stroke-width="2"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10B981"
                  stroke-width="2"
                  stroke-dasharray="85, 100"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-2xl font-bold text-green-600">85%</span>
              </div>
            </div>
            <h4 class="font-semibold text-gray-900 mb-1">زمان پاسخ</h4>
            <p class="text-sm text-gray-600">میانگین: 120ms</p>
          </div>

          <!-- Database Performance -->
          <div class="text-center">
            <div class="w-20 h-20 mx-auto mb-4 relative">
              <svg class="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  stroke-width="2"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3B82F6"
                  stroke-width="2"
                  stroke-dasharray="92, 100"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-2xl font-bold text-blue-600">92%</span>
              </div>
            </div>
            <h4 class="font-semibold text-gray-900 mb-1">دیتابیس</h4>
            <p class="text-sm text-gray-600">اتصالات فعال: 25</p>
          </div>

          <!-- Storage Usage -->
          <div class="text-center">
            <div class="w-20 h-20 mx-auto mb-4 relative">
              <svg class="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  stroke-width="2"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#F59E0B"
                  stroke-width="2"
                  stroke-dasharray="65, 100"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-2xl font-bold text-yellow-600">65%</span>
              </div>
            </div>
            <h4 class="font-semibold text-gray-900 mb-1">فضای ذخیره</h4>
            <p class="text-sm text-gray-600">6.5GB از 10GB</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity Table -->
    <div class="card">
      <div class="card-header">
        <h3 class="font-semibold text-gray-900">فعالیت‌های اخیر سیستم</h3>
      </div>
      <div class="card-body">
        <div v-if="isLoading" class="text-center py-8">
          <LoadingSpinner size="lg" />
          <p class="mt-4 text-gray-600">در حال بارگذاری فعالیت‌ها...</p>
        </div>

        <div v-else-if="activityLogs.length === 0" class="text-center py-8 text-gray-500">
          <i class="fas fa-chart-bar text-4xl mb-4"></i>
          <p>هیچ فعالیتی ثبت نشده است</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th class="text-right">نوع</th>
                <th class="text-right">فعالیت</th>
                <th class="text-right">کاربر</th>
                <th class="text-center">زمان</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="activity in activityLogs.slice(0, 10)" :key="activity.id || activity.timestamp">
                <td>
                  <div class="flex items-center">
                    <div class="activity-icon" :class="getActivityIconClass(activity.type)">
                      <i :class="getActivityIcon(activity.type)"></i>
                    </div>
                    <span class="mr-2 text-sm font-medium">{{ getActivityTypeText(activity.type) }}</span>
                  </div>
                </td>
                
                <td class="text-sm">
                  {{ activity.action || activity.description }}
                </td>
                
                <td class="text-sm">
                  {{ activity.user?.full_name || activity.user?.username || 'کاربر نامشخص' }}
                </td>
                
                <td class="text-center text-sm">
                  {{ formatDateTime(activity.timestamp) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- System Alerts -->
    <div v-if="systemAlerts.length > 0" class="card">
      <div class="card-header">
        <h3 class="font-semibold text-gray-900">هشدارهای سیستم</h3>
      </div>
      <div class="card-body">
        <div class="space-y-3">
          <div
            v-for="alert in systemAlerts"
            :key="alert.id"
            class="alert-item"
            :class="alert.severity"
          >
            <div class="flex items-start space-x-3 space-x-reverse">
              <div class="alert-icon" :class="getAlertIconClass(alert.severity)">
                <i :class="getAlertIcon(alert.severity)"></i>
              </div>
              
              <div class="flex-1">
                <h4 class="font-semibold text-sm">{{ alert.title }}</h4>
                <p class="text-sm mt-1">{{ alert.message }}</p>
                <p class="text-xs text-gray-500 mt-2">{{ formatDateTime(alert.timestamp) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useAdminStore } from '@/stores/admin'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { formatDateTime } from '@/utils/helpers'

// Register Chart.js components
Chart.register(...registerables)

const adminStore = useAdminStore()

// Refs
const usersChart = ref(null)
const activityChart = ref(null)
const usersChartInstance = ref(null)
const activityChartInstance = ref(null)
const isLoading = ref(false)

// Mock data for system alerts
const systemAlerts = ref([
  {
    id: 1,
    severity: 'warning',
    title: 'استفاده بالای CPU',
    message: 'استفاده از CPU به 85% رسیده است',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    severity: 'info',
    title: 'به‌روزرسانی در دسترس',
    message: 'نسخه جدید سیستم منتشر شده است',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  }
])

// Computed
const systemStats = computed(() => adminStore.systemStats)
const activityLogs = computed(() => adminStore.activityLogs)

// Methods
const getActivityIcon = (type) => {
  const icons = {
    post: 'fas fa-file-alt',
    comment: 'fas fa-comment',
    user: 'fas fa-user',
    admin: 'fas fa-shield-alt',
    vibration: 'fas fa-chart-line',
    login: 'fas fa-sign-in-alt',
    logout: 'fas fa-sign-out-alt'
  }
  return icons[type] || 'fas fa-bell'
}

const getActivityIconClass = (type) => {
  const classes = {
    post: 'bg-blue-100 text-blue-600',
    comment: 'bg-green-100 text-green-600',
    user: 'bg-purple-100 text-purple-600',
    admin: 'bg-red-100 text-red-600',
    vibration: 'bg-yellow-100 text-yellow-600',
    login: 'bg-green-100 text-green-600',
    logout: 'bg-gray-100 text-gray-600'
  }
  return classes[type] || 'bg-gray-100 text-gray-600'
}

const getActivityTypeText = (type) => {
  const types = {
    post: 'پست',
    comment: 'نظر',
    user: 'کاربر',
    admin: 'مدیریت',
    vibration: 'ویبره',
    login: 'ورود',
    logout: 'خروج'
  }
  return types[type] || 'فعالیت'
}

const getAlertIcon = (severity) => {
  const icons = {
    error: 'fas fa-exclamation-triangle',
    warning: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle'
  }
  return icons[severity] || 'fas fa-bell'
}

const getAlertIconClass = (severity) => {
  const classes = {
    error: 'bg-red-100 text-red-600',
    warning: 'bg-yellow-100 text-yellow-600',
    info: 'bg-blue-100 text-blue-600'
  }
  return classes[severity] || 'bg-gray-100 text-gray-600'
}

const createUsersChart = () => {
  if (!usersChart.value) return

  const ctx = usersChart.value.getContext('2d')
  
  // Generate mock data for the last 30 days
  const labels = []
  const data = []
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    labels.push(date.toLocaleDateString('fa-IR', { day: '2-digit', month: '2-digit' }))
    data.push(Math.floor(Math.random() * 10) + 5) // Random users between 5-15
  }

  usersChartInstance.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'کاربران جدید',
        data: data,
        borderColor: '#3B82F6',
        backgroundColor: '#3B82F6' + '20',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  })
}

const createActivityChart = () => {
  if (!activityChart.value) return

  const ctx = activityChart.value.getContext('2d')
  
  usersChartInstance.value = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['پست‌ها', 'نظرات', 'ورودها', 'ثبت ویبره'],
      datasets: [{
        data: [30, 25, 35, 10],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        }
      }
    }
  })
}

const refreshUsersChart = () => {
  if (usersChartInstance.value) {
    usersChartInstance.value.destroy()
  }
  createUsersChart()
}

const refreshActivityChart = () => {
  if (activityChartInstance.value) {
    activityChartInstance.value.destroy()
  }
  createActivityChart()
}

const refreshPerformanceData = async () => {
  isLoading.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    window.$toast('داده‌های عملکرد به‌روزرسانی شد', 'success')
  } catch (error) {
    window.$toast('خطا در به‌روزرسانی داده‌ها', 'error')
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      adminStore.loadSystemStatistics(),
      adminStore.loadActivityLogs()
    ])
    
    // Create charts after data is loaded
    setTimeout(() => {
      createUsersChart()
      createActivityChart()
    }, 100)
    
  } catch (error) {
    console.error('Error loading system stats:', error)
  }
})

onUnmounted(() => {
  if (usersChartInstance.value) {
    usersChartInstance.value.destroy()
  }
  if (activityChartInstance.value) {
    activityChartInstance.value.destroy()
  }
})
</script>

<style scoped>
.chart-container {
  position: relative;
}

.activity-icon {
  @apply w-6 h-6 rounded-full flex items-center justify-center text-xs;
}

.alert-item {
  @apply p-4 border rounded-lg;
}

.alert-item.error {
  @apply bg-red-50 border-red-200;
}

.alert-item.warning {
  @apply bg-yellow-50 border-yellow-200;
}

.alert-item.info {
  @apply bg-blue-50 border-blue-200;
}

.alert-icon {
  @apply w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0;
}
</style>