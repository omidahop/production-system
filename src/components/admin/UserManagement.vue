<template>
  <div class="space-y-6">
    <!-- Pending Approvals Section -->
    <div v-if="pendingUsers.length > 0" class="card">
      <div class="card-header">
        <h3 class="font-semibold text-gray-900">
          درخواست‌های تایید ({{ pendingUsers.length }})
        </h3>
        <div class="flex space-x-2 space-x-reverse">
          <button
            @click="bulkApprove"
            :disabled="selectedPendingUsers.length === 0 || isProcessing"
            class="btn btn-success btn-sm"
          >
            <LoadingSpinner v-if="isProcessing" size="sm" color="white" class="ml-2" />
            <i v-else class="fas fa-check ml-2"></i>
            تایید گروهی ({{ selectedPendingUsers.length }})
          </button>
          <button
            @click="selectAllPending"
            class="btn btn-outline btn-sm"
          >
            <i class="fas fa-check-double ml-2"></i>
            انتخاب همه
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="space-y-4">
          <div
            v-for="user in pendingUsers"
            :key="user.id"
            class="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <div class="flex items-center space-x-4 space-x-reverse">
              <input
                v-model="selectedPendingUsers"
                :value="user.id"
                type="checkbox"
                class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              >
              
              <div class="user-avatar bg-yellow-600 text-white">
                {{ getUserInitial(user.full_name || user.username) }}
              </div>
              
              <div>
                <h4 class="font-semibold text-gray-900">
                  {{ user.full_name || user.username || 'کاربر ناشناس' }}
                </h4>
                <div class="text-sm text-gray-600">
                  <p>{{ user.email || 'ایمیل نامشخص' }}</p>
                  <p v-if="user.department">بخش: {{ getDepartmentName(user.department) }}</p>
                  <p>درخواست: {{ formatPersianDate(user.created_at) }}</p>
                </div>
              </div>
            </div>
            
            <div class="flex space-x-2 space-x-reverse">
              <button
                @click="approveUser(user.id)"
                :disabled="isProcessing"
                class="btn btn-success btn-sm"
              >
                <i class="fas fa-check ml-2"></i>
                تایید
              </button>
              
              <button
                @click="rejectUser(user.id)"
                :disabled="isProcessing"
                class="btn btn-error btn-sm"
              >
                <i class="fas fa-times ml-2"></i>
                رد
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- All Users Section -->
    <div class="card">
      <div class="card-header">
        <h3 class="font-semibold text-gray-900">مدیریت کاربران</h3>
        <div class="flex space-x-2 space-x-reverse">
          <button
            @click="loadUsers(1, 50, true)"
            :disabled="isLoading"
            class="btn btn-primary btn-sm"
          >
            <LoadingSpinner v-if="isLoading" size="sm" color="white" class="ml-2" />
            <i v-else class="fas fa-sync ml-2"></i>
            به‌روزرسانی
          </button>
          
          <button
            @click="exportUsers"
            class="btn btn-success btn-sm"
          >
            <i class="fas fa-download ml-2"></i>
            خروجی Excel
          </button>
        </div>
      </div>
      <div class="card-body">
        <!-- Filters -->
        <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="form-label">جستجو:</label>
            <input
              v-model="searchQuery"
              type="text"
              class="form-control"
              placeholder="نام، ایمیل یا نام کاربری..."
            >
          </div>
          
          <div>
            <label class="form-label">وضعیت:</label>
            <select v-model="statusFilter" class="form-control">
              <option value="all">همه</option>
              <option value="approved">تایید شده</option>
              <option value="pending">در انتظار تایید</option>
              <option value="admin">مدیر</option>
            </select>
          </div>
          
          <div>
            <label class="form-label">بخش:</label>
            <select v-model="departmentFilter" class="form-control">
              <option value="">همه بخش‌ها</option>
              <option value="mechanical">مکانیک</option>
              <option value="electrical">برق</option>
              <option value="automation">اتوماسیون</option>
              <option value="production">تولید</option>
              <option value="maintenance">نگهداری</option>
            </select>
          </div>
        </div>

        <!-- Users Table -->
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th class="text-right">کاربر</th>
                <th class="text-center">ایمیل</th>
                <th class="text-center">بخش</th>
                <th class="text-center">وضعیت</th>
                <th class="text-center">تاریخ عضویت</th>
                <th class="text-center">عملیات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td colspan="6" class="text-center py-8">
                  <LoadingSpinner size="lg" />
                  <p class="mt-4 text-gray-600">در حال بارگذاری کاربران...</p>
                </td>
              </tr>
              
              <tr v-else-if="filteredUsers.length === 0">
                <td colspan="6" class="text-center py-8 text-gray-500">
                  <i class="fas fa-users text-3xl mb-3"></i>
                  <p>هیچ کاربری یافت نشد</p>
                </td>
              </tr>
              
              <tr
                v-else
                v-for="user in filteredUsers"
                :key="user.id"
                class="hover:bg-gray-50"
              >
                <td class="text-right">
                  <div class="flex items-center space-x-3 space-x-reverse">
                    <div class="user-avatar" :style="{ backgroundColor: getUserColor(user.username) }">
                      {{ getUserInitial(user.full_name || user.username) }}
                    </div>
                    <div>
                      <p class="font-semibold">{{ user.full_name || 'نام نامشخص' }}</p>
                      <p class="text-sm text-gray-500">{{ user.username || 'نام کاربری نامشخص' }}</p>
                    </div>
                  </div>
                </td>
                
                <td class="text-center">
                  <span class="text-sm">{{ user.email || 'ایمیل نامشخص' }}</span>
                </td>
                
                <td class="text-center">
                  <span class="text-sm">{{ getDepartmentName(user.department) }}</span>
                </td>
                
                <td class="text-center">
                  <div class="flex items-center justify-center space-x-2 space-x-reverse">
                    <span
                      class="status-badge"
                      :class="{
                        'approved': user.is_approved,
                        'pending': !user.is_approved,
                        'admin': user.is_admin
                      }"
                    >
                      {{ getStatusText(user) }}
                    </span>
                  </div>
                </td>
                
                <td class="text-center">
                  <span class="text-sm">{{ formatPersianDate(user.created_at) }}</span>
                </td>
                
                <td class="text-center">
                  <div class="flex items-center justify-center space-x-1 space-x-reverse">
                    <button
                      v-if="!user.is_approved"
                      @click="approveUser(user.id)"
                      :disabled="isProcessing"
                      class="btn btn-success btn-sm"
                      title="تایید کاربر"
                    >
                      <i class="fas fa-check"></i>
                    </button>
                    
                    <button
                      v-if="user.is_approved && !user.is_admin"
                      @click="toggleAdminRole(user)"
                      :disabled="isProcessing"
                      class="btn btn-warning btn-sm"
                      title="تبدیل به مدیر"
                    >
                      <i class="fas fa-crown"></i>
                    </button>
                    
                    <button
                      v-if="user.is_admin && user.id !== authStore.user?.id"
                      @click="toggleAdminRole(user)"
                      :disabled="isProcessing"
                      class="btn btn-secondary btn-sm"
                      title="حذف نقش مدیر"
                    >
                      <i class="fas fa-user"></i>
                    </button>
                    
                    <button
                      @click="showEditModal(user)"
                      class="btn btn-primary btn-sm"
                      title="ویرایش کاربر"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    
                    <button
                      v-if="user.id !== authStore.user?.id"
                      @click="deleteUser(user)"
                      :disabled="isProcessing"
                      class="btn btn-error btn-sm"
                      title="حذف کاربر"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="hasMore && !isLoading" class="text-center mt-6">
          <button
            @click="loadMoreUsers"
            :disabled="isLoadingMore"
            class="btn btn-outline"
          >
            <LoadingSpinner v-if="isLoadingMore" size="sm" class="ml-2" />
            <i v-else class="fas fa-chevron-down ml-2"></i>
            نمایش بیشتر
          </button>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditUserModal" class="modal-backdrop" @click.self="showEditUserModal = false">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">ویرایش کاربر</h3>
          <button @click="showEditUserModal = false" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="updateUser" class="space-y-4">
          <div>
            <label class="form-label">نام و نام خانوادگی:</label>
            <input
              v-model="editUserForm.full_name"
              type="text"
              class="form-control"
              required
            >
          </div>
          
          <div>
            <label class="form-label">نام کاربری:</label>
            <input
              v-model="editUserForm.username"
              type="text"
              class="form-control"
              required
            >
          </div>
          
          <div>
            <label class="form-label">بخش:</label>
            <select v-model="editUserForm.department" class="form-control">
              <option value="mechanical">مکانیک</option>
              <option value="electrical">برق</option>
              <option value="automation">اتوماسیون</option>
              <option value="production">تولید</option>
              <option value="maintenance">نگهداری</option>
            </select>
          </div>
          
          <div class="flex space-x-3 space-x-reverse pt-4">
            <button
              type="submit"
              class="btn btn-primary flex-1"
              :disabled="isProcessing"
            >
              <LoadingSpinner v-if="isProcessing" size="sm" color="white" class="ml-2" />
              ذخیره تغییرات
            </button>
            <button
              type="button"
              @click="showEditUserModal = false"
              class="btn btn-outline"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAdminStore } from '@/stores/admin'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { formatPersianDate } from '@/utils/helpers'

