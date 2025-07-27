<template>
  <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-96 overflow-y-auto">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-semibold text-gray-900">
        {{ post ? 'ویرایش پست' : 'پست جدید' }}
      </h3>
      <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="form-label">محتوای پست:</label>
        <textarea
          v-model="formData.content"
          class="form-control"
          rows="6"
          placeholder="چه چیزی در ذهن دارید؟"
          maxlength="1000"
          required
        ></textarea>
        <div class="text-xs text-gray-500 mt-1">
          {{ formData.content.length }}/1000 کاراکتر
        </div>
      </div>

      <div v-if="formData.media_urls && formData.media_urls.length > 0">
        <label class="form-label">تصاویر موجود:</label>
        <div class="grid grid-cols-3 gap-3">
          <div
            v-for="(url, index) in formData.media_urls"
            :key="index"
            class="relative group"
          >
            <img
              :src="url"
              class="w-full h-20 object-cover rounded-lg"
              :alt="`Media ${index + 1}`"
            >
            <button
              @click="removeMedia(index)"
              type="button"
              class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <div>
        <label class="form-label">افزودن تصویر:</label>
        <input
          ref="mediaInput"
          type="file"
          accept="image/*"
          multiple
          @change="handleMediaUpload"
          class="form-control"
        >
        <small class="text-gray-500">حداکثر ۵ تصویر، هر کدام حداکثر ۱۰ مگابایت</small>
      </div>

      <div class="flex space-x-3 space-x-reverse pt-4">
        <button
          type="submit"
          class="btn btn-primary flex-1"
          :disabled="!formData.content.trim() || isSubmitting"
        >
          <LoadingSpinner v-if="isSubmitting" size="sm" color="white" class="ml-2" />
          <i v-else class="fas fa-paper-plane ml-2"></i>
          {{ post ? 'به‌روزرسانی' : 'انتشار' }}
        </button>
        <button
          type="button"
          @click="$emit('close')"
          class="btn btn-outline"
        >
          انصراف
        </button>
      </div>
    </form>
  </div>
 </template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSocialMediaStore } from '@/stores/socialMedia'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { validatePostContent, validateFile } from '@/utils/validation'

const props = defineProps({
  post: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'created', 'updated'])

const socialMediaStore = useSocialMediaStore()

const formData = ref({
  content: '',
  media_urls: []
})

const isSubmitting = ref(false)
const mediaInput = ref(null)

const handleSubmit = async () => {
  const validation = validatePostContent(formData.value.content)
  if (!validation.isValid) {
    window.$toast(validation.message, 'error')
    return
  }

  isSubmitting.value = true

  try {
    if (props.post) {
      // Update existing post
      const updatedPost = await socialMediaStore.updatePost(props.post.id, {
        content: formData.value.content.trim(),
        media_urls: formData.value.media_urls
      })
      emit('updated', updatedPost)
    } else {
      // Create new post
      const newPost = await socialMediaStore.createPost({
        content: formData.value.content.trim(),
        media_urls: formData.value.media_urls,
        post_type: formData.value.media_urls.length > 0 ? 'image' : 'text'
      })
      emit('created', newPost)
    }

    window.$toast(
      props.post ? 'پست به‌روزرسانی شد' : 'پست ایجاد شد',
      'success'
    )

  } catch (error) {
    window.$toast(error.message, 'error')
  } finally {
    isSubmitting.value = false
  }
}

const handleMediaUpload = async (event) => {
  const files = Array.from(event.target.files)
  
  for (const file of files) {
    if (formData.value.media_urls.length >= 5) {
      window.$toast('حداکثر ۵ تصویر مجاز است', 'warning')
      break
    }

    const validation = validateFile(file, {
      maxSize: 10 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    })

    if (!validation.isValid) {
      window.$toast(validation.message, 'error')
      continue
    }

    try {
      const mediaUrl = await socialMediaStore.uploadMedia(file)
      formData.value.media_urls.push(mediaUrl)
    } catch (error) {
      window.$toast(`خطا در آپلود ${file.name}`, 'error')
    }
  }

  if (mediaInput.value) {
    mediaInput.value.value = ''
  }
}

const removeMedia = (index) => {
  formData.value.media_urls.splice(index, 1)
}

onMounted(() => {
  if (props.post) {
    formData.value = {
      content: props.post.content,
      media_urls: [...(props.post.media_urls || [])]
    }
  }
})
</script>