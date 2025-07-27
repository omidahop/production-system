<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4 space-x-reverse">
            <button 
              @click="$router.push('/')"
              class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <i class="fas fa-arrow-right text-gray-600"></i>
            </button>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">پنل مدیریت</h1>
              <p class="text-sm text-gray-600">مدیریت کاربران و سیستم</p>
            </div>
          </div>
          
          <UserProfile />
        </div>
      </div>
    </header>

    <div class="container mx-auto px-4 py-6">
      <!-- Navigation Tabs -->
      <Navigation 
        :tabs="adminTabs"
        v-model:activeTab="activeTab"
        class="mb-6"
      />

      <!-- Content Area -->
      <div class="transition-all duration-300">
        <!-- User Management -->
        <div v-show="activeTab === 'users'">
          <AdminPanel />
        </div>
        
        <!-- System Stats -->
        <div v-show="activeTab === 'stats'">
          <SystemStats />
        </div>
        
        <!-- Database Stats -->
        <div v-show="activeTab === 'database'">
          <DatabaseStats />
        </div>
        
        <!-- User Management -->
        <div v-show="activeTab === 'management'">
          <UserManagement />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAdminStore } from '@/stores/admin'
import Navigation from '@/components/common/Navigation.vue'
import UserProfile from '@/components/auth/UserProfile.vue'
import AdminPanel from '@/components/admin/AdminPanel.vue'
import SystemStats from '@/components/admin/SystemStats.vue'
import DatabaseStats from '@/components/admin/DatabaseStats.vue'
import UserManagement from '@/components/admin/UserManagement.vue'

const router = useRouter()
const authStore = useAuthStore()
const adminStore = useAdminStore()

const activeTab = ref('users')

const adminTabs = [
  {
    id: 'users',
    name: 'مدیریت کاربران',
    icon: 'fas fa-users'
  },
  {
    id: 'management',
    name: 'تایید حساب‌ها',
    icon: 'fas fa-user-check'
  },
  {
    id: 'stats',
    name: 'آمار سیستم',
    icon: 'fas fa-chart-bar'
  },
  {
    id: 'database',
    name: 'دیتابیس',
    icon: 'fas fa-database'
  }
]

onMounted(async () => {
  // Check admin access
  if (!authStore.isAdmin) {
    window.$toast('شما مجاز به دسترسی به این بخش نیستید', 'error')
    router.push('/')
    return
  }
  
  // Load initial admin data
  try {
    await Promise.all([
      adminStore.loadSystemStatistics(),
      adminStore.loadPendingApprovals()
    ])
  } catch (error) {
    console.error('Error loading admin data:', error)
  }
})
</script>