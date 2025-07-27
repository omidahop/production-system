<template>
  <div class="space-y-6">
    <!-- Create Post -->
    <div class="card">
      <div class="card-body">
        <div class="flex items-start space-x-4 space-x-reverse">
          <div class="user-avatar bg-primary-600 text-white">
            {{ userInitial }}
          </div>
          
          <div class="flex-1">
            <textarea
              v-model="newPostContent"
              class="form-control mb-4"
              rows="3"
              placeholder="چه چیز جدیدی در ذهن دارید؟"
              maxlength="1000"
            ></textarea>
            
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4 space-x-reverse">
                <button
                  @click="showMediaUpload = !showMediaUpload"
                  class="text-blue-500 hover:text-blue-700 transition-colors"
                >
                  <i class="fas fa-image text-lg"></i>
                </button>
                
                <button
                  @click="showEmojiPicker = !showEmojiPicker"
                  class="text-yellow-500 hover:text-yellow-700 transition-colors"
                >
                  <i class="fas fa-smile text-lg"></i>
                </button>
                
                <span class="text-sm text-gray-500">
                  {{ newPostContent.length }}/1000
                </span>
              </div>
              
              <button
                @click="createPost"
                :disabled="!newPostContent.trim() || isPosting"
                class="btn btn-primary"
              >
                <LoadingSpinner v-if="isPosting" size="sm" color="white" class="ml-2" />
                <i v-else class="fas fa-paper-plane ml-2"></i>
                انتشار
              </button>
            </div>
            
            <!-- Media Upload -->
            <div v-if="showMediaUpload" class="mt-4 p-4 border border-gray-200 rounded-lg">
              <input
                ref="mediaInput"
                type="file"
                accept="image/*,video/*"
                multiple
                @change="handleMediaUpload"
                class="form-control mb-3"
              >
              
              <!-- Media Preview -->
              <div v-if="uploadedMedia.length > 0" class="grid grid-cols-3 gap-3">
                <div
                  v-for="(media, index) in uploadedMedia"
                  :key="index"
                  class="relative group"
                >
                  <img
                    v-if="media.type.startsWith('image')"
                    :src="media.url"
                    class="w-full h-20 object-cover rounded-lg"
                  >
                  <video
                    v-else-if="media.type.startsWith('video')"
                    :src="media.url"
                    class="w-full h-20 object-cover rounded-lg"
                    controls
                  ></video>
                  
                  <button
                    @click="removeMedia(index)"
                    class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Emoji Picker -->
            <div v-if="showEmojiPicker" class="mt-4 p-4 border border-gray-200 rounded-lg">
              <div class="grid grid-cols-10 gap-2">
                <button
                  v-for="emoji in commonEmojis"
                  :key="emoji"
                  @click="addEmoji(emoji)"
                  class="text-2xl p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {{ emoji }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Posts List -->
    <div v-if="isLoading" class="text-center py-8">
      <LoadingSpinner size="lg" />
      <p class="mt-4 text-gray-600">در حال بارگذاری پست‌ها...</p>
    </div>

    <div v-else-if="filteredPosts.length === 0" class="text-center py-12">
      <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <i class="fas fa-comments text-4xl text-gray-400"></i>
      </div>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">هنوز پستی وجود ندارد</h3>
      <p class="text-gray-600">اولین نفری باشید که پست می‌کند!</p>
    </div>

    <div v-else class="space-y-6">
      <PostCard
        v-for="post in filteredPosts"
        :key="post.id"
        :post="post"
        @like="handleLike"
        @comment="handleComment"
        @edit="handleEdit"
        @delete="handleDelete"
      />
      
      <!-- Load More -->
      <div v-if="hasMorePosts" class="text-center">
        <button
          @click="loadMorePosts"
          :disabled="isLoadingMore"
          class="btn btn-outline"
        >
          <LoadingSpinner v-if="isLoadingMore" size="sm" class="ml-2" />
          <i v-else class="fas fa-chevron-down ml-2"></i>
          نمایش بیشتر
        </button>
      </div>
    </div>

    <!-- Edit Post Modal -->
    <div v-if="showEditModal" class="modal-backdrop" @click.self="showEditModal = false">
      <PostModal
        :post="editingPost"
        @close="showEditModal = false"
        @updated="handlePostUpdated"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSocialMediaStore } from '@/stores/socialMedia'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import PostCard from './PostCard.vue'
import PostModal from './PostModal.vue'
import { validatePostContent } from '@/utils/validation'

const authStore = useAuthStore()
const socialMediaStore = useSocialMediaStore()

// State
const newPostContent = ref('')
const uploadedMedia = ref([])
const showMediaUpload = ref(false)
const showEmojiPicker = ref(false)
const showEditModal = ref(false)
const editingPost = ref(null)
const isPosting = ref(false)
const isLoadingMore = ref(false)
const mediaInput = ref(null)

// Real-time subscription
const subscription = ref(null)

const commonEmojis = [
  '😀', '😃', '😄', '😁', '😊', '😍', '🤩', '😘', '😗', '😋',
  '🤔', '😎', '🤓', '😇', '👍', '👎', '👏', '🙌', '💪', '🔥',
  '❤️', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍', '💯', '✨'
]

