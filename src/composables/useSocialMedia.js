import { ref, computed } from 'vue'
import { useSocialMediaStore } from '@/stores/socialMedia'

export function useSocialMedia() {
  const socialMediaStore = useSocialMediaStore()
  const isLoading = ref(false)

  const posts = computed(() => socialMediaStore.posts)
  const comments = computed(() => socialMediaStore.comments)

  const createPost = async (postData) => {
    isLoading.value = true
    try {
      return await socialMediaStore.createPost(postData)
    } finally {
      isLoading.value = false
    }
  }

  const loadPosts = async (page = 1, limit = 20, refresh = false) => {
    isLoading.value = true
    try {
      return await socialMediaStore.loadPosts(page, limit, refresh)
    } finally {
      isLoading.value = false
    }
  }

  const likePost = async (postId) => {
    try {
      return await socialMediaStore.toggleLike(postId)
    } catch (error) {
      throw error
    }
  }

  const addComment = async (postId, content, parentCommentId = null) => {
    try {
      return await socialMediaStore.createComment(postId, content, parentCommentId)
    } catch (error) {
      throw error
    }
  }

  return {
    // State
    posts,
    comments,
    isLoading,
    
    // Actions
    createPost,
    loadPosts,
    likePost,
    addComment
  }
}