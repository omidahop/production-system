// Application Constants
export const APP_CONFIG = {
  name: 'سیستم جامع تولید',
  version: '1.0.0',
  
  // Equipment Configuration
  equipments: [
    { id: 'GB-cp48A', name: 'گیربکس کمپرسور 48A', code: 'GB-cp 48A', icon: 'fas fa-cog', color: '#8b5cf6' },
    { id: 'CP-cp48A', name: 'کمپرسور 48A', code: 'CP-cp 48A', icon: 'fas fa-compress', color: '#06b6d4' },
    { id: 'GB-cp48B', name: 'گیربکس کمپرسور 48B', code: 'GB-cp 48B', icon: 'fas fa-cog', color: '#8b5cf6' },
    { id: 'CP-cp48B', name: 'کمپرسور 48B', code: 'CP-cp 48B', icon: 'fas fa-compress', color: '#06b6d4' },
    { id: 'GB-cp51', name: 'گیربکس کمپرسور 51', code: 'GB-cp 51', icon: 'fas fa-cog', color: '#8b5cf6' },
    { id: 'CP-cp51', name: 'کمپرسور 51', code: 'CP-cp 51', icon: 'fas fa-compress', color: '#06b6d4' },
    { id: 'GB-cp71', name: 'گیربکس کمپرسور 71', code: 'GB-cp 71', icon: 'fas fa-cog', color: '#8b5cf6' },
    { id: 'CP-cp71', name: 'کمپرسور 71', code: 'CP-cp 71', icon: 'fas fa-compress', color: '#06b6d4' },
    { id: 'CP-cpSGC', name: 'کمپرسور سیل گس', code: 'CP-cp SGC', icon: 'fas fa-compress', color: '#06b6d4' },
    { id: 'FN-fnESF', name: 'فن استک', code: 'FN-fn ESF', icon: 'fas fa-fan', color: '#10b981' },
    { id: 'FN-fnAUX', name: 'فن اگزیلاری', code: 'FN-fn AUX', icon: 'fas fa-fan', color: '#10b981' },
    { id: 'FN-fnMAB', name: 'فن هوای اصلی', code: 'FN-fn MAB', icon: 'fas fa-fan', color: '#10b981' }
  ],
  
  // Parameter Configuration
  parameters: [
    { id: 'V1', name: 'سرعت عمودی متصل', code: 'V1', icon: 'fas fa-arrow-up', color: '#ec4899', type: 'velocity', category: 'connected', maxValue: 20, order: 1 },
    { id: 'GV1', name: 'شتاب عمودی متصل', code: 'GV1', icon: 'fas fa-arrow-up', color: '#f59e0b', type: 'acceleration', category: 'connected', maxValue: 2, order: 2 },
    { id: 'H1', name: 'سرعت افقی متصل', code: 'H1', icon: 'fas fa-arrow-right', color: '#ec4899', type: 'velocity', category: 'connected', maxValue: 20, order: 3 },
    { id: 'GH1', name: 'شتاب افقی متصل', code: 'GH1', icon: 'fas fa-arrow-right', color: '#f59e0b', type: 'acceleration', category: 'connected', maxValue: 2, order: 4 },
    { id: 'A1', name: 'سرعت محوری متصل', code: 'A1', icon: 'fas fa-arrows-alt', color: '#ec4899', type: 'velocity', category: 'connected', maxValue: 20, order: 5 },
    { id: 'GA1', name: 'شتاب محوری متصل', code: 'GA1', icon: 'fas fa-arrows-alt', color: '#f59e0b', type: 'acceleration', category: 'connected', maxValue: 2, order: 6 },
    { id: 'V2', name: 'سرعت عمودی آزاد', code: 'V2', icon: 'fas fa-arrow-up', color: '#6366f1', type: 'velocity', category: 'free', maxValue: 20, order: 7 },
    { id: 'GV2', name: 'شتاب عمودی آزاد', code: 'GV2', icon: 'fas fa-arrow-up', color: '#8b5cf6', type: 'acceleration', category: 'free', maxValue: 2, order: 8 },
    { id: 'H2', name: 'سرعت افقی آزاد', code: 'H2', icon: 'fas fa-arrow-right', color: '#6366f1', type: 'velocity', category: 'free', maxValue: 20, order: 9 },
    { id: 'GH2', name: 'شتاب افقی آزاد', code: 'GH2', icon: 'fas fa-arrow-right', color: '#8b5cf6', type: 'acceleration', category: 'free', maxValue: 2, order: 10 },
    { id: 'A2', name: 'سرعت محوری آزاد', code: 'A2', icon: 'fas fa-arrows-alt', color: '#6366f1', type: 'velocity', category: 'free', maxValue: 20, order: 11 },
    { id: 'GA2', name: 'شتاب محوری آزاد', code: 'GA2', icon: 'fas fa-arrows-alt', color: '#8b5cf6', type: 'acceleration', category: 'free', maxValue: 2, order: 12 }
  ],
  
  // Units Configuration
  units: [
    { id: 'DRI1', name: 'واحد احیا مستقیم 1', code: 'DRI 1', color: '#3b82f6' },
    { id: 'DRI2', name: 'واحد احیا مستقیم 2', code: 'DRI 2', color: '#ef4444' }
  ],
  
  // User Roles
  roles: {
    ADMIN: 'admin',
    USER: 'user',
    MODERATOR: 'moderator'
  },
  
  // Post Types
  postTypes: {
    TEXT: 'text',
    IMAGE: 'image',
    VIDEO: 'video',
    LINK: 'link'
  },
  
  // System Settings
  settings: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedVideoTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    maxPostLength: 1000,
    maxCommentLength: 500,
    defaultPageSize: 20,
    cacheExpiry: 5 * 60 * 1000 // 5 minutes
  },
  
  // API Endpoints
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://wogdiffpqlgpigwfsrbf.supabase.co',
    timeout: 10000
  }
}