// Computed
const userInitial = computed(() => {
  const name = authStore.profile?.full_name || authStore.user?.email
  return name ? name.charAt(0).toUpperCase() : 'U'
})

const isLoading = computed(() => socialMediaStore.isLoading)
const filteredPosts = computed(() => socialMediaStore.filteredPosts)
const hasMorePosts = computed(() => socialMediaStore.hasMore)

// Methods
const createPost = async () => {
  const validation = validatePostContent(newPostContent.value)
  if (!validation.isValid) {
    window.$toast(validation.message, 'error')
    return
  }

  isPosting.value = true

  try {
    const postData = {
      content: newPostContent.value.trim(),
      media_urls: uploadedMedia.value.map(m => m.url),
      post_type: uploadedMedia.value.length > 0 ? 'image' : 'text'
    }

    await socialMediaStore.createPost(postData)

    // Reset form
    newPostContent.value = ''
    uploadedMedia.value = []
    showMediaUpload.value = false
    showEmojiPicker.value = false

    window.$toast('پست با موفقیت منتشر شد', 'success')

  } catch (error) {
    window.$toast(error.message, 'error')
  } finally {
    isPosting.value = false
  }
}

const handleMediaUpload = async (event) => {
  const files = Array.from(event.target.files)
  
  for (const file of files) {
    if (uploadedMedia.value.length >= 5) {
      window.$toast('حداکثر ۵ فایل مجاز است', 'warning')
      break
    }

    // Validate file
    const validation = validateFile(file, {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4']
    })

    if (!validation.isValid) {
      window.$toast(validation.message, 'error')
      continue
    }

    try {
      const mediaUrl = await socialMediaStore.uploadMedia(file)
      uploadedMedia.value.push({
        url: mediaUrl,
        type: file.type,
        name: file.name
      })
    } catch (error) {
      window.$toast(`خطا در آپلود ${file.name}`, 'error')
    }
  }

  // Reset input
  if (mediaInput.value) {
    mediaInput.value.value = ''
  }
}

const removeMedia = (index) => {
  uploadedMedia.value.splice(index, 1)
}

const addEmoji = (emoji) => {
  newPostContent.value += emoji
  showEmojiPicker.value = false
}

const handleLike = async (postId) => {
  try {
    await socialMediaStore.toggleLike(postId)
  } catch (error) {
    window.$toast(error.message, 'error')
  }
}

const handleComment = async (postId, content, parentCommentId = null) => {
  try {
    await socialMediaStore.createComment(postId, content, parentCommentId)
    window.$toast('نظر اضافه شد', 'success')
  } catch (error) {
    window.$toast(error.message, 'error')
  }
}

const handleEdit = (post) => {
  editingPost.value = post
  showEditModal.value = true
}

const handleDelete = (post) => {
  if (window.$confirm) {
    window.$confirm(
      'حذف پست',
      'آیا مطمئن هستید که می‌خواهید این پست را حذف کنید؟',
      async () => {
        try {
          await socialMediaStore.deletePost(post.id)
          window.$toast('پست حذف شد', 'success')
        } catch (error) {
          window.$toast(error.message, 'error')
        }
      }
    )
  }
}

const handlePostUpdated = () => {
  showEditModal.value = false
  editingPost.value = null
  window.$toast('پست به‌روزرسانی شد', 'success')
}

const loadMorePosts = async () => {
  if (isLoadingMore.value || !hasMorePosts.value) return

  isLoadingMore.value = true
  
  try {
    await socialMediaStore.loadMorePosts()
  } catch (error) {
    window.$toast('خطا در بارگذاری پست‌ها', 'error')
  } finally {
    isLoadingMore.value = false
  }
}

// Setup real-time updates
const setupRealTimeUpdates = () => {
  subscription.value = socialMediaStore.subscribeToPostsUpdates((payload) => {
    // Handle real-time updates
    if (payload.eventType === 'INSERT') {
      // Show notification for new posts from other users
      if (payload.new.user_id !== authStore.user?.id) {
        window.$toast('پست جدید اضافه شد', 'info')
      }
    }
  })
}

// Close dropdowns when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.emoji-picker')) {
    showEmojiPicker.value = false
  }
  if (!event.target.closest('.media-upload')) {
    showMediaUpload.value = false
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await socialMediaStore.loadPosts(1, 20, true)
    setupRealTimeUpdates()
    document.addEventListener('click', handleClickOutside)
  } catch (error) {
    window.$toast('خطا در بارگذاری پست‌ها', 'error')
  }
})

onUnmounted(() => {
  if (subscription.value) {
    subscription.value.unsubscribe()
  }
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.user-avatar {
  @apply w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold;
}

.emoji-picker {
  max-height: 200px;
  overflow-y: auto;
}

.media-upload {
  position: relative;
}

/* Custom scrollbar for emoji picker */
.emoji-picker::-webkit-scrollbar {
  width: 6px;
}

.emoji-picker::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.emoji-picker::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.emoji-picker::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>