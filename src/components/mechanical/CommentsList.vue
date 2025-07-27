<template>
  <div class="comments-container">
    <div v-if="isLoading" class="text-center py-4">
      <LoadingSpinner size="sm" />
      <p class="text-sm text-gray-500 mt-2">در حال بارگذاری نظرات...</p>
    </div>

    <div v-else-if="comments.length === 0" class="text-center py-8 text-gray-500">
      <i class="fas fa-comment-slash text-2xl mb-2"></i>
      <p class="text-sm">هنوز نظری ثبت نشده است</p>
      <p class="text-xs">اولین نفری باشید که نظر می‌دهید!</p>
    </div>

    <div v-else class="space-y-4">
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :post-id="postId"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSocialMediaStore } from '@/stores/socialMedia'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import CommentItem from './CommentItem.vue'

const props = defineProps({
  postId: {
    type: Number,
    required: true
  }
})

const socialMediaStore = useSocialMediaStore()

const isLoading = ref(false)
const subscription = ref(null)

const comments = computed(() => {
  return socialMediaStore.comments[props.postId] || []
})

const loadComments = async () => {
  if (comments.value.length > 0) return

  isLoading.value = true
  
  try {
    await socialMediaStore.loadComments(props.postId)
  } catch (error) {
    window.$toast('خطا در بارگذاری نظرات', 'error')
  } finally {
    isLoading.value = false
  }
}

const setupRealTimeUpdates = () => {
  subscription.value = socialMediaStore.subscribeToCommentsUpdates(
    props.postId,
    (payload) => {
      if (payload.eventType === 'INSERT') {
        // Show notification for new comments
        window.$toast('نظر جدید اضافه شد', 'info')
      }
    }
  )
}

onMounted(() => {
  loadComments()
  setupRealTimeUpdates()
})

onUnmounted(() => {
  if (subscription.value) {
    subscription.value.unsubscribe()
  }
})
</script>

<style scoped>
.comments-container {
  @apply max-h-96 overflow-y-auto;
}

/* Custom scrollbar */
.comments-container::-webkit-scrollbar {
  width: 4px;
}

.comments-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.comments-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.comments-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>