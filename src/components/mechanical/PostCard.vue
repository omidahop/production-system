<template>
  <div class="post-card">
    <!-- Post Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-3 space-x-reverse">
        <div class="user-avatar" :style="{ backgroundColor: getUserColor(post.profiles?.username) }">
          {{ getUserInitial(post.profiles?.full_name || post.profiles?.username) }}
        </div>
        
        <div>
          <h4 class="font-semibold text-gray-900">
            {{ post.profiles?.full_name || post.profiles?.username || 'کاربر ناشناس' }}
          </h4>
          <div class="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
            <span>{{ getRelativeTime(post.created_at) }}</span>
            <span v-if="post.updated_at !== post.created_at">• ویرایش شده</span>
          </div>
        </div>
      </div>
      
      <!-- Post Actions -->
      <div v-if="canEdit || canDelete" class="relative">
        <button
          @click="showDropdown = !showDropdown"
          class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <i class="fas fa-ellipsis-h text-gray-400"></i>
        </button>
        
        <div v-if="showDropdown" class="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
          <button
            v-if="canEdit"
            @click="handleEdit"
            class="w-full flex items-center px-4 py-3 text-right hover:bg-gray-50 text-gray-700"
          >
            <i class="fas fa-edit ml-3"></i>
            ویرایش پست
          </button>
          
          <button
            v-if="canDelete"
            @click="handleDelete"
            class="w-full flex items-center px-4 py-3 text-right hover:bg-gray-50 text-red-600"
          >
            <i class="fas fa-trash ml-3"></i>
            حذف پست
          </button>
        </div>
      </div>
    </div>

    <!-- Post Content -->
    <div class="post-content mb-4">
      <p class="text-gray-800 leading-relaxed whitespace-pre-wrap">{{ post.content }}</p>
      
      <!-- Media Content -->
      <div v-if="post.media_urls && post.media_urls.length > 0" class="mt-4">
        <div class="media-grid" :class="`media-count-${Math.min(post.media_urls.length, 4)}`">
          <div
            v-for="(mediaUrl, index) in post.media_urls.slice(0, 4)"
            :key="index"
            class="media-item"
            @click="openMediaViewer(post.media_urls, index)"
          >
            <img
              :src="mediaUrl"
              :alt="`Media ${index + 1}`"
              class="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              @error="handleImageError"
            >
            
            <!-- More overlay for 4+ images -->
            <div
              v-if="index === 3 && post.media_urls.length > 4"
              class="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center cursor-pointer"
            >
              <span class="text-white text-2xl font-bold">+{{ post.media_urls.length - 4 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Post Stats -->
    <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
      <div class="flex items-center space-x-4 space-x-reverse">
        <span v-if="post.likes_count > 0">
          <i class="fas fa-heart text-red-500 ml-1"></i>
          {{ post.likes_count }} پسند
        </span>
        <span v-if="post.comments_count > 0">
          <i class="fas fa-comment text-blue-500 ml-1"></i>
          {{ post.comments_count }} نظر
        </span>
      </div>
      
      <div>
        <span class="text-xs">{{ formatDateTime(post.created_at) }}</span>
      </div>
    </div>

    <!-- Post Actions -->
    <div class="flex items-center justify-between border-t border-gray-200 pt-4">
      <button
        @click="toggleLike"
        :disabled="isLiking"
        class="flex-1 flex items-center justify-center py-2 hover:bg-gray-50 rounded-lg transition-colors"
        :class="{ 'text-red-500': post.is_liked }"
      >
        <LoadingSpinner v-if="isLiking" size="sm" class="ml-2" />
        <i v-else :class="post.is_liked ? 'fas fa-heart' : 'far fa-heart'" class="ml-2"></i>
        {{ post.is_liked ? 'پسندیده' : 'پسند' }}
      </button>
      
      <button
        @click="toggleComments"
        class="flex-1 flex items-center justify-center py-2 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <i class="far fa-comment ml-2"></i>
        نظر
      </button>
      
      <button
        @click="sharePost"
        class="flex-1 flex items-center justify-center py-2 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <i class="fas fa-share ml-2"></i>
        اشتراک
      </button>
    </div>

    <!-- Comments Section -->
    <div v-if="showComments" class="mt-6 border-t border-gray-200 pt-6">
      <!-- Add Comment -->
      <div class="flex items-start space-x-3 space-x-reverse mb-4">
        <div class="user-avatar bg-primary-600 text-white text-sm">
          {{ userInitial }}
        </div>
        
        <div class="flex-1">
          <textarea
            v-model="newComment"
            class="form-control text-sm"
            rows="2"
            placeholder="نظر خود را بنویسید..."
            maxlength="500"
          ></textarea>
          
          <div class="flex items-center justify-between mt-2">
            <span class="text-xs text-gray-500">{{ newComment.length }}/500</span>
            <button
              @click="addComment"
              :disabled="!newComment.trim() || isCommenting"
              class="btn btn-primary btn-sm"
            >
              <LoadingSpinner v-if="isCommenting" size="sm" color="white" class="ml-2" />
              ارسال
            </button>
          </div>
        </div>
      </div>

      <!-- Comments List -->
      <CommentsList
        :post-id="post.id"
        @reply="handleReply"
      />
    </div>

    <!-- Media Viewer Modal -->
    <div v-if="showMediaViewer" class="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div class="relative max-w-4xl max-h-full p-4">
        <button
          @click="closeMediaViewer"
          class="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100"
        >
          <i class="fas fa-times"></i>
        </button>
        
        <img
          :src="currentMediaUrl"
          class="max-w-full max-h-full object-contain rounded-lg"
          @error="handleImageError"
        >
        
        <!-- Navigation -->
        <div v-if="mediaUrls && mediaUrls.length > 1" class="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div class="flex items-center space-x-2 bg-black bg-opacity-50 rounded-full px-4 py-2">
            <button
              @click="previousMedia"
              :disabled="currentMediaIndex === 0"
              class="w-8 h-8 rounded-full bg-white bg-opacity-20 text-white hover:bg-opacity-40 disabled:opacity-50"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
            
            <span class="text-white text-sm">{{ currentMediaIndex + 1 }} / {{ mediaUrls.length }}</span>
            
            <button
              @click="nextMedia"
              :disabled="currentMediaIndex === mediaUrls.length - 1"
              class="w-8 h-8 rounded-full bg-white bg-opacity-20 text-white hover:bg-opacity-40 disabled:opacity-50"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSocialMediaStore } from '@/stores/socialMedia'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import CommentsList from './CommentsList.vue'
import { getRelativeTime, formatDateTime, generateRandomColor } from '@/utils/helpers'
import { validateCommentContent } from '@/utils/validation'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['like', 'comment', 'edit', 'delete'])