const authStore = useAuthStore()
const adminStore = useAdminStore()

// State
const searchQuery = ref('')
const statusFilter = ref('all')
const departmentFilter = ref('')
const selectedPendingUsers = ref([])
const isProcessing = ref(false)
const isLoadingMore = ref(false)
const showEditUserModal = ref(false)
const editingUser = ref(null)

const editUserForm = ref({
  full_name: '',
  username: '',
  department: 'mechanical'
})

// Computed
const isLoading = computed(() => adminStore.isLoading)
const users = computed(() => adminStore.users)
const pendingUsers = computed(() => adminStore.pendingUsers)
const hasMore = computed(() => adminStore.hasMore)

const filteredUsers = computed(() => {
  let filtered = users.value

  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      (user.full_name && user.full_name.toLowerCase().includes(query)) ||
      (user.username && user.username.toLowerCase().includes(query)) ||
      (user.email && user.email.toLowerCase().includes(query))
    )
  }

  // Status filter
  if (statusFilter.value !== 'all') {
    filtered = adminStore.filterUsersByStatus(statusFilter.value)
  }

  // Department filter
  if (departmentFilter.value) {
    filtered = filtered.filter(user => user.department === departmentFilter.value)
  }

  return filtered
})

// Methods
const loadUsers = async (page = 1, limit = 50, refresh = false) => {
  try {
    await adminStore.loadAllUsers(page, limit, refresh)
  } catch (error) {
    window.$toast(error.message, 'error')
  }
}

