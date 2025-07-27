<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4 space-x-reverse">
            <button 
              @click="$router.push('/')"
              class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <i class="fas fa-arrow-right text-gray-600"></i>
            </button>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">شبکه اجتماعی مکانیک</h1>
              <p class="text-sm text-gray-600">پلتفرم ارتباطی و اشتراک‌گذاری</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-4 space-x-reverse">
            <div class="relative">
              <input
                v-model="searchQuery"
                @input="handleSearch"
                type="text"
                placeholder="جستجو در پست‌ها..."
                class="form-control w-64 pr-10"
              >
              <i class="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
            <UserProfile />
          </div>
        </div>
      </div>
    </header>

    <div class="container mx-auto px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="card sticky top-6">
            <div class="card-header">
              <h3 class="font-semibold text-gray-900">منو</h3>
            </div>
            <div class="card-body p-0">
              <nav class="space-y-1">
                <button
                  v-for="item in menuItems"
                  :key="item.id"
                  @click="activeView = item.id"
                  :class="[
                    'w-full flex items-center px-4 py-3 text-right hover:bg-gray-50 transition-colors',
                    activeView === item.id ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600' : 'text-gray-700'
                  ]"
                >
                  <i :class="item.icon" class="ml-3"></i>
                  {{ item.name }}
                </button>
              </nav>
            </div>
          </div>

          <!-- Online Users -->
          <div class="card mt-6">
            <div class="card-header">
              <h3 class="font-semibold text-gray-900">کاربران آنلاین</h3>
            </div>
            <div class="card-body">
              <UsersList :users="onlineUsers" :showOnlineStatus="true" />
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-3">
          <!-- Timeline View -->
          <div v-if="activeView === 'timeline'">
            <SocialMedia />
          </div>

          <!-- My Posts View -->
          <div v-else-if="activeView === 'my-posts'">
            <div class="card">
              <div class="card-header">
                <h3 class="font-semibold text-gray-900">پست‌های من</h3>
              </div>
              <div class="card-body">
                <div v-if="myPosts.length === 0" class="text-center py-8 text-gray-500">
                  <i class="fas fa-file-alt text-4xl mb-4"></i>
                  <p>شما هنوز پستی منتشر نکرده‌اید</p>
                  <button 
                    @click="activeView = 'timeline'"
                    class="btn btn-primary mt-4"
                  >
                    ایجاد پست جدید
                  </button>
                </div>
                <div v-else class="space-y-6">
                  <PostCard
                    v-for="post in myPosts"
                    :key="post.id"
                    :post="post"
                    :showActions="true"
                    @edit="editPost"
                    @delete="confirmDeletePost"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Search Results View -->
          <div v-else-if="activeView === 'search'">
            <div class="card">
              <div class="card-header">
                <h3 class="font-semibold text-gray-900">
                  نتایج جستجو برای "{{ searchQuery }}"
                </h3>
              </div>
              <div class="card-body">
                <div v-if="searchResults.length === 0" class="text-center py-8 text-gray-500">
                  <i class="fas fa-search text-4xl mb-4"></i>
                  <p>نتیجه‌ای یافت نشد</p>
                </div>
                <div v-else class="space-y-6">
                  <PostCard
                    v-for="post in searchResults"
                    :key="post.id"
                    :post="post"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Users List View -->
          <div v-else-if="activeView === 'users'">
            <div class="card">
              <div class="card-header">
                <h3 class="font-semibold text-gray-900">اعضای شبکه مکانیک</h3>
              </div>
              <div class="card-body">
                <UsersList :users="allUsers" :showFullInfo="true" />
              </div>
            </div>
          </div>

          <!-- Statistics View -->
          <div v-else-if="activeView === 'stats'">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="card">
                <div class="card-header">
                  <h3 class="font-semibold text-gray-900">آمار کلی</h3>
                </div>
                <div class="card-body">
                  <div class="space-y-4">
                    <div class="flex justify-between">
                      <span class="text-gray-600">کل پست‌ها:</span>
                      <span class="font-semibold">{{ socialMediaStore.posts.length }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">کل نظرات:</span>
                      <span class="font-semibold">{{ totalComments }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">کل لایک‌ها:</span>
                      <span class="font-semibold">{{ totalLikes }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">اعضای فعال:</span>
                      <span class="font-semibold">{{ onlineUsers.length }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card">
                <div class="card-header">
                  <h3 class="font-semibold text-gray-900">فعالیت من</h3>
                </div>
                <div class="card-body">
                  <div class="space-y-4">
                    <div class="flex justify-between">
                      <span class="text-gray-600">پست‌های من:</span>
                      <span class="font-semibold">{{ myPosts.length }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">نظرات من:</span>
                      <span class="font-semibold">{{ myComments }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">لایک‌های من:</span>
                      <span class="font-semibold">{{ myLikes }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">امتیاز فعالیت:</span>
                      <span class="font-semibold text-green-600">{{ activityScore }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSocialMediaStore } from '@/stores/socialMedia'
import UserProfile from '@/components/auth/UserProfile.vue'
import SocialMedia from '@/components/mechanical/SocialMedia.vue'
import PostCard from '@/components/mechanical/PostCard.vue'
import PostModal from '@/components/mechanical/PostModal.vue'
import UsersList from '@/components/mechanical/UsersList.vue'
import { debounce } from '@/utils/helpers'

const authStore = useAuthStore()
const socialMediaStore = useSocialMediaStore()

const activeView = ref('timeline')
const searchQuery = ref('')
const showEditModal = ref(false)
const editingPost = ref(null)

// Mock data for demo
const onlineUsers = ref([
  { id: 1, username: 'ali_mechanic', full_name: 'علی محمدی', avatar_url: null, isOnline: true },
  { id: 2, username: 'sara_engineer', full_name: 'سارا احمدی', avatar_url: null, isOnline: true },
  { id: 3, username: 'hassan_tech', full_name: 'حسن تکنیسین', avatar_url: null, isOnline: true }
])

const allUsers = ref([
  { id: 1, username: 'ali_mechanic', full_name: 'علی محمدی', department: 'مکانیک', avatar_url: null },
  { id: 2, username: 'sara_engineer', full_name: 'سارا احمدی', department: 'مکانیک', avatar_url: null },
  { id: 3, username: 'hassan_tech', full_name: 'حسن تکنیسین', department: 'مکانیک', avatar_url: null }
])

const menuItems = [
  { id: 'timeline', name: 'صفحه اصلی', icon: 'fas fa-home' },
  { id: 'my-posts', name: 'پست‌های من', icon: 'fas fa-file-alt' },
  { id: 'users', name: 'اعضا', icon: 'fas fa-users' },
  { id: 'stats', name: 'آمار', icon: 'fas fa-chart-bar' }
]

// Computed properties
const myPosts = computed(() => {
  return socialMediaStore.posts.filter(post => post.user_id === authStore.user?.id)
})

const searchResults = computed(() => {
  return socialMediaStore.searchResults
})

const totalComments = computed(() => {
  return socialMediaStore.posts.reduce((total, post) => total + (post.comments_count || 0), 0)
})

const totalLikes = computed(() => {
  return socialMediaStore.posts.reduce((total, post) => total + (post.likes_count || 0), 0)
})

const myComments = computed(() => {
  // This would need to be calculated from actual comment data
  return Math.floor(Math.random() * 50) + 10
})

const myLikes = computed(() => {
  // This would need to be calculated from actual like data
  return Math.floor(Math.random() * 100) + 20
})

const activityScore = computed(() => {
  return (myPosts.value.length * 10) + (myComments.value * 3) + (myLikes.value * 1)
})

// Methods
const handleSearch = debounce(async (event) => {
  const query = event.target.value.trim()
  if (query) {
    activeView.value = 'search'
    await socialMediaStore.searchPosts(query)
  } else {
    socialMediaStore.clearSearch()
  }
}, 300)

const editPost = (post) => {
  editingPost.value = post
  showEditModal.value = true
}

const confirmDeletePost = (post) => {
  if (window.$confirm) {
    window.$confirm(
      'حذف پست',
      'آیا مطمئن هستید که می‌خواهید این پست را حذف کنید؟',
      async () => {
        try {
          await socialMediaStore.deletePost(post.id)
          window.$toast('پست با موفقیت حذف شد', 'success')
        } catch (error) {
          window.$toast(error.message, 'error')
        }
      }
    )
  }
}

const handlePostUpdated = async (updatedPost) => {
  showEditModal.value = false
  editingPost.value = null
  window.$toast('پست با موفقیت به‌روزرسانی شد', 'success')
}

// Watchers
watch(searchQuery, (newQuery) => {
  if (!newQuery.trim()) {
    activeView.value = 'timeline'
    socialMediaStore.clearSearch()
  }
})

onMounted(async () => {
  // Load initial posts
  try {
    await socialMediaStore.loadPosts(1, 20, true)
  } catch (error) {
    console.error('Error loading posts:', error)
  }
})
</script>