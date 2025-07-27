import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import adminService from '@/services/adminService'
import { useAuthStore } from './auth'

export const useAdminStore = defineStore('admin', () => {
  // State
  const users = ref([])
  const pendingUsers = ref([])
  const systemStats = ref({})
  const activityLogs = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const currentPage = ref(1)
  const hasMore = ref(true)

  // Get auth store
  const authStore = useAuthStore()

  // Computed
  const approvedUsers = computed(() => 
    users.value.filter(user => user.is_approved)
  )

  const adminUsers = computed(() => 
    users.value.filter(user => user.is_admin)
  )

  const totalUsers = computed(() => users.value.length)

  const pendingApprovalsCount = computed(() => pendingUsers.value.length)

  // Actions
  const loadAllUsers = async (page = 1, limit = 50, refresh = false) => {
    if (refresh) {
      users.value = []
      currentPage.value = 1
      hasMore.value = true
    }

    if (!authStore.isAdmin) {
      throw new Error('شما مجاز به انجام این عملیات نیستید')
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const newUsers = await adminService.getAllUsers(page, limit)
      
      if (refresh) {
        users.value = newUsers
      } else {
        users.value.push(...newUsers)
      }
      
      currentPage.value = page
      hasMore.value = newUsers.length === limit
      
      return newUsers
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const loadMoreUsers = async () => {
    if (!hasMore.value || isLoading.value) return
    
    await loadAllUsers(currentPage.value + 1, 50, false)
  }

  const approveUser = async (userId) => {
    if (!authStore.isAdmin) {
      throw new Error('شما مجاز به انجام این عملیات نیستید')
    }
    
    try {
      await adminService.approveUser(userId, authStore.user.id)
      
      // Update user in arrays
      const userIndex = users.value.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        users.value[userIndex].is_approved = true
        users.value[userIndex].approval_date = new Date().toISOString()
      }
      
      // Remove from pending users
      pendingUsers.value = pendingUsers.value.filter(u => u.id !== userId)
      
      return true
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const revokeUserApproval = async (userId) => {
    if (!authStore.isAdmin) {
      throw new Error('شما مجاز به انجام این عملیات نیستید')
    }
    
    try {
      await adminService.revokeUserApproval(userId)
      
      // Update user in array
      const userIndex = users.value.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        users.value[userIndex].is_approved = false
        users.value[userIndex].approval_date = null
        
        // Add to pending users
        pendingUsers.value.push(users.value[userIndex])
      }
      
      return true
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const grantAdminRole = async (userId) => {
    if (!authStore.isAdmin) {
      throw new Error('شما مجاز به انجام این عملیات نیستید')
    }
    
    try {
      await adminService.grantRole(userId, 'admin', authStore.user.id)
      
      // Update user in array
      const userIndex = users.value.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        users.value[userIndex].is_admin = true
        if (!users.value[userIndex].roles.includes('admin')) {
          users.value[userIndex].roles.push('admin')
        }
      }
      
      return true
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const revokeAdminRole = async (userId) => {
    if (!authStore.isAdmin) {
      throw new Error('شما مجاز به انجام این عملیات نیستید')
    }
    
    try {
      await adminService.revokeRole(userId, 'admin')
      
      // Update user in array
      const userIndex = users.value.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        users.value[userIndex].is_admin = false
        users.value[userIndex].roles = users.value[userIndex].roles.filter(role => role !== 'admin')
      }
      
      return true
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const loadPendingApprovals = async () => {
    if (!authStore.isAdmin) {
      throw new Error('شما مجاز به انجام این عملیات نیستید')
    }
    
    isLoading.value = true
    
    try {
      const pending = await adminService.getPendingApprovals()
      pendingUsers.value = pending
      return pending
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const loadSystemStatistics = async () => {
    if (!authStore.isAdmin) {
      throw new Error('شما مجاز به انجام این عملیات نیستید')
    }
    
    try {
      const stats = await adminService.getSystemStatistics()
      systemStats.value = stats
      return stats
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const loadActivityLogs = async (userId = null, limit = 100) => {
    if (!authStore.isAdmin) {
      throw new Error('شما مجاز به انجام این عملیات نیستید')
    }
    
    isLoading.value = true
    
    try {
      const logs = await adminService.getUserActivityLogs(userId, limit)
      activityLogs.value = logs
      return logs
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteUser = async (userId) => {
    if (!authStore.isAdmin) {
      throw new Error('شما مجاز به انجام این عملیات نیستید')
    }
    
    try {
      await adminService.deleteUser(userId)
      
      // Remove user from arrays
      users.value = users.value.filter(u => u.id !== userId)
      pendingUsers.value = pendingUsers.value.filter(u => u.id !== userId)
      
      return true
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const updateUserProfile = async (userId, updates) => {
    if (!authStore.isAdmin) {
      throw new Error('شما مجاز به انجام این عملیات نیستید')
    }
    
    try {
      await adminService.updateUserProfile(userId, updates)
      
      // Update user in array
      const userIndex = users.value.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        users.value[userIndex] = { ...users.value[userIndex], ...updates }
      }
      
      return true
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const bulkApproveUsers = async (userIds) => {
    if (!authStore.isAdmin) {
      throw new Error('شما مجاز به انجام این عملیات نیستید')
    }
    
    try {
      await adminService.bulkApproveUsers(userIds, authStore.user.id)
      
      // Update users in arrays
      userIds.forEach(userId => {
        const userIndex = users.value.findIndex(u => u.id === userId)
        if (userIndex !== -1) {
          users.value[userIndex].is_approved = true
          users.value[userIndex].approval_date = new Date().toISOString()
        }
      })
      
      // Remove from pending users
      pendingUsers.value = pendingUsers.value.filter(u => !userIds.includes(u.id))
      
      return true
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const bulkRevokeApprovals = async (userIds) => {
    if (!authStore.isAdmin) {
      throw new Error('شما مجاز به انجام این عملیات نیستید')
    }
    
    try {
      await adminService.bulkRevokeApprovals(userIds)
      
      // Update users in arrays
      userIds.forEach(userId => {
        const userIndex = users.value.findIndex(u => u.id === userId)
        if (userIndex !== -1) {
          users.value[userIndex].is_approved = false
          users.value[userIndex].approval_date = null
          
          // Add to pending users
          pendingUsers.value.push(users.value[userIndex])
        }
      })
      
      return true
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Content moderation
  const deletePost = async (postId) => {
    if (!authStore.isAdmin && !authStore.isModerator) {
      throw new Error('شما مجاز به انجام این عملیات نیستید')
    }
    
    try {
      await adminService.deletePost(postId)
      return true
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const deleteComment = async (commentId) => {
    if (!authStore.isAdmin && !authStore.isModerator) {
      throw new Error('شما مجاز به انجام این عملیات نیستید')
    }
    
    try {
      await adminService.deleteComment(commentId)
      return true
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Search and filter
  const searchUsers = (query) => {
    if (!query.trim()) return users.value
    
    const searchTerm = query.toLowerCase()
    return users.value.filter(user => 
      user.username?.toLowerCase().includes(searchTerm) ||
      user.full_name?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm) ||
      user.department?.toLowerCase().includes(searchTerm)
    )
  }

  const filterUsersByStatus = (status) => {
    switch (status) {
      case 'approved':
        return approvedUsers.value
      case 'pending':
        return users.value.filter(user => !user.is_approved)
      case 'admin':
        return adminUsers.value
      default:
        return users.value
    }
  }

  // Clear store
  const clearStore = () => {
    users.value = []
    pendingUsers.value = []
    systemStats.value = {}
    activityLogs.value = []
    error.value = null
    currentPage.value = 1
    hasMore.value = true
  }

  return {
    // State
    users,
    pendingUsers,
    systemStats,
    activityLogs,
    isLoading,
    error,
    currentPage,
    hasMore,
    
    // Computed
    approvedUsers,
    adminUsers,
    totalUsers,
    pendingApprovalsCount,
    
    // Actions
    loadAllUsers,
    loadMoreUsers,
    approveUser,
    revokeUserApproval,
    grantAdminRole,
    revokeAdminRole,
    loadPendingApprovals,
    loadSystemStatistics,
    loadActivityLogs,
    deleteUser,
    updateUserProfile,
    bulkApproveUsers,
    bulkRevokeApprovals,
    
    // Content moderation
    deletePost,
    deleteComment,
    
    // Search and filter
    searchUsers,
    filterUsersByStatus,
    
    // Utilities
    clearStore
  }
})