const authStore = useAuthStore()
const socialMediaStore = useSocialMediaStore()

// State
const showDropdown = ref(false)
const showComments = ref(false)
const showMediaViewer = ref(false)
const newComment = ref('')
const isLiking = ref(false)
const isCommenting = ref(false)
const mediaUrls = ref(null)
const currentMediaIndex = ref(0)

// Computed
const userInitial = computed(() => {
  const name = authStore.profile?.full_name || authStore.user?.email
  return name ? name.charAt(0).toUpperCase() : 'U'
})

const canEdit = computed(() => {
  return props.post.user_id === authStore.user?.id
})

const canDelete = computed(() => {
  return props.post.user_id === authStore.user?.id || authStore.isAdmin
})

const currentMediaUrl = computed(() => {
  return mediaUrls.value?.[currentMediaIndex.value]
})

// Methods
const getUserInitial = (name) => {
  return name ? name.charAt(0).toUpperCase() : 'U'
}

const getUserColor = (username) => {
  if (!username) return '#6B7280'
  
  // Generate consistent color based on username
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const colors = ['#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6B73FF', '#8B5CF6', '#A855F7', '#C026D3', '#E11D48']
  return colors[Math.abs(hash) % colors.length]
}

const toggleLike = async () => {
  if (isLiking.value) return
  
  isLiking.value = true
  
  try {
    emit('like', props.post.id)
  } catch (error) {
    window.$toast(error.message, 'error')
  } finally {
    isLiking.value = false
  }
}