// Route Names
export const ROUTE_NAMES = {
  LOGIN: 'Login',
  DASHBOARD: 'Dashboard',
  VIBRATION_SYSTEM: 'VibrationSystem',
  MECHANICAL_NET: 'MechanicalNet',
  ADMIN: 'Admin',
  PROFILE: 'Profile'
}

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  CACHE_PREFIX: 'cache_',
  VIBRATION_SETTINGS: 'vibration_settings'
}

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'خطا در اتصال به شبکه',
  UNAUTHORIZED: 'شما مجاز به انجام این عملیات نیستید',
  FORBIDDEN: 'دسترسی مجاز نیست',
  NOT_FOUND: 'صفحه مورد نظر یافت نشد',
  SERVER_ERROR: 'خطا در سرور. لطفاً دوباره تلاش کنید',
  VALIDATION_ERROR: 'داده‌های ورودی نامعتبر است',
  FILE_TOO_LARGE: 'حجم فایل بیش از حد مجاز است',
  INVALID_FILE_TYPE: 'نوع فایل پشتیبانی نمی‌شود'
}

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'با موفقیت وارد شدید',
  LOGOUT: 'با موفقیت خارج شدید',
  DATA_SAVED: 'داده‌ها با موفقیت ذخیره شد',
  DATA_UPDATED: 'داده‌ها با موفقیت به‌روزرسانی شد',
  DATA_DELETED: 'داده‌ها با موفقیت حذف شد',
  POST_CREATED: 'پست با موفقیت ایجاد شد',
  COMMENT_ADDED: 'نظر با موفقیت اضافه شد'
}

// Validation Rules
export const VALIDATION_RULES = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'ایمیل معتبر وارد کنید'
  },
  password: {
    required: true,
    minLength: 8,
    message: 'رمز عبور باید حداقل ۸ کاراکتر باشد'
  },
  username: {
    required: true,
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: 'نام کاربری باید بین ۳ تا ۵۰ کاراکتر و شامل حروف، اعداد و _ باشد'
  },
  postContent: {
    required: true,
    maxLength: 1000,
    message: 'محتوای پست نباید بیش از ۱۰۰۰ کاراکتر باشد'
  },
  commentContent: {
    required: true,
    maxLength: 500,
    message: 'محتوای نظر نباید بیش از ۵۰۰ کاراکتر باشد'
  },
  vibrationValue: {
    required: true,
    min: 0,
    max: 20,
    message: 'مقدار باید بین ۰ تا ۲۰ باشد'
  },
  accelerationValue: {
    required: true,
    min: 0,
    max: 2,
    message: 'مقدار باید بین ۰ تا ۲ باشد'
  }
}

export default {
  APP_CONFIG,
  ROUTE_NAMES,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES
}