const loadMoreUsers = async () => {
  if (isLoadingMore.value || !hasMore.value) return

  isLoadingMore.value = true
  
  try {
    await adminStore.loadMoreUsers()
  } finally {
    isLoadingMore.value = false
  }
}

const getUserInitial = (name) => {
  return name ? name.charAt(0).toUpperCase() : 'U'
}

const getUserColor = (username) => {
  if (!username) return '#6B7280'
  
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const colors = ['#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E']
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
  return departments[department] || 'نامشخص'
}

const getStatusText = (user) => {
  if (user.is_admin) return 'مدیر'
  if (user.is_approved) return 'تایید شده'
  return 'در انتظار تایید'
}

const approveUser = async (userId) => {
  isProcessing.value = true
  
  try {
    await adminStore.approveUser(userId)
    window.$toast('کاربر تایید شد', 'success')
  } catch (error) {
    window.$toast(error.message, 'error')
  } finally {
    isProcessing.value = false
  }
}

const rejectUser = async (userId) => {
  if (window.$confirm) {
    window.$confirm(
      'رد درخواست',
      'آیا مطمئن هستید که می‌خواهید این درخواست را رد کنید؟',
      async () => {
        isProcessing.value = true
        
        try {
          await adminStore.deleteUser(userId)
          window.$toast('درخواست رد شد', 'success')
        } catch (error) {
          window.$toast(error.message, 'error')
        } finally {
          isProcessing.value = false
        }
      }
    )
  }
}

