import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database table names
export const DB_TABLES = {
  PROFILES: 'profiles',
  APPROVED_USERS: 'approved_users',
  USER_ROLES: 'user_roles',
  SOCIAL_POSTS: 'social_posts',
  POST_LIKES: 'post_likes',
  POST_COMMENTS: 'post_comments',
  VIBRATION_DATA: 'vibration_data',
  EQUIPMENT_MASTER: 'equipment_master',
  USER_PREFERENCES: 'user_preferences'
}

// Helper function for error handling
export const handleSupabaseError = (error) => {
  if (error) {
    console.error('Supabase error:', error)
    
    // Map common Supabase errors to Persian messages
    switch (error.code) {
      case 'PGRST116':
        return 'داده‌ای یافت نشد'
      case '23505':
        return 'این داده قبلاً ثبت شده است'
      case '23503':
        return 'داده مرتبط وجود ندارد'
      case '42501':
        return 'شما مجاز به انجام این عملیات نیستید'
      default:
        return error.message || 'خطای غیرمنتظره‌ای رخ داد'
    }
  }
  return null
}

// Helper function for authentication
export const getCurrentUser = () => {
  return supabase.auth.getUser()
}

// Helper function for session
export const getSession = () => {
  return supabase.auth.getSession()
}

export default supabase