<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="mx-auto h-20 w-20 bg-primary-600 rounded-full flex items-center justify-center mb-6">
          <i class="fas fa-industry text-3xl text-white"></i>
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">
          سیستم جامع تولید
        </h2>
        <p class="text-sm text-gray-600">
          برای ادامه وارد حساب کاربری خود شوید
        </p>
      </div>

      <!-- Login Form -->
      <div class="card">
        <div class="card-body">
          <LoginForm />
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center text-sm text-gray-500">
        <p>
          حساب کاربری ندارید؟ 
          <button 
            @click="showRegisterForm = true"
            class="text-primary-600 hover:text-primary-500 font-medium"
          >
            ثبت نام کنید
          </button>
        </p>
      </div>
    </div>

    <!-- Register Modal -->
    <div 
      v-if="showRegisterForm"
      class="modal-backdrop"
      @click.self="showRegisterForm = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">ثبت نام</h3>
          <button 
            @click="showRegisterForm = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="form-label">نام و نام خانوادگی</label>
            <input 
              v-model="registerForm.fullName"
              type="text" 
              class="form-control"
              required
            >
          </div>
          
          <div>
            <label class="form-label">نام کاربری</label>
            <input 
              v-model="registerForm.username"
              type="text" 
              class="form-control"
              required
            >
          </div>
          
          <div>
            <label class="form-label">ایمیل</label>
            <input 
              v-model="registerForm.email"
              type="email" 
              class="form-control"
              required
            >
          </div>
          
          <div>
            <label class="form-label">رمز عبور</label>
            <input 
              v-model="registerForm.password"
              type="password" 
              class="form-control"
              required
            >
          </div>
          
          <div>
            <label class="form-label">بخش</label>
            <select v-model="registerForm.department" class="form-control">
              <option value="mechanical">مکانیک</option>
              <option value="electrical">برق</option>
              <option value="automation">اتوماسیون</option>
              <option value="production">تولید</option>
              <option value="maintenance">نگهداری</option>
            </select>
          </div>
          
          <div class="flex space-x-3 space-x-reverse">
            <button 
              type="submit" 
              class="btn btn-primary flex-1"
              :disabled="isLoading"
            >
              <LoadingSpinner v-if="isLoading" class="w-4 h-4 ml-2" />
              ثبت نام
            </button>
            <button 
              type="button" 
              @click="showRegisterForm = false"
              class="btn btn-outline"
            >
              انصراف
            </button>
          </div>
        </form>
        
        <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p class="text-sm text-yellow-800">
            <i class="fas fa-info-circle ml-1"></i>
            پس از ثبت نام، حساب شما توسط مدیر سیستم بررسی و تایید می‌شود.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginForm from '@/components/auth/LoginForm.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { validateEmail, validatePassword, validateUsername } from '@/utils/helpers'

const router = useRouter()
const authStore = useAuthStore()

const showRegisterForm = ref(false)
const isLoading = ref(false)

const registerForm = ref({
  fullName: '',
  username: '',
  email: '',
  password: '',
  department: 'mechanical'
})

const handleRegister = async () => {
  // Validation
  if (!validateEmail(registerForm.value.email)) {
    window.$toast('ایمیل معتبر وارد کنید', 'error')
    return
  }
  
  if (!validatePassword(registerForm.value.password)) {
    window.$toast('رمز عبور باید حداقل ۸ کاراکتر باشد', 'error')
    return
  }
  
  if (!validateUsername(registerForm.value.username)) {
    window.$toast('نام کاربری باید بین ۳ تا ۵۰ کاراکتر و شامل حروف، اعداد و _ باشد', 'error')
    return
  }

  isLoading.value = true
  
  try {
    await authStore.register(
      registerForm.value.email,
      registerForm.value.password,
      {
        full_name: registerForm.value.fullName,
        username: registerForm.value.username,
        department: registerForm.value.department
      }
    )
    
    showRegisterForm.value = false
    window.$toast('ثبت نام موفقیت‌آمیز بود. لطفاً منتظر تایید حساب کاربری خود باشید.', 'success')
    
    // Reset form
    registerForm.value = {
      fullName: '',
      username: '',
      email: '',
      password: '',
      department: 'mechanical'
    }
  } catch (error) {
    window.$toast(error.message, 'error')
  } finally {
    isLoading.value = false
  }
}
</script>