const toggleAdminRole = async (user) => {
  const action = user.is_admin ? 'حذف نقش مدیر از' : 'اعطای نقش مدیر به'
  
  if (window.$confirm) {
    window.$confirm(
      'تغییر نقش',
      `آیا مطمئن هستید که می‌خواهید ${action} این کاربر را انجام دهید؟`,
      async () => {
        isProcessing.value = true
        
        try {
          if (user.is_admin) {
            await adminStore.revokeAdminRole(user.id)
            window.$toast('نقش مدیر حذف شد', 'success')
          } else {
            await adminStore.grantAdminRole(user.id)
            window.$toast('نقش مدیر اعطا شد', 'success')
          }
        } catch (error) {
          window.$toast(error.message, 'error')
        } finally {
          isProcessing.value = false
        }
      }
    )
  }
}

const showEditModal = (user) => {
  editingUser.value = user
  editUserForm.value = {
    full_name: user.full_name || '',
    username: user.username || '',
    department: user.department || 'mechanical'
  }
  showEditUserModal.value = true
}

const updateUser = async () => {
  if (!editingUser.value) return

  isProcessing.value = true
  
  try {
    await adminStore.updateUserProfile(editingUser.value.id, editUserForm.value)
    
    showEditUserModal.value = false
    editingUser.value = null
    window.$toast('اطلاعات کاربر به‌روزرسانی شد', 'success')
    
  } catch (error) {
    window.$toast(error.message, 'error')
  } finally {
    isProcessing.value = false
  }
}

const deleteUser = (user) => {
  if (window.$confirm) {
    window.$confirm(
      'حذف کاربر',
      `آیا مطمئن هستید که می‌خواهید ${user.full_name || user.username} را حذف کنید؟`,
      async () => {
        isProcessing.value = true
        
        try {
          await adminStore.deleteUser(user.id)
          window.$toast('کاربر حذف شد', 'success')
        } catch (error) {
          window.$toast(error.message, 'error')
        } finally {
          isProcessing.value = false
        }
      }
    )
  }
}

const selectAllPending = () => {
  if (selectedPendingUsers.value.length === pendingUsers.value.length) {
    selectedPendingUsers.value = []
  } else {
    selectedPendingUsers.value = pendingUsers.value.map(user => user.id)
  }
}

const bulkApprove = async () => {
  if (selectedPendingUsers.value.length === 0) return

  isProcessing.value = true
  
  try {
    await adminStore.bulkApproveUsers(selectedPendingUsers.value, authStore.user.id)
    
    selectedPendingUsers.value = []
    window.$toast(`${selectedPendingUsers.value.length} کاربر تایید شد`, 'success')
    
  } catch (error) {
    window.$toast(error.message, 'error')
  } finally {
    isProcessing.value = false
  }
}

const exportUsers = () => {
  try {
    const csvData = generateUsersCSV(filteredUsers.value)
    downloadCSV(csvData, `users-${new Date().toISOString().split('T')[0]}.csv`)
    window.$toast('لیست کاربران دانلود شد', 'success')
  } catch (error) {
    window.$toast('خطا در ایجاد فایل خروجی', 'error')
  }
}

const generateUsersCSV = (users) => {
  const headers = ['نام', 'نام کاربری', 'ایمیل', 'بخش', 'وضعیت', 'تاریخ عضویت']
  const rows = [headers]
  
  users.forEach(user => {
    rows.push([
      user.full_name || '',
      user.username || '',
      user.email || '',
      getDepartmentName(user.department),
      getStatusText(user),
      formatPersianDate(user.created_at)
    ])
  })
  
  return '\uFEFF' + rows.map(row => 
    row.map(cell => {
      const cellStr = String(cell)
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`
      }
      return cellStr
    }).join(',')
  ).join('\n')
}

const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Watchers
watch([searchQuery, statusFilter, departmentFilter], () => {
  // Debounce search to avoid too many computations
}, { debounceMs: 300 })

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      adminStore.loadAllUsers(1, 50, true),
      adminStore.loadPendingApprovals()
    ])
  } catch (error) {
    console.error('Error loading admin data:', error)
  }
})
</script>

<style scoped>
.user-avatar {
  @apply w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold;
}

.status-badge {
  @apply inline-flex items-center px-2 py-1 rounded-full text-xs font-medium;
}

.status-badge.approved {
  @apply bg-green-100 text-green-800;
}

.status-badge.pending {
  @apply bg-yellow-100 text-yellow-800;
}

.status-badge.admin {
  @apply bg-red-100 text-red-800;
}
</style>