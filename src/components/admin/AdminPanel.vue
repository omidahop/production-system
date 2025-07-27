<template>
  <div class="space-y-6">
    <!-- Admin Dashboard Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <i class="fas fa-users text-blue-500 text-xl"></i>
        </div>
        <div class="text-2xl font-bold text-blue-600">{{ systemStats.totalUsers || 0 }}</div>
        <div class="text-sm text-gray-600">کل کاربران</div>
      </div>
      
      <div class="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <i class="fas fa-user-check text-green-500 text-xl"></i>
        </div>
        <div class="text-2xl font-bold text-green-600">{{ systemStats.approvedUsers || 0 }}</div>
        <div class="text-sm text-gray-600">کاربران تایید شده</div>
      </div>
      
      <div class="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <i class="fas fa-clock text-yellow-500 text-xl"></i>
        </div>
        <div class="text-2xl font-bold text-yellow-600">{{ systemStats.pendingUsers || 0 }}</div>
        <div class="text-sm text-gray-600">در انتظار تایید</div>
      </div>
      
      <div class="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <i class="fas fa-comments text-purple-500 text-xl"></i>
        </div>
        <div class="text-2xl font-bold text-purple-600">{{ systemStats.totalPosts || 0 }}</div>
        <div class="text-sm text-gray-600">کل پست‌ها</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="card">
      <div class="card-header">
        <h3 class="font-semibold text-gray-900">عملیات سریع</h3>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            @click="viewPendingApprovals"
            class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-right"
          >
            <div class="flex items-center space-x-3 space-x-reverse">
              <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <i class="fas fa-user-clock text-yellow-600"></i>
              </div>
              <div>
                <h4 class="font-semibold text-yellow-800">تایید کاربران</h4>
                <p class="text-sm text-yellow-600">{{ pendingApprovalsCount }} درخواست منتظر</p>
              </div>
            </div>
          </button>
          
          <button
            @click="viewSystemLogs"
            class="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-right"
          >
            <div class="flex items-center space-x-3 space-x-reverse">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i class="fas fa-chart-line text-blue-600"></i>
              </div>
              <div>
                <h4 class="font-semibold text-blue-800">گزارشات سیستم</h4>
                <p class="text-sm text-blue-600">آمار و فعالیت‌ها</p>
              </div>
            </div>
          </button>
          
          <button
            @click="manageDatabase"
            class="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-right"
          >
            <div class="flex items-center space-x-3 space-x-reverse">
              <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <i class="fas fa-database text-green-600"></i>
              </div>
              <div>
                <h4 class="font-semibold text-green-800">مدیریت دیتابیس</h4>
                <p class="text-sm text-green-600">پشتیبان‌گیری و بهینه‌سازی</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Recent Activities -->
    <div class="card">
      <div class="card-header">
        <h3 class="font-semibold text-gray-900">فعالیت‌های اخیر</h3>
        <button @click="loadActivityLogs" class="btn btn-primary btn-sm" :disabled="isLoading">
          <LoadingSpinner v-if="isLoading" size="sm" color="white" class="ml-2" />
          <i v-else class="fas fa-sync ml-2"></i>
          به‌روزرسانی
        </button>
      </div>
      <div class="card-body">
        <div v-if="isLoading" class="text-center py-8">
          <LoadingSpinner size="lg" />
          <p class="mt-4 text-gray-600">در حال بارگذاری فعالیت‌ها...</p>
        </div>
        
        <div v-else-if="activityLogs.length === 0" class="text-center py-8 text-gray-500">
          <i class="fas fa-history text-3xl mb-3"></i>
          <p>فعالیت اخیری وجود ندارد</p>
        </div>
        
        <div v-else class="space-y-4 max-h-64 overflow-y-auto">
          <div
            v-for="activity in activityLogs.slice(0, 10)"
            :key="activity.id || activity.timestamp"
            class="flex items-start space-x-3 space-x-reverse p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div class="activity-icon" :class="getActivityIconClass(activity.type)">
              <i :class="getActivityIcon(activity.type)"></i>
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ activity.action || activity.description }}
                </p>
                <span class="text-xs text-gray-500 whitespace-nowrap">
                  {{ getRelativeTime(activity.timestamp) }}
                </span>
              </div>
              
              <p class="text-xs text-gray-600 mt-1">
                {{ activity.user?.full_name || activity.user?.username || 'کاربر نامشخص' }}
              </p>
              
              <p v-if="activity.content" class="text-xs text-gray-500 mt-1 truncate">
                {{ truncateText(activity.content, 100) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- System Health -->
    <div class="card">
      <div class="card-header">
        <h3 class="font-semibold text-gray-900">سلامت سیستم</h3>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Database Status -->
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
              <i class="fas fa-database text-2xl text-green-600"></i>
            </div>
            <h4 class="font-semibold text-gray-900 mb-1">دیتابیس</h4>
            <div class="flex items-center justify-center space-x-1 space-x-reverse">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span class="text-sm text-green-600">آنلاین</span>
            </div>
          </div>
          
          <!-- Storage Status -->
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
              <i class="fas fa-hdd text-2xl text-blue-600"></i>
            </div>
            <h4 class="font-semibold text-gray-900 mb-1">فضای ذخیره‌سازی</h4>
            <div class="flex items-center justify-center space-x-1 space-x-reverse">
              <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span class="text-sm text-blue-600">65% استفاده</span>
            </div>
          </div>
          
          <!-- API Status -->
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
              <i class="fas fa-plug text-2xl text-green-600"></i>
            </div>
            <h4 class="font-semibold text-gray-900 mb-1">API</h4>
            <div class="flex items-center justify-center space-x-1 space-x-reverse">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span class="text-sm text-green-600">فعال</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { getRelativeTime, truncateText } from '@/utils/helpers'

const adminStore = useAdminStore()

const isLoading = ref(false)

// Computed
const systemStats = computed(() => adminStore.systemStats)
const activityLogs = computed(() => adminStore.activityLogs)
const pendingApprovalsCount = computed(() => adminStore.pendingApprovalsCount)

// Methods
const viewPendingApprovals = () => {
  // This would trigger navigation to pending approvals section
  window.dispatchEvent(new CustomEvent('switchAdminTab', { detail: 'management' }))
}

const viewSystemLogs = () => {
  // This would trigger navigation to system logs section
  window.dispatchEvent(new CustomEvent('switchAdminTab', { detail: 'stats' }))
}

const manageDatabase = () => {
  // This would trigger navigation to database management section
  window.dispatchEvent(new CustomEvent('switchAdminTab', { detail: 'database' }))
}

const loadActivityLogs = async () => {
  isLoading.value = true
  
  try {
    await adminStore.loadActivityLogs()
  } catch (error) {
    window.$toast('خطا در بارگذاری فعالیت‌ها', 'error')
  } finally {
    isLoading.value = false
  }
}

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

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      adminStore.loadSystemStatistics(),
      adminStore.loadPendingApprovals(),
      adminStore.loadActivityLogs()
    ])
  } catch (error) {
    console.error('Error loading admin data:', error)
  }
})
</script>

<style scoped>
.activity-icon {
  @apply w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0;
}

/* Custom scrollbar for activity logs */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>