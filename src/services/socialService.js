import { supabase, DB_TABLES, handleSupabaseError } from './supabaseClient'
import { generateId } from '@/utils/helpers'

class SocialService {
  constructor() {
    this.cache = new Map()
    this.cacheExpiry = 2 * 60 * 1000 // 2 minutes for social media
  }

  // Create a new post
  async createPost(postData) {
    try {
      const { data, error } = await supabase
        .from(DB_TABLES.SOCIAL_POSTS)
        .insert({
          ...postData,
          created_at: new Date().toISOString()
        })
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      this.clearCache()
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Get posts with pagination
  async getPosts(page = 1, limit = 20, userId = null) {
    try {
      const cacheKey = `posts_${page}_${limit}_${userId || 'all'}`
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached

      let query = supabase
        .from(DB_TABLES.SOCIAL_POSTS)
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url
          ),
          post_likes (
            id,
            user_id
          ),
          post_comments (
            id
          )
        `)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) throw error

      // Process likes count and user's like status
      const processedData = data.map(post => ({
        ...post,
        likes_count: post.post_likes.length,
        comments_count: post.post_comments.length,
        is_liked: false, // Will be updated in component
        post_likes: undefined,
        post_comments: undefined
      }))

      this.setCache(cacheKey, processedData)
      return processedData
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Get single post
  async getPost(postId) {
    try {
      const { data, error } = await supabase
        .from(DB_TABLES.SOCIAL_POSTS)
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('id', postId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Update post
  async updatePost(postId, updates) {
    try {
      const { data, error } = await supabase
        .from(DB_TABLES.SOCIAL_POSTS)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      this.clearCache()
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Delete post
  async deletePost(postId) {
    try {
      const { error } = await supabase
        .from(DB_TABLES.SOCIAL_POSTS)
        .delete()
        .eq('id', postId)

      if (error) throw error

      this.clearCache()
      return true
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Like/Unlike post
  async toggleLike(postId, userId) {
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from(DB_TABLES.POST_LIKES)
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single()

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from(DB_TABLES.POST_LIKES)
          .delete()
          .eq('id', existingLike.id)

        if (error) throw error
        return { liked: false }
      } else {
        // Like
        const { error } = await supabase
          .from(DB_TABLES.POST_LIKES)
          .insert({
            post_id: postId,
            user_id: userId,
            created_at: new Date().toISOString()
          })

        if (error) throw error
        return { liked: true }
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Get post likes
  async getPostLikes(postId) {
    try {
      const { data, error } = await supabase
        .from(DB_TABLES.POST_LIKES)
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Create comment
  async createComment(postId, content, parentCommentId = null) {
    try {
      const { data, error } = await supabase
        .from(DB_TABLES.POST_COMMENTS)
        .insert({
          post_id: postId,
          content,
          parent_comment_id: parentCommentId,
          created_at: new Date().toISOString()
        })
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Get comments for a post
  async getComments(postId) {
    try {
      const { data, error } = await supabase
        .from(DB_TABLES.POST_COMMENTS)
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Organize comments in tree structure
      const comments = data || []
      const commentMap = {}
      const rootComments = []

      // First pass: create comment objects
      comments.forEach(comment => {
        commentMap[comment.id] = {
          ...comment,
          replies: []
        }
      })

      // Second pass: organize hierarchy
      comments.forEach(comment => {
        if (comment.parent_comment_id) {
          const parent = commentMap[comment.parent_comment_id]
          if (parent) {
            parent.replies.push(commentMap[comment.id])
          }
        } else {
          rootComments.push(commentMap[comment.id])
        }
      })

      return rootComments
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Update comment
  async updateComment(commentId, content) {
    try {
      const { data, error } = await supabase
        .from(DB_TABLES.POST_COMMENTS)
        .update({
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Delete comment
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

  // Upload media file
  async uploadMedia(file, folder = 'social-media') {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${generateId()}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file)

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Get user activity
  async getUserActivity(userId, limit = 10) {
    try {
      const [posts, comments, likes] = await Promise.all([
        supabase
          .from(DB_TABLES.SOCIAL_POSTS)
          .select('id, content, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit),
        
        supabase
          .from(DB_TABLES.POST_COMMENTS)
          .select(`
            id, content, created_at,
            social_posts (
              id, content
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit),
        
        supabase
          .from(DB_TABLES.POST_LIKES)
          .select(`
            id, created_at,
            social_posts (
              id, content
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)
      ])

      const activities = []
      
      posts.data?.forEach(post => {
        activities.push({
          type: 'post',
          ...post,
          timestamp: post.created_at
        })
      })

      comments.data?.forEach(comment => {
        activities.push({
          type: 'comment',
          ...comment,
          timestamp: comment.created_at
        })
      })

      likes.data?.forEach(like => {
        activities.push({
          type: 'like',
          ...like,
          timestamp: like.created_at
        })
      })

      return activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit)
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Search posts
  async searchPosts(query, limit = 20) {
    try {
      const { data, error } = await supabase
        .from(DB_TABLES.SOCIAL_POSTS)
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .textSearch('content', query)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
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

  // Real-time subscriptions
  subscribeToPosts(callback) {
    return supabase
      .channel('social_posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: DB_TABLES.SOCIAL_POSTS
        },
        (payload) => {
          this.clearCache()
          callback(payload)
        }
      )
      .subscribe()
  }

  subscribeToComments(postId, callback) {
    return supabase
      .channel(`post_comments_${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: DB_TABLES.POST_COMMENTS,
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          callback(payload)
        }
      )
      .subscribe()
  }

  subscribeToLikes(postId, callback) {
    return supabase
      .channel(`post_likes_${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: DB_TABLES.POST_LIKES,
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          callback(payload)
        }
      )
      .subscribe()
  }
}

export default new SocialService()