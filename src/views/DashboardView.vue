<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4 space-x-reverse">
            <div class="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
              <i class="fas fa-industry text-xl text-white"></i>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">سیستم جامع تولید</h1>
              <p class="text-sm text-gray-600">خوش آمدید، {{ authStore.profile?.full_name || authStore.user?.email }}</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-4 space-x-reverse">
            <UserProfile />
            <button 
              @click="$toggleTheme()"
              class="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <i class="fas fa-moon text-gray-600"></i>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <!-- Welcome Section -->
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">
          به سیستم جامع تولید خوش آمدید
        </h2>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          این سیستم شامل ابزارهای ثبت و پایش ویبره تجهیزات و شبکه اجتماعی مکانیک است
        </p>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-chart-line text-2xl text-blue-600"></i>
            </div>
            <div class="mr-4">
              <p class="text-sm font-medium text-gray-600">رکوردهای ویبره</p>
              <p class="text-2xl font-bold text-gray-900">{{ statistics.vibrationRecords || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-users text-2xl text-green-600"></i>
            </div>
            <div class="mr-4">
              <p class="text-sm font-medium text-gray-600">کاربران فعال</p>
              <p class="text-2xl font-bold text-gray-900">{{ statistics.activeUsers || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-comments text-2xl text-purple-600"></i>
            </div>
            <div class="mr-4">
              <p class="text-sm font-medium text-gray-600">پست‌های اجتماعی</p>
              <p class="text-2xl font-bold text-gray-900">{{ statistics.socialPosts || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-cog text-2xl text-yellow-600"></i>
            </div>
            <div class="mr-4">
              <p class="text-sm font-medium text-gray-600">تجهیزات فعال</p>
              <p class="text-2xl font-bold text-gray-900">{{ statistics.activeEquipment || '24' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- System Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <!-- Vibration System Card -->
        <div 
          class="system-card vibration-system cursor-pointer"
          @click="$router.push('/vibration-system')"
        >
          <div class="card-body p-8">
            <div class="flex items-center mb-6">
              <div class="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                <i class="fas fa-chart-line text-3xl text-blue-600"></i>
              </div>
              <div class="mr-6">
                <h3 class="text-2xl font-bold text-gray-900 mb-2">سیستم ثبت و پایش ویبره</h3>
                <p class="text-gray-600">ثبت، مشاهده و آنالیز داده‌های ویبره تجهیزات</p>
              </div>
            </div>
            
            <div class="space-y-3">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">رکوردهای امروز:</span>
                <span class="font-semibold text-blue-600">{{ todayVibrationData }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">تجهیزات DRI1:</span>
                <span class="font-semibold text-blue-600">12</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">تجهیزات DRI2:</span>
                <span class="font-semibold text-red-600">12</span>
              </div>
            </div>
            
            <div class="mt-6 flex items-center text-blue-600 font-medium">
              <span>ورود به سیستم ویبره</span>
              <i class="fas fa-arrow-left mr-2"></i>
            </div>
          </div>
        </div>

        <!-- Mechanical Net Card -->
        <div 
          class="system-card mechanical-net cursor-pointer"
          @click="$router.push('/mechanical-net')"
        >
          <div class="card-body p-8">
            <div class="flex items-center mb-6">
              <div class="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                <i class="fas fa-users text-3xl text-green-600"></i>
              </div>
              <div class="mr-6">
                <h3 class="text-2xl font-bold text-gray-900 mb-2">شبکه اجتماعی مکانیک</h3>
                <p class="text-gray-600">پلتفرم ارتباطی و اشتراک‌گذاری اطلاعات</p>
              </div>
            </div>
            
            <div class="space-y-3">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">کاربران آنلاین:</span>
                <span class="font-semibold text-green-600">{{ statistics.onlineUsers || 0 }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">پست‌های امروز:</span>
                <span class="font-semibold text-green-600">{{ todaySocialPosts }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">کل اعضا:</span>
                <span class="font-semibold text-green-600">30</span>
              </div>
            </div>
            
            <div class="mt-6 flex items-center text-green-600 font-medium">
              <span>ورود به شبکه مکانیک</span>
              <i class="fas fa-arrow-left mr-2"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin Panel (if admin) -->
      <div 
        v-if="authStore.isAdmin" 
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-shield-alt text-2xl text-red-600"></i>
            </div>
            <div class="mr-4">
              <h3 class="text-lg font-semibold text-gray-900">پنل مدیریت</h3>
              <p class="text-sm text-gray-600">مدیریت کاربران و نظارت بر سیستم</p>
            </div>
          </div>
          <button 
            @click="$router.push('/admin')"
            class="btn btn-primary"
          >
            <i class="fas fa-cog ml-2"></i>
            ورود به پنل مدیریت
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div class="text-center p-3 bg-gray-50 rounded-lg">
            <p class="text-2xl font-bold text-red-600">{{ statistics.pendingUsers || 0 }}</p>
            <p class="text-sm text-gray-600">درخواست منتظر تایید</p>
          </div>
          <div class="text-center p-3 bg-gray-50 rounded-lg">
            <p class="text-2xl font-bold text-green-600">{{ statistics.approvedUsers || 0 }}</p>
            <p class="text-sm text-gray-600">کاربر تایید شده</p>
          </div>
          <div class="text-center p-3 bg-gray-50 rounded-lg">
            <p class="text-2xl font-bold text-blue-600">{{ statistics.totalUsers || 0 }}</p>
            <p class="text-sm text-gray-600">کل کاربران</p>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-900">فعالیت‌های اخیر</h3>
        </div>
        <div class="card-body">
          <div v-if="recentActivity.length === 0" class="text-center py-8 text-gray-500">
            <i class="fas fa-history text-4xl mb-4"></i>
            <p>فعالیت اخیری وجود ندارد</p>
          </div>
          
          <div v-else class="space-y-4">
            <div 
              v-for="activity in recentActivity" 
              :key="activity.id"
              class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <i :class="getActivityIcon(activity.type)" class="text-blue-600"></i>
              </div>
              <div class="mr-4 flex-1">
                <p class="text-sm font-medium text-gray-900">{{ activity.description }}</p>
                <p class="text-xs text-gray-500">{{ formatRelativeTime(activity.timestamp) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useVibrationStore } from '@/stores/vibration'
import { useSocialMediaStore } from '@/stores/socialMedia'
import { useAdminStore } from '@/stores/admin'
import UserProfile from '@/components/auth/UserProfile.vue'
import { getRelativeTime } from '@/utils/helpers'
import { getCurrentDate } from '@/utils/helpers'

const authStore = useAuthStore()
const vibrationStore = useVibrationStore()
const socialMediaStore = useSocialMediaStore()
const adminStore = useAdminStore()

const statistics = ref({})
const recentActivity = ref([])

const todayVibrationData = computed(() => {
  return Object.keys(vibrationStore.todayData).length || 0
})

const todaySocialPosts = computed(() => {
  const today = getCurrentDate()
  return socialMediaStore.posts.filter(post => 
    post.created_at.split('T')[0] === today
  ).length || 0
})

const formatRelativeTime = (timestamp) => {
  return getRelativeTime(timestamp)
}

const getActivityIcon = (type) => {
  switch (type) {
    case 'vibration': return 'fas fa-chart-line'
    case 'social': return 'fas fa-comments'
    case 'user': return 'fas fa-user'
    case 'admin': return 'fas fa-shield-alt'
    default: return 'fas fa-bell'
  }
}

const loadDashboardStats = async () => {
  try {
    // Load vibration statistics
    const dri1Stats = await vibrationStore.getUnitStatistics('DRI1')
    const dri2Stats = await vibrationStore.getUnitStatistics('DRI2')
    
    // Load social media stats
    await socialMediaStore.loadPosts(1, 10, true)
    
    // Load admin stats if admin
    let adminStats = {}
    if (authStore.isAdmin) {
      adminStats = await adminStore.loadSystemStatistics()
    }
    
    statistics.value = {
      vibrationRecords: (dri1Stats.totalRecords || 0) + (dri2Stats.totalRecords || 0),
      activeUsers: adminStats.approvedUsers || 0,
      socialPosts: socialMediaStore.posts.length || 0,
      activeEquipment: 24,
      onlineUsers: Math.floor(Math.random() * 15) + 5, // Mock data
      pendingUsers: adminStats.pendingUsers || 0,
      approvedUsers: adminStats.approvedUsers || 0,
      totalUsers: adminStats.totalUsers || 0
    }
    
    // Generate recent activity mock data
    recentActivity.value = [
      {
        id: 1,
        type: 'vibration',
        description: 'داده‌های ویبره DRI1 به‌روزرسانی شد',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        type: 'social',
        description: 'پست جدیدی در شبکه مکانیک منتشر شد',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        type: 'user',
        description: 'کاربر جدیدی ثبت نام کرد',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString()
      }
    ]
    
  } catch (error) {
    console.error('Error loading dashboard stats:', error)
  }
}

onMounted(() => {
  loadDashboardStats()
})
</script>