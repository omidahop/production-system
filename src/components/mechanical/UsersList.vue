<template>
  <div class="users-list">
    <div v-if="users.length === 0" class="text-center py-8 text-gray-500">
      <i class="fas fa-users text-3xl mb-3"></i>
      <p>هیچ کاربری یافت نشد</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="user in users"
        :key="user.id"
        class="user-item"
        @click="$emit('userClick', user)"
      >
        <div class="flex items-center space-x-4 space-x-reverse">
          <!-- Avatar -->
          <div class="user-avatar" :style="{ backgroundColor: getUserColor(user.username) }">
            {{ getUserInitial(user.full_name || user.username) }}
          </div>
          
          <!-- User Info -->
          <div class="flex-1">
            <div class="flex items-center space-x-2 space-x-reverse">
              <h4 class="font-semibold text-gray-900">
                {{ user.full_name || user.username || 'کاربر ناشناس' }}
              </h4>
              
              <!-- Online Status -->
              <div
                v-if="showOnlineStatus"
                class="online-indicator"
                :class="{ 'online': user.isOnline }"
              >
                <div class="status-dot"></div>
              </div>
              
              <!-- Admin Badge -->
              <span
                v-if="user.is_admin"
                class="admin-badge"
              >
                مدیر
              </span>
            </div>
            
            <div class="user-details">
              <p class="text-sm text-gray-600">{{ user.username || 'نام کاربری نامشخص' }}</p>
              
              <div v-if="showFullInfo" class="mt-1 text-xs text-gray-500">
                <div class="flex items-center space-x-4 space-x-reverse">
                  <span v-if="user.department">
                    <i class="fas fa-building ml-1"></i>
                    {{ getDepartmentName(user.department) }}
                  </span>
                  
                  <span v-if="user.created_at">
                    <i class="fas fa-calendar ml-1"></i>
                    عضو از {{ formatJoinDate(user.created_at) }}
                  </span>
                </div>
                
                <!-- User Stats -->
                <div v-if="user.stats" class="mt-2 flex items-center space-x-4 space-x-reverse">
                  <span>
                    <i class="fas fa-file-alt ml-1 text-blue-500"></i>
                    {{ user.stats.posts || 0 }} پست
                  </span>
                  <span>
                    <i class="fas fa-comment ml-1 text-green-500"></i>
                    {{ user.stats.comments || 0 }} نظر
                  </span>
                  <span>
                    <i class="fas fa-heart ml-1 text-red-500"></i>
                    {{ user.stats.likes || 0 }} پسند
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Action Button -->
          <div v-if="showActions">
            <button
              @click.stop="$emit('userAction', user)"
              class="btn btn-primary btn-sm"
            >
              <i class="fas fa-envelope ml-1"></i>
              پیام
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatPersianDate } from '@/utils/helpers'

const props = defineProps({
  users: {
    type: Array,
    default: () => []
  },
  showOnlineStatus: {
    type: Boolean,
    default: false
  },
  showFullInfo: {
    type: Boolean,
    default: false
  },
  showActions: {
    type: Boolean,
    default: false
  }
})

defineEmits(['userClick', 'userAction'])

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

const getDepartmentName = (department) => {
  const departments = {
    mechanical: 'مکانیک',
    electrical: 'برق',
    automation: 'اتوماسیون',
    production: 'تولید',
    maintenance: 'نگهداری'
  }
  return departments[department] || department
}

const formatJoinDate = (date) => {
  return formatPersianDate(date, 'MMM yyyy')
}
</script>

<style scoped>
.users-list {
  @apply max-h-96 overflow-y-auto;
}

.user-item {
  @apply p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer;
}

.user-avatar {
  @apply w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0;
}

.online-indicator {
  @apply relative;
}

.status-dot {
  @apply w-3 h-3 rounded-full bg-gray-400;
}

.online-indicator.online .status-dot {
  @apply bg-green-500;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

.admin-badge {
  @apply inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800;
}

.user-details {
  @apply min-w-0 flex-1;
}

/* Custom scrollbar */
.users-list::-webkit-scrollbar {
  width: 4px;
}

.users-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.users-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.users-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive */
@media (max-width: 768px) {
  .user-item {
    @apply p-3;
  }
  
  .user-avatar {
    @apply w-10 h-10 text-base;
  }
  
  .user-details .text-xs {
    @apply text-xs;
  }
}
</style>