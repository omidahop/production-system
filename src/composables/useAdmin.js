import { ref, computed } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useAuthStore } from '@/stores/auth'

export function useAdmin() {
  const adminStore = useAdminStore()
  const authStore = useAuthStore()
  const isLoading = ref(false)

  const users = computed(() => adminStore.users)
  const pendingUsers = computed(() => adminStore.pendingUsers)
  const systemStats = computed(() => adminStore.systemStats)

  const canAccess = computed(() => authStore.isAdmin)

  const approveUser = async (userId) => {
    if (!canAccess.value) throw new Error('دسترسی مجاز نیست')
    
    isLoading.value = true
    try {
      return await adminStore.approveUser(userId)
    } finally {
      isLoading.value = false
    }
  }

  const revokeUserApproval = async (userId) => {
    if (!canAccess.value) throw new Error('دسترسی مجاز نیست')
    
    isLoading.value = true
    try {
      return await adminStore.revokeUserApproval(userId)
    } finally {
      isLoading.value = false
    }
  }

  const loadUsers = async (page = 1, limit = 50, refresh = false) => {
    if (!canAccess.value) throw new Error('دسترسی مجاز نیست')
    
    isLoading.value = true
    try {
      return await adminStore.loadAllUsers(page, limit, refresh)
    } finally {
      isLoading.value = false
    }
  }

  const loadSystemStats = async () => {
    if (!canAccess.value) throw new Error('دسترسی مجاز نیست')
    
    try {
      return await adminStore.loadSystemStatistics()
    } catch (error) {
      throw error
    }
  }

  return {
    // State
    users,
    pendingUsers,
    systemStats,
    isLoading,
    canAccess,
    
    // Actions
    approveUser,
    revokeUserApproval,
    loadUsers,
    loadSystemStats
  }
}