import { supabase, DB_TABLES, handleSupabaseError } from './supabaseClient'

class AuthService {
  constructor() {
    this.user = null
    this.session = null
  }

  // Sign up new user
  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) throw error

      // Create profile after successful signup
      if (data.user) {
        await this.createUserProfile(data.user, metadata)
      }

      return { user: data.user, session: data.session }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Sign in user
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Check if user is approved
      const isApproved = await this.checkUserApproval(data.user.id)
      if (!isApproved) {
        await this.signOut()
        throw new Error('حساب کاربری شما هنوز تایید نشده است')
      }

      this.user = data.user
      this.session = data.session

      return { user: data.user, session: data.session }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      this.user = null
      this.session = null

      return true
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error
      return true
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Update password
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      return true
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Create user profile
  async createUserProfile(user, metadata = {}) {
    try {
      const { error } = await supabase
        .from(DB_TABLES.PROFILES)
        .insert({
          id: user.id,
          username: metadata.username || user.email.split('@')[0],
          full_name: metadata.full_name || '',
          avatar_url: metadata.avatar_url || null,
          role: 'user',
          department: metadata.department || ''
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error creating user profile:', error)
      return false
    }
  }

  // Get user profile
  async getUserProfile(userId = null) {
    try {
      const targetUserId = userId || this.user?.id
      if (!targetUserId) return null

      const { data, error } = await supabase
        .from(DB_TABLES.PROFILES)
        .select('*')
        .eq('id', targetUserId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  // Update user profile
  async updateUserProfile(updates) {
    try {
      if (!this.user) throw new Error('کاربر وارد نشده است')

      const { error } = await supabase
        .from(DB_TABLES.PROFILES)
        .update(updates)
        .eq('id', this.user.id)

      if (error) throw error
      return true
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Check if user is approved
  async checkUserApproval(userId) {
    try {
      const { data, error } = await supabase
        .from(DB_TABLES.APPROVED_USERS)
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return !!data
    } catch (error) {
      console.error('Error checking user approval:', error)
      return false
    }
  }

  // Check if user is admin
  async checkAdminRole(userId = null) {
    try {
      const targetUserId = userId || this.user?.id
      if (!targetUserId) return false

      const { data, error } = await supabase
        .from(DB_TABLES.USER_ROLES)
        .select('*')
        .eq('user_id', targetUserId)
        .eq('role', 'admin')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return !!data
    } catch (error) {
      console.error('Error checking admin role:', error)
      return false
    }
  }

  // Get current session
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) throw error
      
      this.session = session
      this.user = session?.user || null

      return session
    } catch (error) {
      console.error('Error getting current session:', error)
      return null
    }
  }

  // Initialize auth state
  async initializeAuth() {
    try {
      const session = await this.getCurrentSession()
      
      if (session?.user) {
        const isApproved = await this.checkUserApproval(session.user.id)
        if (!isApproved) {
          await this.signOut()
          return null
        }
      }

      return session
    } catch (error) {
      console.error('Error initializing auth:', error)
      return null
    }
  }

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      this.session = session
      this.user = session?.user || null

      if (event === 'SIGNED_IN' && session?.user) {
        const isApproved = await this.checkUserApproval(session.user.id)
        if (!isApproved) {
          await this.signOut()
          return
        }
      }

      callback(event, session)
    })
  }
}

export default new AuthService()