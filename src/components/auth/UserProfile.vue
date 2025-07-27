<template>
  <div class="relative">
    <button
      @click="showDropdown = !showDropdown"
      class="flex items-center space-x-3 space-x-reverse p-2 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div class="user-avatar">
        {{ userInitial }}
      </div>
      <div class="hidden sm:block text-right">
        <p class="text-sm font-medium text-gray-900">
          {{ authStore.profile?.full_name || 'کاربر میهمان' }}
        </p>
        <p class="text-xs text-gray-500">
          {{ authStore.profile?.department || 'نامشخص' }}
        </p>
      </div>
      <i class="fas fa-chevron-down text-gray-400 transform transition-transform" 
         :class="{ 'rotate-180': showDropdown }"></i>
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="showDropdown"
      class="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
      @click.stop
    >
      <!-- User Info -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center space-x-3 space-x-reverse">
          <div class="user-avatar bg-primary-600 text-white">
            {{ userInitial }}
          </div>
          <div class="flex-1">
            <p class="font-medium text-gray-900">
              {{ authStore.profile?.full_name || 'کاربر میهمان' }}
            </p>
            <p class="text-sm text-gray-500">
              {{ authStore.user?.email }}
            </p>
            <div class="flex items-center mt-1">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                <span class="w-2 h-2 bg-green-400 rounded-full ml-1"></span>
                آنلاین
              </span>
              <span v-if="authStore.isAdmin" class="mr-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                مدیر
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Menu Items -->
      <div class="py-2">
        <button
          @click="showProfileModal = true; showDropdown = false"
          class="w-full flex items-center px-4 py-3 text-right hover:bg-gray-50 text-gray-700"
        >
          <i class="fas fa-user text-gray-400 ml-3"></i>
          ویرایش پروفایل
        </button>
        
        <button
          @click="$toggleTheme(); showDropdown = false"
          class="w-full flex items-center px-4 py-3 text-right hover:bg-gray-50 text-gray-700"
        >
          <i class="fas fa-moon text-gray-400 ml-3"></i>
          تغییر تم
        </button>
        
        <div class="border-t border-gray-200 my-2"></div>
        
        <button
          @click="handleLogout"
          class="w-full flex items-center px-4 py-3 text-right hover:bg-gray-50 text-red-600"
        >
          <i class="fas fa-sign-out-alt text-red-500 ml-3"></i>
          خروج
        </button>
      </div>
    </div>

    <!-- Profile Edit Modal -->
    <div v-if="showProfileModal" class="modal-backdrop" @click.self="showProfileModal = false">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">ویرایش پروفایل</h3>
          <button @click="showProfileModal = false" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="handleUpdateProfile" class="space-y-4">
          <div>
            <label class="form-label">نام و نام خانوادگی</label>
            <input
              v-model="profileForm.full_name"
              type="text"
              class="form-control"
              required
            >
          </div>
          
          <div>
            <label class="form-label">نام کاربری</label>
            <input
              v-model="profileForm.username"
              type="text"
              class="form-control"
              required
            >
          </div>
          
          <div>
            <label class="form-label">بخش</label>
            <select v-model="profileForm.department" class="form-control">
              <option value="mechanical">مکانیک</option>
              <option value="electrical">برق</option>
              <option value="automation">اتوماسیون</option>
              <option value="production">تولید</option>
              <option value="maintenance">نگهداری</option>
            </select>
          </div>
          
          <div class="flex space-x-3 space-x-reverse pt-4">
            <button type="submit" class="btn btn-primary flex-1" :disabled="isUpdating">
              <LoadingSpinner v-if="isUpdating" size="sm" color="white" class="ml-2" />
              ذخیره تغییرات
            </button>
            <button 
              type="button" 
              @click="showProfileModal = false"
              class="btn btn-outline"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()

const showDropdown = ref(false)
const showProfileModal = ref(false)
const isUpdating = ref(false)

const profileForm = ref({
  full_name: '',
  username: '',
  department: ''
})

const userInitial = computed(() => {
  const name = authStore.profile?.full_name || authStore.user?.email
  return name ? name.charAt(0).toUpperCase() : 'U'
})

const handleLogout = async () => {
  showDropdown.value = false
  
  try {
    await authStore.logout()
    window.$toast('با موفقیت خارج شدید', 'success')
    router.push('/login')
  } catch (error) {
    window.$toast(error.message, 'error')
  }
}

const handleUpdateProfile = async () => {
  isUpdating.value = true
  
  try {
    await authStore.updateProfile(profileForm.value)
    
    showProfileModal.value = false
    window.$toast('پروفایل با موفقیت به‌روزرسانی شد', 'success')
  } catch (error) {
    window.$toast(error.message, 'error')
  } finally {
    isUpdating.value = false
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showDropdown.value = false
  }
}

// Initialize profile form
watch(() => authStore.profile, (profile) => {
  if (profile) {
    profileForm.value = {
      full_name: profile.full_name || '',
      username: profile.username || '',
      department: profile.department || 'mechanical'
    }
  }
}, { immediate: true })

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>