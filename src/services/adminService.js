import { supabase, DB_TABLES, handleSupabaseError } from './supabaseClient'

class AdminService {
  constructor() {
    this.cache = new Map()
    this.cacheExpiry = 10 * 60 * 1000 // 10 minutes for admin operations
  }

  // Get all users with their profiles and approval status
  async getAllUsers(page = 1, limit = 50) {
    try {
      const cacheKey = `all_users_${page}_${limit}`
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached

      const { data, error } = await supabase
        .from(DB_TABLES.PROFILES)
        .select(`
          *,
          approved_users (
            id,
            approved_at,
            approved_by
          ),
          user_roles (
            role
          )
        `)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) throw error

      const processedData = data.map(user => ({
        ...user,
        is_approved: !!user.approved_users?.[0],
        approval_date: user.approved_users?.[0]?.approved_at,
        roles: user.user_roles.map(r => r.role),
        is_admin: user.user_roles.some(r => r.role === 'admin')
      }))

      this.setCache(cacheKey, processedData)
      return processedData
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Approve user
  async approveUser(userId, adminUserId) {
    try {
      const { error } = await supabase
        .from(DB_TABLES.APPROVED_USERS)
        .insert({
          user_id: userId,
          approved_by: adminUserId,
          approved_at: new Date().toISOString()
        })

      if (error) throw error

      this.clearCache()
      return true
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Revoke user approval
  async revokeUserApproval(userId) {
    try {
      const { error } = await supabase
        .from(DB_TABLES.APPROVED_USERS)
        .delete()
        .eq('user_id', userId)

      if (error) throw error

      this.clearCache()
      return true
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Grant role to user
  async grantRole(userId, role, adminUserId) {
    try {
      const { error } = await supabase
        .from(DB_TABLES.USER_ROLES)
        .insert({
          user_id: userId,
          role,
          granted_by: adminUserId,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      this.clearCache()
      return true
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Revoke role from user
  async revokeRole(userId, role) {
    try {
      const { error } = await supabase
        .from(DB_TABLES.USER_ROLES)
        .delete()
        .eq('user_id', userId)
        .eq('role', role)

      if (error) throw error

      this.clearCache()
      return true
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Get pending approval requests
  async getPendingApprovals() {
    try {
      const { data, error } = await supabase
        .from(DB_TABLES.PROFILES)
        .select(`
          *,
          approved_users (id)
        `)
        .is('approved_users.id', null)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Get system statistics
  async getSystemStatistics() {
    try {
      const cacheKey = 'system_statistics'
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached

      const [
        usersResult,
        approvedUsersResult,
        postsResult,
        commentsResult,
        vibrationDataResult
      ] = await Promise.all([
        supabase.from(DB_TABLES.PROFILES).select('id', { count: 'exact' }),
        supabase.from(DB_TABLES.APPROVED_USERS).select('id', { count: 'exact' }),
        supabase.from(DB_TABLES.SOCIAL_POSTS).select('id', { count: 'exact' }),
        supabase.from(DB_TABLES.POST_COMMENTS).select('id', { count: 'exact' }),
        supabase.from(DB_TABLES.VIBRATION_DATA).select('id', { count: 'exact' })
      ])

      const statistics = {
        totalUsers: usersResult.count || 0,
        approvedUsers: approvedUsersResult.count || 0,
        pendingUsers: (usersResult.count || 0) - (approvedUsersResult.count || 0),
        totalPosts: postsResult.count || 0,
        totalComments: commentsResult.count || 0,
        totalVibrationRecords: vibrationDataResult.count || 0
      }

      this.setCache(cacheKey, statistics)
      return statistics
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Get user activity logs
  async getUserActivityLogs(userId = null, limit = 100) {
    try {
      // This would require an activity log table in a real implementation
      // For now, we'll return recent posts and comments
      let postsQuery = supabase
        .from(DB_TABLES.SOCIAL_POSTS)
        .select(`
          id, content, created_at, user_id,
          profiles (username, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit / 2)

      let commentsQuery = supabase
        .from(DB_TABLES.POST_COMMENTS)
        .select(`
          id, content, created_at, user_id,
          profiles (username, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit / 2)

      if (userId) {
        postsQuery = postsQuery.eq('user_id', userId)
        commentsQuery = commentsQuery.eq('user_id', userId)
      }

      const [posts, comments] = await Promise.all([
        postsQuery,
        commentsQuery
      ])

      const activities = []

      posts.data?.forEach(post => {
        activities.push({
          type: 'post',
          action: 'ایجاد پست',
          content: post.content,
          timestamp: post.created_at,
          user: post.profiles
        })
      })

      comments.data?.forEach(comment => {
        activities.push({
          type: 'comment',
          action: 'ایجاد نظر',
          content: comment.content,
          timestamp: comment.created_at,
          user: comment.profiles
        })
      })

      return activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit)
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Delete user
  async deleteUser(userId) {
    try {
      // Note: In Supabase, you typically can't delete auth users directly
      // This would usually be done through the Supabase management API
      // For now, we'll just revoke their approval
      await this.revokeUserApproval(userId)
      
      // Also remove their roles
      const { error } = await supabase
        .from(DB_TABLES.USER_ROLES)
        .delete()
        .eq('user_id', userId)

      if (error) throw error

      this.clearCache()
      return true
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Update user profile (admin action)
  async updateUserProfile(userId, updates) {
    try {
      const { error } = await supabase
        .from(DB_TABLES.PROFILES)
        .update(updates)
        .eq('id', userId)

      if (error) throw error

      this.clearCache()
      return true
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Get database storage usage
  async getDatabaseStorageStats() {
    try {
      // Get table sizes (this would require a custom function in Supabase)
      const tables = [
        DB_TABLES.PROFILES,
        DB_TABLES.SOCIAL_POSTS,
        DB_TABLES.POST_COMMENTS,
        DB_TABLES.VIBRATION_DATA
      ]

      const stats = {}
      
      for (const table of tables) {
        const { count } = await supabase
          .from(table)
          .select('id', { count: 'exact' })
        
        stats[table] = {
          recordCount: count || 0
        }
      }

      return stats
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Bulk operations
  async bulkApproveUsers(userIds, adminUserId) {
    try {
      const approvals = userIds.map(userId => ({
        user_id: userId,
        approved_by: adminUserId,
        approved_at: new Date().toISOString()
      }))

      const { error } = await supabase
        .from(DB_TABLES.APPROVED_USERS)
        .insert(approvals)

      if (error) throw error

      this.clearCache()
      return true
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  async bulkRevokeApprovals(userIds) {
    try {
      const { error } = await supabase
        .from(DB_TABLES.APPROVED_USERS)
        .delete()
        .in('user_id', userIds)

      if (error) throw error

      this.clearCache()
      return true
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Content moderation
  async deletePost(postId) {
    try {
      const { error } = await supabase
        .from(DB_TABLES.SOCIAL_POSTS)
        .delete()
        .eq('id', postId)

      if (error) throw error
      return true
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  async deleteComment(commentId) {
    try {
      const { error } = await supabase
        .from(DB_TABLES.POST_COMMENTS)
        .delete()
        .eq('id', commentId)

      if (error) throw error
      return true
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Cache management
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  getFromCache(key) {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() - cached.timestamp > this.cacheExpiry) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  clearCache() {
    this.cache.clear()
  }
}

export default new AdminService()