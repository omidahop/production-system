<template>
  <div class="comment-item" :class="{ 'reply-comment': comment.parent_comment_id }">
    <!-- Comment Header -->
    <div class="flex items-start space-x-3 space-x-reverse">
      <div class="user-avatar" :style="{ backgroundColor: getUserColor(comment.profiles?.username) }">
        {{ getUserInitial(comment.profiles?.full_name || comment.profiles?.username) }}
      </div>
      
      <div class="flex-1">
        <!-- Comment Content -->
        <div class="comment-bubble">
          <div class="flex items-center justify-between mb-1">
            <h5 class="font-medium text-sm text-gray-900">
              {{ comment.profiles?.full_name || comment.profiles?.username || 'کاربر ناشناس' }}
            </h5>
            
            <div v-if="canDelete" class="relative">
              <button
                @click="showOptions = !showOptions"
                class="w-6 h-6 rounded-full hover:bg-gray-200 flex items-center justify-center text-xs"
              >
                <i class="fas fa-ellipsis-h text-gray-400"></i>
              </button>
              
              <div v-if="showOptions" class="absolute left-0 mt-1 w-32 bg-white rounded-lg shadow-lg border z-10">
                <button
                  @click="deleteComment"
                  class="w-full flex items-center px-3 py-2 text-right hover:bg-gray-50 text-red-600 text-sm"
                >
                  <i class="fas fa-trash text-xs ml-2"></i>
                  حذف
                </button>
              </div>
            </div>
          </div>
          
          <p class="text-sm text-gray-800 leading-relaxed">{{ comment.content }}</p>
          
          <div class="flex items-center justify-between mt-2">
            <div class="flex items-center space-x-3 space-x-reverse text-xs text-gray-500">
              <span>{{ getRelativeTime(comment.created_at) }}</span>
              <button
                @click="toggleReply"
                class="hover:text-blue-600 transition-colors"
              >
                پاسخ
              </button>
            </div>
          </div>
        </div>

        <!-- Reply Form -->
        <div v-if="showReplyForm" class="mt-3">
          <div class="flex items-start space-x-2 space-x-reverse">
            <div class="user-avatar bg-primary-600 text-white text-xs">
              {{ userInitial }}
            </div>
            
            <div class="flex-1">
              <textarea
                v-model="replyContent"
                class="form-control text-sm"
                rows="2"
                placeholder="پاسخ شما..."
                maxlength="500"
              ></textarea>
              
              <div class="flex items-center justify-between mt-2">
                <span class="text-xs text-gray-500">{{ replyContent.length }}/500</span>
                <div class="space-x-2 space-x-reverse">
                  <button
                    @click="submitReply"
                    :disabled="!replyContent.trim() || isReplying"
                    class="btn btn-primary btn-sm"
                  >
                    <LoadingSpinner v-if="isReplying" size="sm" color="white" class="ml-1" />
                    ارسال
                  </button>
                  <button
                    @click="cancelReply"
                    class="btn btn-outline btn-sm"
                  >
                    انصراف
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Replies -->
        <div v-if="comment.replies && comment.replies.length > 0" class="mt-4 space-y-3">
          <CommentItem
            v-for="reply in comment.replies"
            :key="reply.id"
            :comment="reply"
            :post-id="postId"
          />
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
import { getRelativeTime } from '@/utils/helpers'
import { validateCommentContent } from '@/utils/validation'

const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  postId: {
    type: Number,
    required: true
  }
})

const authStore = useAuthStore()
const socialMediaStore = useSocialMediaStore()

// State
const showReplyForm = ref(false)
const showOptions = ref(false)
const replyContent = ref('')
const isReplying = ref(false)

// Computed
const userInitial = computed(() => {
  const name = authStore.profile?.full_name || authStore.user?.email
  return name ? name.charAt(0).toUpperCase() : 'U'
})

const canDelete = computed(() => {
  return props.comment.user_id === authStore.user?.id || authStore.isAdmin
})

// Methods
const getUserInitial = (name) => {
  return name ? name.charAt(0).toUpperCase() : 'U'
}

const getUserColor = (username) => {
  if (!username) return '#6B7280'
  
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const colors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', 
    '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
    '#3B82F6', '#6B73FF', '#8B5CF6', '#A855F7', '#C026D3', '#E11D48'
  ]
  return colors[Math.abs(hash) % colors.length]
}

const toggleReply = () => {
  showReplyForm.value = !showReplyForm.value
  if (showReplyForm.value) {
    replyContent.value = ''
  }
}

const submitReply = async () => {
  const validation = validateCommentContent(replyContent.value)
  if (!validation.isValid) {
    window.$toast(validation.message, 'error')
    return
  }

  isReplying.value = true

  try {
    await socialMediaStore.createComment(
      props.postId,
      replyContent.value.trim(),
      props.comment.id
    )
    
    replyContent.value = ''
    showReplyForm.value = false
    window.$toast('پاسخ ارسال شد', 'success')

  } catch (error) {
    window.$toast(error.message, 'error')
  } finally {
    isReplying.value = false
  }
}

const cancelReply = () => {
  replyContent.value = ''
  showReplyForm.value = false
}

const deleteComment = () => {
  if (window.$confirm) {
    window.$confirm(
      'حذف نظر',
      'آیا مطمئن هستید که می‌خواهید این نظر را حذف کنید؟',
      async () => {
        try {
          await socialMediaStore.deleteComment(props.comment.id, props.postId)
          showOptions.value = false
          window.$toast('نظر حذف شد', 'success')
        } catch (error) {
          window.$toast(error.message, 'error')
        }
      }
    )
  }
}

// Close options when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showOptions.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.comment-item {
  @apply mb-4;
}

.reply-comment {
  @apply mr-8;
}

.user-avatar {
  @apply w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-xs flex-shrink-0;
}

.comment-bubble {
  @apply bg-gray-100 rounded-2xl p-3;
}

.reply-comment .comment-bubble {
  @apply bg-gray-50;
}

/* Custom styling for nested comments */
.reply-comment .user-avatar {
  @apply w-6 h-6 text-xs;
}

/* Hover effects */
.comment-item:hover .comment-bubble {
  @apply bg-gray-50;
}

.reply-comment:hover .comment-bubble {
  @apply bg-gray-100;
}
</style>