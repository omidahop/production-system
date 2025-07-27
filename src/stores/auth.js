import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'
import { STORAGE_KEYS } from '@/utils/constants'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const profile = ref(null)
  const session = ref(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)

  // Computed
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.roles?.includes('admin') || false)
  const isModerator = computed(() => profile.value?.roles?.includes('moderator') || false)
  
  // Actions
  const login = async (email, password) => {
    isLoading.value = true
    try {
      const result = await authService.signIn(email, password)
      user.value = result.user
      session.value = result.session
      
      // Load user profile
      await loadUserProfile()
      
      // Store session info
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, result.session.access_token)
      
      return result
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const register = async (email, password, metadata = {}) => {
    isLoading.value = true
    try {
      const result = await authService.signUp(email, password, metadata)
      return result
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    isLoading.value = true
    try {
      await authService.signOut()
      user.value = null
      profile.value = null
      session.value = null
      
      // Clear stored data
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES)
      
      return true
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const loadUserProfile = async (userId = null) => {
    try {
      const targetUserId = userId || user.value?.id
      if (!targetUserId) return null

      const userProfile = await authService.getUserProfile(targetUserId)
      
      if (userProfile) {
        // Check roles
        const [isAdminRole] = await Promise.all([
          authService.checkAdminRole(targetUserId)
        ])
        
        profile.value = {
          ...userProfile,
          roles: [],
          is_admin: isAdminRole
        }
        
        if (isAdminRole) profile.value.roles.push('admin')
      }
      
      return userProfile
    } catch (error) {
      console.error('Error loading user profile:', error)
      return null
    }
  }

  const updateProfile = async (updates) => {
    try {
      await authService.updateUserProfile(updates)
      
      // Reload profile
      await loadUserProfile()
      
      return true
    } catch (error) {
      throw error
    }
  }

  const resetPassword = async (email) => {
    try {
      await authService.resetPassword(email)
      return true
    } catch (error) {
      throw error
    }
  }

  const updatePassword = async (newPassword) => {
    try {
      await authService.updatePassword(newPassword)
      return true
    } catch (error) {
      throw error
    }
  }

  const initAuth = async () => {
    if (isInitialized.value) return

    isLoading.value = true
    try {
      const session = await authService.initializeAuth()
      
      if (session?.user) {
        user.value = session.user
        session.value = session
        await loadUserProfile()
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      // Clear any stored tokens on error
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  const checkUserPermission = (requiredRole = null) => {
    if (!isAuthenticated.value) return false
    if (!requiredRole) return true
    
    switch (requiredRole) {
      case 'admin':
        return isAdmin.value
      case 'moderator':
        return isModerator.value || isAdmin.value
      default:
        return true
    }
  }

  // Setup auth state listener
  const setupAuthListener = () => {
    return authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        user.value = null
        profile.value = null
        session.value = null
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      } else if (event === 'SIGNED_IN' && session) {
        user.value = session.user
        session.value = session
        await loadUserProfile()
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, session.access_token)
      } else if (event === 'TOKEN_REFRESHED' && session) {
        session.value = session
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, session.access_token)
      }
    })
  }

  // Return store interface
  return {
    // State
    user,
    profile,
    session,
    isLoading,
    isInitialized,
    
    // Computed
    isAuthenticated,
    isAdmin,
    isModerator,
    
    // Actions
    login,
    register,
    logout,
    loadUserProfile,
    updateProfile,
    resetPassword,
    updatePassword,
    initAuth,
    checkUserPermission,
    setupAuthListener
  }
})