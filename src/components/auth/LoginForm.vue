<template>
  <form @submit.prevent="handleLogin" class="space-y-6">
    <div>
      <label class="form-label">ایمیل</label>
      <input
        v-model="loginForm.email"
        type="email"
        class="form-control"
        placeholder="example@domain.com"
        required
        :disabled="isLoading"
      >
    </div>
    
    <div>
      <label class="form-label">رمز عبور</label>
      <div class="relative">
        <input
          v-model="loginForm.password"
          :type="showPassword ? 'text' : 'password'"
          class="form-control pr-12"
          placeholder="رمز عبور را وارد کنید"
          required
          :disabled="isLoading"
        >
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          :disabled="isLoading"
        >
          <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
        </button>
      </div>
    </div>
    
    <div class="flex items-center justify-between">
      <label class="flex items-center">
        <input
          v-model="loginForm.rememberMe"
          type="checkbox"
          class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          :disabled="isLoading"
        >
        <span class="mr-2 text-sm text-gray-600">مرا به خاطر بسپار</span>
      </label>
      
      <button
        type="button"
        @click="showForgotPassword = true"
        class="text-sm text-primary-600 hover:text-primary-500"
        :disabled="isLoading"
      >
        فراموشی رمز عبور
      </button>
    </div>
    
    <button
      type="submit"
      class="btn btn-primary w-full"
      :disabled="isLoading"
    >
      <LoadingSpinner v-if="isLoading" size="sm" color="white" class="ml-2" />
      ورود
    </button>

    <!-- Forgot Password Modal -->
    <div v-if="showForgotPassword" class="modal-backdrop" @click.self="showForgotPassword = false">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">بازیابی رمز عبور</h3>
        <form @submit.prevent="handleForgotPassword" class="space-y-4">
          <div>
            <label class="form-label">ایمیل</label>
            <input
              v-model="forgotPasswordEmail"
              type="email"
              class="form-control"
              placeholder="ایمیل خود را وارد کنید"
              required
            >
          </div>
          <div class="flex space-x-3 space-x-reverse">
            <button type="submit" class="btn btn-primary flex-1">
              ارسال لینک بازیابی
            </button>
            <button 
              type="button" 
              @click="showForgotPassword = false"
              class="btn btn-outline"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const showPassword = ref(false)
const showForgotPassword = ref(false)
const forgotPasswordEmail = ref('')

const loginForm = ref({
  email: '',
  password: '',
  rememberMe: false
})

const handleLogin = async () => {
  isLoading.value = true
  
  try {
    await authStore.login(loginForm.value.email, loginForm.value.password)
    
    window.$toast('با موفقیت وارد شدید', 'success')
    router.push('/')
  } catch (error) {
    window.$toast(error.message, 'error')
  } finally {
    isLoading.value = false
  }
}

const handleForgotPassword = async () => {
  try {
    await authStore.resetPassword(forgotPasswordEmail.value)
    
    showForgotPassword.value = false
    forgotPasswordEmail.value = ''
    window.$toast('لینک بازیابی رمز عبور به ایمیل شما ارسال شد', 'success')
  } catch (error) {
    window.$toast(error.message, 'error')
  }
}
</script>