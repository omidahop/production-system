import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const authStore = useAuthStore()

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isAdmin = computed(() => authStore.isAdmin)
  const isModerator = computed(() => authStore.isModerator)
  const user = computed(() => authStore.user)
  const profile = computed(() => authStore.profile)

  const login = async (email, password) => {
    return authStore.login(email, password)
  }

  const logout = async () => {
    return authStore.logout()
  }

  const register = async (email, password, metadata) => {
    return authStore.register(email, password, metadata)
  }

  const updateProfile = async (updates) => {
    return authStore.updateProfile(updates)
  }

  const checkPermission = (requiredRole = null) => {
    return authStore.checkUserPermission(requiredRole)
  }

  return {
    // State
    isAuthenticated,
    isAdmin,
    isModerator,
    user,
    profile,
    
    // Actions
    login,
    logout,
    register,
    updateProfile,
    checkPermission
  }
}