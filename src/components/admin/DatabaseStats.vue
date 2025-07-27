<template>
  <div class="space-y-6">
    <!-- Database Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card">
        <div class="card-body text-center">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-database text-3xl text-blue-600"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">وضعیت دیتابیس</h3>
          <div class="flex items-center justify-center space-x-2 space-x-reverse">
            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-green-600 font-medium">آنلاین و سالم</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-hdd text-3xl text-green-600"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">فضای استفاده شده</h3>
          <div class="text-2xl font-bold text-green-600 mb-1">2.8 GB</div>
          <div class="text-sm text-gray-500">از 10 GB</div>
        </div>
      </div>

      <div class="card">
        <div class="card-body text-center">
          <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-clock text-3xl text-purple-600"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">آخرین پشتیبان‌گیری</h3>
          <div class="text-sm font-medium text-purple-600">{{ lastBackupTime }}</div>
          <div class="text-xs text-gray-500">خودکار</div>
        </div>
      </div>
    </div>

    <!-- Database Operations -->
    <div class="card">
      <div class="card-header">
        <h3 class="font-semibold text-gray-900">عملیات دیتابیس</h3>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            @click="createBackup"
            :disabled="isProcessing"
            class="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-center"
          >
            <div class="flex flex-col items-center">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <LoadingSpinner v-if="isProcessing && currentOperation === 'backup'" size="sm" class="text-blue-600" />
                <i v-else class="fas fa-download text-xl text-blue-600"></i>
              </div>
              <h4 class="font-semibold text-gray-900 mb-1">ایجاد پشتیبان</h4>
              <p class="text-sm text-gray-600">پشتیبان‌گیری دستی از دیتابیس</p>
            </div>
          </button>

          <button
            @click="optimizeDatabase"
            :disabled="isProcessing"
            class="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors text-center"
          >
            <div class="flex flex-col items-center">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <LoadingSpinner v-if="isProcessing && currentOperation === 'optimize'" size="sm" class="text-green-600" />
                <i v-else class="fas fa-magic text-xl text-green-600"></i>
              </div>
              <h4 class="font-semibold text-gray-900 mb-1">بهینه‌سازی</h4>
              <p class="text-sm text-gray-600">بهینه‌سازی جداول و ایندکس‌ها</p>
            </div>
          </button>

          <button
            @click="analyzeStorage"
            :disabled="isProcessing"
            class="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-center"
          >
            <div class="flex flex-col items-center">
              <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <LoadingSpinner v-if="isProcessing && currentOperation === 'analyze'" size="sm" class="text-purple-600" />
                <i v-else class="fas fa-chart-pie text-xl text-purple-600"></i>
              </div>
              <h4 class="font-semibold text-gray-900 mb-1">تحلیل فضا</h4>
              <p class="text-sm text-gray-600">بررسی استفاده از فضای ذخیره</p>
            </div>
          </button>

          <button
            @click="cleanupDatabase"
            :disabled="isProcessing"
            class="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-colors text-center"
          >
            <div class="flex flex-col items-center">
              <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                <LoadingSpinner v-if="isProcessing && currentOperation === 'cleanup'" size="sm" class="text-yellow-600" />
                <i v-else class="fas fa-broom text-xl text-yellow-600"></i>
              </div>
              <h4 class="font-semibold text-gray-900 mb-1">پاکسازی</h4>
              <p class="text-sm text-gray-600">حذف داده‌های غیرضروری</p>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Table Statistics -->
    <div class="card">
      <div class="card-header">
        <h3 class="font-semibold text-gray-900">آمار جداول</h3>
        <button
          @click="loadTableStats"
          :disabled="isLoading"
          class="btn btn-primary btn-sm"
        >
          <LoadingSpinner v-if="isLoading" size="sm" color="white" class="ml-2" />
          <i v-else class="fas fa-sync ml-2"></i>
          به‌روزرسانی
        </button>
      </div>
      <div class="card-body">
        <div v-if="isLoading" class="text-center py-8">
          <LoadingSpinner size="lg" />
          <p class="mt-4 text-gray-600">در حال بارگذاری آمار جداول...</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th class="text-right">نام جدول</th>
                <th class="text-center">تعداد رکورد</th>
                <th class="text-center">اندازه</th>
                <th class="text-center">آخرین به‌روزرسانی</th>
                <th class="text-center">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="table in tableStats" :key="table.name">
                <td class="text-right font-medium">
                  <div class="flex items-center space-x-2 space-x-reverse">
                    <div class="table-icon" :class="getTableIconClass(table.name)">
                      <i :class="getTableIcon(table.name)"></i>
                    </div>
                    <span>{{ getTableDisplayName(table.name) }}</span>
                  </div>
                </td>
                
                <td class="text-center">
                  <span class="font-semibold">{{ formatNumber(table.recordCount) }}</span>
                </td>
                
                <td class="text-center">
                  <span class="text-sm">{{ formatFileSize(table.size || 0) }}</span>
                </td>
                
                <td class="text-center">
                  <span class="text-sm">{{ formatDateTime(table.lastUpdate) }}</span>
                </td>
                
                <td class="text-center">
                  <span
                    class="status-indicator"
                    :class="getTableStatusClass(table.recordCount)"
                  >
                    {{ getTableStatus(table.recordCount) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Backup History -->
    <div class="card">
      <div class="card-header">
        <h3 class="font-semibold text-gray-900">تاریخچه پشتیبان‌گیری</h3>
      </div>
      <div class="card-body">
        <div class="space-y-3">
          <div
            v-for="backup in backupHistory"
            :key="backup.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center space-x-3 space-x-reverse">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i class="fas fa-database text-blue-600"></i>
              </div>
              
              <div>
                <p class="font-medium text-gray-900">پشتیبان {{ backup.type }}</p>
                <div class="flex items-center space-x-4 space-x-reverse text-sm text-gray-600">
                  <span>{{ formatDateTime(backup.timestamp) }}</span>
                  <span>{{ formatFileSize(backup.size) }}</span>
                  <span class="status-indicator success">موفق</span>
                </div>
              </div>
            </div>
            
            <div class="flex space-x-2 space-x-reverse">
              <button
                @click="downloadBackup(backup)"
                class="btn btn-outline btn-sm"
                title="دانلود پشتیبان"
              >
                <i class="fas fa-download"></i>
              </button>
              
              <button
                @click="deleteBackup(backup)"
                class="btn btn-error btn-sm"
                title="حذف پشتیبان"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          
          <div v-if="backupHistory.length === 0" class="text-center py-8 text-gray-500">
            <i class="fas fa-archive text-3xl mb-3"></i>
            <p>هیچ پشتیبانی موجود نیست</p>
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
import { formatDateTime, formatFileSize, formatNumber } from '@/utils/helpers'

const adminStore = useAdminStore()

// State
const isLoading = ref(false)
const isProcessing = ref(false)
const currentOperation = ref('')
const tableStats = ref([
  {
    name: 'profiles',
    recordCount: 45,
    size: 524288, // 512KB
    lastUpdate: new Date().toISOString()
  },
  {
    name: 'social_posts',
    recordCount: 128,
    size: 1048576, // 1MB
    lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    name: 'post_comments',
    recordCount: 342,
    size: 786432, // 768KB
    lastUpdate: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    name: 'vibration_data',
    recordCount: 2847,
    size: 15728640, // 15MB
    lastUpdate: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  }
])

const backupHistory = ref([
  {
    id: 1,
    type: 'خودکار',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    size: 18874368, // 18MB
    status: 'success'
  },
  {
    id: 2,
    type: 'دستی',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    size: 17825792, // 17MB
    status: 'success'
  },
  {
    id: 3,
    type: 'خودکار',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    size: 16777216, // 16MB
    status: 'success'
  }
])

// Computed
const lastBackupTime = computed(() => {
  if (backupHistory.value.length === 0) return 'هیچ پشتیبانی موجود نیست'
  
  const latest = backupHistory.value[0]
  return formatDateTime(latest.timestamp)
})

// Methods
const getTableDisplayName = (tableName) => {
  const names = {
    profiles: 'پروفایل کاربران',
    social_posts: 'پست‌های اجتماعی',
    post_comments: 'نظرات پست‌ها',
    post_likes: 'لایک‌های پست‌ها',
    vibration_data: 'داده‌های ویبره',
    approved_users: 'کاربران تایید شده',
    user_roles: 'نقش‌های کاربران',
    equipment_master: 'اطلاعات تجهیزات'
  }
  return names[tableName] || tableName
}

const getTableIcon = (tableName) => {
  const icons = {
    profiles: 'fas fa-users',
    social_posts: 'fas fa-file-alt',
    post_comments: 'fas fa-comments',
    post_likes: 'fas fa-heart',
    vibration_data: 'fas fa-chart-line',
    approved_users: 'fas fa-user-check',
    user_roles: 'fas fa-shield-alt',
    equipment_master: 'fas fa-cogs'
  }
  return icons[tableName] || 'fas fa-table'
}

const getTableIconClass = (tableName) => {
  const classes = {
    profiles: 'bg-blue-100 text-blue-600',
    social_posts: 'bg-green-100 text-green-600',
    post_comments: 'bg-purple-100 text-purple-600',
    post_likes: 'bg-red-100 text-red-600',
    vibration_data: 'bg-yellow-100 text-yellow-600',
    approved_users: 'bg-teal-100 text-teal-600',
    user_roles: 'bg-orange-100 text-orange-600',
    equipment_master: 'bg-gray-100 text-gray-600'
  }
  return classes[tableName] || 'bg-gray-100 text-gray-600'
}

const getTableStatus = (recordCount) => {
  if (recordCount > 1000) return 'حجیم'
  if (recordCount > 100) return 'متوسط'
  return 'کم'
}

const getTableStatusClass = (recordCount) => {
  if (recordCount > 1000) return 'status-indicator warning'
  if (recordCount > 100) return 'status-indicator info'
  return 'status-indicator success'
}

const createBackup = async () => {
  if (window.$confirm) {
    window.$confirm(
      'ایجاد پشتیبان',
      'آیا می‌خواهید از کل دیتابیس پشتیبان‌گیری کنید؟',
      async () => {
        isProcessing.value = true
        currentOperation.value = 'backup'
        
        try {
          // Simulate backup process
          await new Promise(resolve => setTimeout(resolve, 3000))
          
          // Add new backup to history
          const newBackup = {
            id: Date.now(),
            type: 'دستی',
            timestamp: new Date().toISOString(),
            size: Math.floor(Math.random() * 5000000) + 15000000, // Random size between 15-20MB
            status: 'success'
          }
          
          backupHistory.value.unshift(newBackup)
          
          window.$toast('پشتیبان با موفقیت ایجاد شد', 'success')
          
        } catch (error) {
          window.$toast('خطا در ایجاد پشتیبان', 'error')
        } finally {
          isProcessing.value = false
          currentOperation.value = ''
        }
      }
    )
  }
}

const optimizeDatabase = async () => {
  if (window.$confirm) {
    window.$confirm(
      'بهینه‌سازی دیتابیس',
      'این عملیات ممکن است چند دقیقه طول بکشد. ادامه دهید؟',
      async () => {
        isProcessing.value = true
        currentOperation.value = 'optimize'
        
        try {
          // Simulate optimization process
          await new Promise(resolve => setTimeout(resolve, 4000))
          
          window.$toast('دیتابیس با موفقیت بهینه‌سازی شد', 'success')
          
        } catch (error) {
          window.$toast('خطا در بهینه‌سازی دیتابیس', 'error')
        } finally {
          isProcessing.value = false
          currentOperation.value = ''
        }
      }
    )
  }
}

const analyzeStorage = async () => {
  isProcessing.value = true
  currentOperation.value = 'analyze'
  
  try {
    // Simulate analysis process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update table stats with new random data
    tableStats.value = tableStats.value.map(table => ({
      ...table,
      size: Math.floor(Math.random() * 2000000) + 500000, // Random size
      lastUpdate: new Date().toISOString()
    }))
    
    window.$toast('تحلیل فضای ذخیره‌سازی تکمیل شد', 'success')
    
  } catch (error) {
    window.$toast('خطا در تحلیل فضای ذخیره‌سازی', 'error')
  } finally {
    isProcessing.value = false
    currentOperation.value = ''
  }
}

const cleanupDatabase = async () => {
  if (window.$confirm) {
    window.$confirm(
      'پاکسازی دیتابیس',
      'آیا می‌خواهید داده‌های قدیمی و غیرضروری حذف شوند؟',
      async () => {
        isProcessing.value = true
        currentOperation.value = 'cleanup'
        
        try {
          // Simulate cleanup process
          await new Promise(resolve => setTimeout(resolve, 2500))
          
          window.$toast('پاکسازی دیتابیس با موفقیت انجام شد', 'success')
          
        } catch (error) {
          window.$toast('خطا در پاکسازی دیتابیس', 'error')
        } finally {
          isProcessing.value = false
          currentOperation.value = ''
        }
      }
    )
  }
}

const loadTableStats = async () => {
  isLoading.value = true
  
  try {
    // Simulate loading table stats
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Update with fresh data
    tableStats.value = tableStats.value.map(table => ({
      ...table,
      recordCount: table.recordCount + Math.floor(Math.random() * 10),
      lastUpdate: new Date().toISOString()
    }))
    
    window.$toast('آمار جداول به‌روزرسانی شد', 'success')
    
  } catch (error) {
    window.$toast('خطا در بارگذاری آمار جداول', 'error')
  } finally {
    isLoading.value = false
  }
}

const downloadBackup = (backup) => {
  // Simulate file download
  window.$toast(`شروع دانلود پشتیبان ${backup.type}`, 'info')
}

const deleteBackup = (backup) => {
  if (window.$confirm) {
    window.$confirm(
      'حذف پشتیبان',
      `آیا مطمئن هستید که می‌خواهید پشتیبان ${backup.type} را حذف کنید؟`,
      () => {
        const index = backupHistory.value.findIndex(b => b.id === backup.id)
        if (index !== -1) {
          backupHistory.value.splice(index, 1)
          window.$toast('پشتیبان حذف شد', 'success')
        }
      }
    )
  }
}

// Lifecycle
onMounted(() => {
  // Load initial data if needed
})
</script>

<style scoped>
.table-icon {
  @apply w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0;
}

.status-indicator {
  @apply inline-flex items-center px-2 py-1 rounded-full text-xs font-medium;
}

.status-indicator.success {
  @apply bg-green-100 text-green-800;
}

.status-indicator.warning {
  @apply bg-yellow-100 text-yellow-800;
}

.status-indicator.info {
  @apply bg-blue-100 text-blue-800;
}
</style>