const toggleComments = () => {
  showComments.value = !showComments.value
  
  if (showComments.value) {
    // Load comments when showing for the first time
    socialMediaStore.loadComments(props.post.id)
  }
}

const addComment = async () => {
  const validation = validateCommentContent(newComment.value)
  if (!validation.isValid) {
    window.$toast(validation.message, 'error')
    return
  }

  isCommenting.value = true
  
  try {
    emit('comment', props.post.id, newComment.value.trim())
    newComment.value = ''
  } catch (error) {
    window.$toast(error.message, 'error')
  } finally {
    isCommenting.value = false
  }
}

const handleReply = (commentId, content) => {
  emit('comment', props.post.id, content, commentId)
}

const sharePost = () => {
  const shareText = `${props.post.profiles?.full_name || 'کاربر'}: ${props.post.content.substring(0, 100)}...`
  
  if (navigator.share) {
    navigator.share({
      title: 'پست از شبکه مکانیک',
      text: shareText,
      url: window.location.href
    }).catch(console.error)
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(shareText).then(() => {
      window.$toast('متن پست کپی شد', 'success')
    }).catch(() => {
      window.$toast('خطا در کپی کردن', 'error')
    })
  }
}

const handleEdit = () => {
  showDropdown.value = false
  emit('edit', props.post)
}

const handleDelete = () => {
  showDropdown.value = false
  emit('delete', props.post)
}

const openMediaViewer = (urls, startIndex = 0) => {
  mediaUrls.value = urls
  currentMediaIndex.value = startIndex
  showMediaViewer.value = true
  document.body.style.overflow = 'hidden'
}

const closeMediaViewer = () => {
  showMediaViewer.value = false
  mediaUrls.value = null
  currentMediaIndex.value = 0
  document.body.style.overflow = ''
}

const previousMedia = () => {
  if (currentMediaIndex.value > 0) {
    currentMediaIndex.value--
  }
}

const nextMedia = () => {
  if (currentMediaIndex.value < mediaUrls.value.length - 1) {
    currentMediaIndex.value++
  }
}

const handleImageError = (event) => {
  event.target.src = '/placeholder-image.png' // Add a placeholder image
  event.target.alt = 'تصویر در دسترس نیست'
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showDropdown.value = false
  }
}

// Keyboard shortcuts for media viewer
const handleKeydown = (event) => {
  if (showMediaViewer.value) {
    if (event.key === 'Escape') {
      closeMediaViewer()
    } else if (event.key === 'ArrowLeft') {
      nextMedia()
    } else if (event.key === 'ArrowRight') {
      previousMedia()
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.post-card {
  @apply bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200;
}

.user-avatar {
  @apply w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold;
}

.post-content {
  @apply text-gray-800 leading-relaxed;
}

.media-grid {
  @apply grid gap-2 rounded-lg overflow-hidden;
}

.media-grid.media-count-1 {
  grid-template-columns: 1fr;
  max-height: 400px;
}

.media-grid.media-count-2 {
  grid-template-columns: 1fr 1fr;
  height: 200px;
}

.media-grid.media-count-3 {
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr 1fr;
  height: 200px;
}

.media-grid.media-count-3 .media-item:first-child {
  grid-row: 1 / 3;
}

.media-grid.media-count-4 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  height: 200px;
}

.media-item {
  @apply relative overflow-hidden rounded-lg;
}

.media-item img {
  @apply w-full h-full object-cover;
}

/* Dark overlay for dropdown */
.relative:focus-within .absolute {
  @apply block;
}

/* Smooth transitions */
.post-card {
  transition: all 0.2s ease;
}

.post-card:hover {
  transform: translateY(-1px);
}

/* Media viewer */
.fixed.inset-0 {
  backdrop-filter: blur(4px);
}

/* Custom scrollbar for comments */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>