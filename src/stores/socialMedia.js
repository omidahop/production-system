import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import socialService from '@/services/socialService'
import { useAuthStore } from './auth'

export const useSocialMediaStore = defineStore('socialMedia', () => {
  // State
  const posts = ref([])
  const currentPost = ref(null)
  const comments = ref({})
  const isLoading = ref(false)
  const isPostLoading = ref(false)
  const error = ref(null)
  const currentPage = ref(1)
  const hasMore = ref(true)
  const searchQuery = ref('')
  const searchResults = ref([])

  // Get auth store
  const authStore = useAuthStore()

  // Computed
  const postsWithUserInteractions = computed(() => {
    return posts.value.map(post => ({
      ...post,
      is_liked: post.user_likes?.some(like => like.user_id === authStore.user?.id) || false,
      can_edit: post.user_id === authStore.user?.id || authStore.isAdmin,
      can_delete: post.user_id === authStore.user?.id || authStore.isAdmin
    }))
  })

  const filteredPosts = computed(() => {
    if (!searchQuery.value) return postsWithUserInteractions.value
    
    const query = searchQuery.value.toLowerCase()
    return postsWithUserInteractions.value.filter(post =>
      post.content.toLowerCase().includes(query) ||
      post.profiles?.full_name?.toLowerCase().includes(query) ||
      post.profiles?.username?.toLowerCase().includes(query)
    )
  })

  // Actions
  const createPost = async (postData) => {
    isPostLoading.value = true
    error.value = null
    
    try {
      const newPost = await socialService.createPost({
        ...postData,
        user_id: authStore.user.id
      })
      
      // Add to beginning of posts array
      posts.value.unshift(newPost)
      
      return newPost
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isPostLoading.value = false
    }
  }

  const loadPosts = async (page = 1, limit = 20, refresh = false) => {
    if (refresh) {
      posts.value = []
      currentPage.value = 1
      hasMore.value = true
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const newPosts = await socialService.getPosts(page, limit)
      
      if (refresh) {
        posts.value = newPosts
      } else {
        posts.value.push(...newPosts)
      }
      
      currentPage.value = page
      hasMore.value = newPosts.length === limit
      
      return newPosts
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const loadMorePosts = async () => {
    if (!hasMore.value || isLoading.value) return
    
    await loadPosts(currentPage.value + 1, 20, false)
  }

  const getPost = async (postId) => {
    try {
      const post = await socialService.getPost(postId)
      currentPost.value = post
      return post
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const updatePost = async (postId, updates) => {
    isPostLoading.value = true
    
    try {
      const updatedPost = await socialService.updatePost(postId, updates)
      
      // Update in posts array
      const index = posts.value.findIndex(p => p.id === postId)
      if (index !== -1) {
        posts.value[index] = updatedPost
      }
      
      // Update current post if it's the same
      if (currentPost.value?.id === postId) {
        currentPost.value = updatedPost
      }
      
      return updatedPost
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isPostLoading.value = false
    }
  }

  const deletePost = async (postId) => {
    try {
      await socialService.deletePost(postId)
      
      // Remove from posts array
      posts.value = posts.value.filter(p => p.id !== postId)
      
      // Clear current post if it's the deleted one
      if (currentPost.value?.id === postId) {
        currentPost.value = null
      }
      
      return true
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const toggleLike = async (postId) => {
    try {
      const result = await socialService.toggleLike(postId, authStore.user.id)
      
      // Update post in array
      const postIndex = posts.value.findIndex(p => p.id === postId)
      if (postIndex !== -1) {
        const post = posts.value[postIndex]
        if (result.liked) {
          post.likes_count = (post.likes_count || 0) + 1
          if (!post.user_likes) post.user_likes = []
          post.user_likes.push({ user_id: authStore.user.id })
        } else {
          post.likes_count = Math.max((post.likes_count || 0) - 1, 0)
          if (post.user_likes) {
            post.user_likes = post.user_likes.filter(like => like.user_id !== authStore.user.id)
          }
        }
      }
      
      return result
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const loadComments = async (postId) => {
    try {
      const postComments = await socialService.getComments(postId)
      comments.value[postId] = postComments
      return postComments
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const createComment = async (postId, content, parentCommentId = null) => {
    try {
      const newComment = await socialService.createComment(postId, content, parentCommentId)
      
      // Add to comments
      if (!comments.value[postId]) {
        comments.value[postId] = []
      }
      
      if (parentCommentId) {
        // Find parent comment and add reply
        const findAndAddReply = (commentsList) => {
          for (const comment of commentsList) {
            if (comment.id === parentCommentId) {
              if (!comment.replies) comment.replies = []
              comment.replies.push(newComment)
              return true
            }
            if (comment.replies && findAndAddReply(comment.replies)) {
              return true
            }
          }
          return false
        }
        findAndAddReply(comments.value[postId])
      } else {
        comments.value[postId].push(newComment)
      }
      
      // Update post comments count
      const postIndex = posts.value.findIndex(p => p.id === postId)
      if (postIndex !== -1) {
        posts.value[postIndex].comments_count = (posts.value[postIndex].comments_count || 0) + 1
      }
      
      return newComment
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const updateComment = async (commentId, content) => {
    try {
      const updatedComment = await socialService.updateComment(commentId, content)
      
      // Update in comments object
      Object.keys(comments.value).forEach(postId => {
        const updateInComments = (commentsList) => {
          for (let i = 0; i < commentsList.length; i++) {
            if (commentsList[i].id === commentId) {
              commentsList[i] = updatedComment
              return true
            }
            if (commentsList[i].replies && updateInComments(commentsList[i].replies)) {
              return true
            }
          }
          return false
        }
        updateInComments(comments.value[postId])
      })
      
      return updatedComment
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const deleteComment = async (commentId, postId) => {
    try {
      await socialService.deleteComment(commentId)
      
      // Remove from comments
      if (comments.value[postId]) {
        const removeFromComments = (commentsList) => {
          for (let i = 0; i < commentsList.length; i++) {
            if (commentsList[i].id === commentId) {
              commentsList.splice(i, 1)
              return true
            }
            if (commentsList[i].replies && removeFromComments(commentsList[i].replies)) {
              return true
            }
          }
          return false
        }
        removeFromComments(comments.value[postId])
      }
      
      // Update post comments count
      const postIndex = posts.value.findIndex(p => p.id === postId)
      if (postIndex !== -1) {
        posts.value[postIndex].comments_count = Math.max((posts.value[postIndex].comments_count || 0) - 1, 0)
      }
      
      return true
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const uploadMedia = async (file) => {
    try {
      const mediaUrl = await socialService.uploadMedia(file)
      return mediaUrl
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const searchPosts = async (query) => {
    if (!query.trim()) {
      searchResults.value = []
      searchQuery.value = ''
      return []
    }
    
    isLoading.value = true
    searchQuery.value = query
    
    try {
      const results = await socialService.searchPosts(query)
      searchResults.value = results
      return results
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearSearch = () => {
    searchQuery.value = ''
    searchResults.value = []
  }

  const getUserActivity = async (userId) => {
    try {
      return await socialService.getUserActivity(userId)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Subscriptions
  const subscribeToPostsUpdates = (callback) => {
    return socialService.subscribeToPosts((payload) => {
      if (payload.eventType === 'INSERT') {
        // Add new post if it's not from current user (to avoid duplication)
        if (payload.new.user_id !== authStore.user?.id) {
          posts.value.unshift(payload.new)
        }
      } else if (payload.eventType === 'UPDATE') {
        // Update existing post
        const index = posts.value.findIndex(p => p.id === payload.new.id)
        if (index !== -1) {
          posts.value[index] = { ...posts.value[index], ...payload.new }
        }
      } else if (payload.eventType === 'DELETE') {
        // Remove deleted post
        posts.value = posts.value.filter(p => p.id !== payload.old.id)
      }
      
      if (callback) callback(payload)
    })
  }

  const subscribeToCommentsUpdates = (postId, callback) => {
    return socialService.subscribeToComments(postId, (payload) => {
      if (payload.eventType === 'INSERT') {
        // Add new comment
        if (!comments.value[postId]) {
          comments.value[postId] = []
        }
        comments.value[postId].push(payload.new)
        
        // Update post comments count
        const postIndex = posts.value.findIndex(p => p.id === postId)
        if (postIndex !== -1) {
          posts.value[postIndex].comments_count = (posts.value[postIndex].comments_count || 0) + 1
        }
      } else if (payload.eventType === 'DELETE') {
        // Remove deleted comment
        if (comments.value[postId]) {
          comments.value[postId] = comments.value[postId].filter(c => c.id !== payload.old.id)
          
          // Update post comments count
          const postIndex = posts.value.findIndex(p => p.id === postId)
          if (postIndex !== -1) {
            posts.value[postIndex].comments_count = Math.max((posts.value[postIndex].comments_count || 0) - 1, 0)
          }
        }
      }
      
      if (callback) callback(payload)
    })
  }

  const subscribeToLikesUpdates = (postId, callback) => {
    return socialService.subscribeToLikes(postId, (payload) => {
      const postIndex = posts.value.findIndex(p => p.id === postId)
      if (postIndex !== -1) {
        if (payload.eventType === 'INSERT') {
          posts.value[postIndex].likes_count = (posts.value[postIndex].likes_count || 0) + 1
        } else if (payload.eventType === 'DELETE') {
          posts.value[postIndex].likes_count = Math.max((posts.value[postIndex].likes_count || 0) - 1, 0)
        }
      }
      
      if (callback) callback(payload)
    })
  }

  // Clear store
  const clearStore = () => {
    posts.value = []
    currentPost.value = null
    comments.value = {}
    error.value = null
    currentPage.value = 1
    hasMore.value = true
    searchQuery.value = ''
    searchResults.value = []
  }

  return {
    // State
    posts,
    currentPost,
    comments,
    isLoading,
    isPostLoading,
    error,
    currentPage,
    hasMore,
    searchQuery,
    searchResults,
    
    // Computed
    postsWithUserInteractions,
    filteredPosts,
    
    // Actions
    createPost,
    loadPosts,
    loadMorePosts,
    getPost,
    updatePost,
    deletePost,
    toggleLike,
    loadComments,
    createComment,
    updateComment,
    deleteComment,
    uploadMedia,
    searchPosts,
    clearSearch,
    getUserActivity,
    
    // Subscriptions
    subscribeToPostsUpdates,
    subscribeToCommentsUpdates,
    subscribeToLikesUpdates,
    
    // Utilities
    clearStore
  }
})