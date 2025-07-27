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
              <h1 class="text-2xl font-bold text-gray-900">سیستم ثبت و پایش ویبره</h1>
              <p class="text-sm text-gray-600">مدیریت داده‌های ویبره تجهیزات</p>
            </div>
          </div>
          
          <UserProfile />
        </div>
      </div>
    </header>

    <div class="container mx-auto px-4 py-6">
      <!-- Navigation Tabs -->
      <Navigation 
        :tabs="vibrationTabs"
        v-model:activeTab="activeTab"
        class="mb-6"
      />

      <!-- Content Area -->
      <div class="transition-all duration-300">
        <!-- Data Entry -->
        <DataEntry v-show="activeTab === 'data-entry'" />
        
        <!-- View Data -->
        <ViewData v-show="activeTab === 'view-data'" />
        
        <!-- Charts -->
        <Charts v-show="activeTab === 'charts'" />
        
        <!-- Analysis -->
        <Analysis v-show="activeTab === 'analysis'" />
        
        <!-- Slideshow -->
        <Slideshow v-show="activeTab === 'slideshow'" />
        
        <!-- Settings -->
        <Settings v-show="activeTab === 'settings'" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useVibrationStore } from '@/stores/vibration'
import Navigation from '@/components/common/Navigation.vue'
import UserProfile from '@/components/auth/UserProfile.vue'
import DataEntry from '@/components/vibration/DataEntry.vue'
import ViewData from '@/components/vibration/ViewData.vue'
import Charts from '@/components/vibration/Charts.vue'
import Analysis from '@/components/vibration/Analysis.vue'
import Slideshow from '@/components/vibration/Slideshow.vue'
import Settings from '@/components/vibration/Settings.vue'

const vibrationStore = useVibrationStore()
const activeTab = ref('data-entry')

const vibrationTabs = [
  {
    id: 'data-entry',
    name: 'ثبت داده',
    icon: 'fas fa-edit'
  },
  {
    id: 'view-data',
    name: 'مشاهده داده‌ها',
    icon: 'fas fa-table'
  },
  {
    id: 'charts',
    name: 'نمودار',
    icon: 'fas fa-chart-area'
  },
  {
    id: 'analysis',
    name: 'آنالیز',
    icon: 'fas fa-search'
  },
  {
    id: 'slideshow',
    name: 'اسلایدشو',
    icon: 'fas fa-play'
  },
  {
    id: 'settings',
    name: 'تنظیمات',
    icon: 'fas fa-cog'
  }
]

onMounted(() => {
  // Load vibration settings
  vibrationStore.loadSettings()
})
</script>