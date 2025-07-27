import { format, parseISO, differenceInDays, isToday, isYesterday } from 'date-fns-jalali'

/**
 * Date Utilities
 */
export const formatDate = (date, formatStr = 'yyyy/MM/dd') => {
  if (!date) return '--'
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatStr)
  } catch (error) {
    console.error('Date formatting error:', error)
    return '--'
  }
}

export const formatDateTime = (date) => {
  return formatDate(date, 'yyyy/MM/dd - HH:mm')
}

export const getRelativeTime = (date) => {
  if (!date) return '--'
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    
    if (isToday(dateObj)) {
      return `امروز - ${format(dateObj, 'HH:mm')}`
    } else if (isYesterday(dateObj)) {
      return `دیروز - ${format(dateObj, 'HH:mm')}`
    } else {
      const daysDiff = differenceInDays(new Date(), dateObj)
      if (daysDiff <= 7) {
        return `${daysDiff} روز پیش`
      }
      return formatDate(dateObj)
    }
  } catch (error) {
    console.error('Relative time error:', error)
    return '--'
  }
}

export const getCurrentDate = () => {
  return format(new Date(), 'yyyy-MM-dd')
}

export const getCurrentDateTime = () => {
  return new Date().toISOString()
}

/**
 * Number Utilities
 */
export const formatNumber = (num, decimals = 2) => {
  if (num === null || num === undefined) return '--'
  
  return parseFloat(num).toFixed(decimals)
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 بایت'
  
  const k = 1024
  const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const generateRandomColor = () => {
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
    '#14b8a6', '#f43f5e', '#a855f7', '#22d3ee', '#eab308'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * String Utilities
 */
export const truncateText = (text, length = 100) => {
  if (!text) return ''
  if (text.length <= length) return text
  
  return text.substring(0, length) + '...'
}

export const slugify = (text) => {
  if (!text) return ''
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

export const capitalizeFirst = (text) => {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export const extractHashtags = (text) => {
  if (!text) return []
  
  const hashtagRegex = /#[\u0600-\u06FF\w]+/g
  return text.match(hashtagRegex) || []
}

export const extractMentions = (text) => {
  if (!text) return []
  
  const mentionRegex = /@[\u0600-\u06FF\w]+/g
  return text.match(mentionRegex) || []
}

/**
 * Array Utilities
 */
export const groupBy = (array, key) => {
  return array.reduce((result, currentValue) => {
    const groupKey = currentValue[key]
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(currentValue)
    return result
  }, {})
}

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (direction === 'desc') {
      return bVal > aVal ? 1 : -1
    }
    
    return aVal > bVal ? 1 : -1
  })
}

export const uniqueBy = (array, key) => {
  const seen = new Set()
  return array.filter(item => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

export const chunk = (array, size) => {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * Object Utilities
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  
  const clonedObj = {}
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key])
    }    }
  return clonedObj
}

export const isEmpty = (value) => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

export const pick = (obj, keys) => {
  const result = {}
  keys.forEach(key => {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key]
    }
  })
  return result
}

export const omit = (obj, keys) => {
  const result = { ...obj }
  keys.forEach(key => {
    delete result[key]
  })
  return result
}

/**
 * Validation Utilities
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password) => {
  return password && password.length >= 8
}

export const validateUsername = (username) => {
  if (!username || username.length < 3 || username.length > 50) {
    return false
  }
  const usernameRegex = /^[a-zA-Z0-9_]+$/
  return usernameRegex.test(username)
}

export const validateVibrationValue = (value, parameterType) => {
  const num = parseFloat(value)
  if (isNaN(num) || num < 0) return false
  
  const maxValue = parameterType === 'velocity' ? 20 : 2
  return num <= maxValue
}

export const validateFileSize = (file, maxSize = 10 * 1024 * 1024) => {
  return file.size <= maxSize
}

export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type)
}

/**
 * Local Storage Utilities
 */
export const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error('Error setting localStorage:', error)
    return false
  }
}

export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error('Error getting localStorage:', error)
    return defaultValue
  }
}

export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error('Error removing localStorage:', error)
    return false
  }
}

export const clearLocalStorage = () => {
  try {
    localStorage.clear()
    return true
  } catch (error) {
    console.error('Error clearing localStorage:', error)
    return false
  }
}

/**
 * Cache Utilities
 */
export class SimpleCache {
  constructor(prefix = 'cache_', defaultExpiry = 5 * 60 * 1000) {
    this.prefix = prefix
    this.defaultExpiry = defaultExpiry
  }

  set(key, value, expiry = this.defaultExpiry) {
    const item = {
      value,
      expiry: Date.now() + expiry,
      timestamp: Date.now()
    }
    
    setLocalStorage(this.prefix + key, item)
  }

  get(key) {
    const item = getLocalStorage(this.prefix + key)
    
    if (!item) return null
    
    if (Date.now() > item.expiry) {
      this.remove(key)
      return null
    }
    
    return item.value
  }

  remove(key) {
    removeLocalStorage(this.prefix + key)
  }

  clear() {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key)
      }
    })
  }

  isExpired(key) {
    const item = getLocalStorage(this.prefix + key)
    if (!item) return true
    
    return Date.now() > item.expiry
  }
}

/**
 * URL Utilities
 */
export const getQueryParam = (name) => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(name)
}

export const setQueryParam = (name, value) => {
  const url = new URL(window.location)
  url.searchParams.set(name, value)
  window.history.pushState({}, '', url)
}

export const removeQueryParam = (name) => {
  const url = new URL(window.location)
  url.searchParams.delete(name)
  window.history.pushState({}, '', url)
}

/**
 * DOM Utilities
 */
export const scrollToTop = (smooth = true) => {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto'
  })
}

export const scrollToElement = (element, offset = 0) => {
  if (!element) return
  
  const elementPosition = element.offsetTop - offset
  window.scrollTo({
    top: elementPosition,
    behavior: 'smooth'
  })
}

export const isElementInViewport = (element) => {
  if (!element) return false
  
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * Performance Utilities
 */
export const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

export const throttle = (func, limit) => {
  let inThrottle
  return (...args) => {
    if (!inThrottle) {
      func.apply(null, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Error Handling Utilities
 */
export const handleApiError = (error) => {
  console.error('API Error:', error)
  
  if (error.response) {
    // Server responded with error status
    const status = error.response.status
    const message = error.response.data?.message
    
    switch (status) {
      case 401:
        return 'شما مجاز به انجام این عملیات نیستید'
      case 403:
        return 'دسترسی مجاز نیست'
      case 404:
        return 'داده مورد نظر یافت نشد'
      case 422:
        return message || 'داده‌های ورودی نامعتبر است'
      case 500:
        return 'خطا در سرور. لطفاً دوباره تلاش کنید'
      default:
        return message || 'خطای غیرمنتظره‌ای رخ داد'
    }
  } else if (error.request) {
    // Request was made but no response received
    return 'خطا در اتصال به شبکه'
  } else {
    // Something else happened
    return error.message || 'خطای غیرمنتظره‌ای رخ داد'
  }
}

export const createErrorHandler = (defaultMessage = 'خطای غیرمنتظره‌ای رخ داد') => {
  return (error) => {
    const message = handleApiError(error)
    
    // Show toast notification if available
    if (window.$toast) {
      window.$toast(message, 'error')
    }
    
    return message
  }
}

// Export all utilities
export default {
  // Date
  formatDate,
  formatDateTime,
  getRelativeTime,
  getCurrentDate,
  getCurrentDateTime,
  
  // Number
  formatNumber,
  formatFileSize,
  generateRandomColor,
  
  // String
  truncateText,
  slugify,
  capitalizeFirst,
  generateId,
  extractHashtags,
  extractMentions,
  
  // Array
  groupBy,
  sortBy,
  uniqueBy,
  chunk,
  
  // Object
  deepClone,
  isEmpty,
  pick,
  omit,
  
  // Validation
  validateEmail,
  validatePassword,
  validateUsername,
  validateVibrationValue,
  validateFileSize,
  validateFileType,
  
  // Storage
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
  clearLocalStorage,
  SimpleCache,
  
  // URL
  getQueryParam,
  setQueryParam,
  removeQueryParam,
  
  // DOM
  scrollToTop,
  scrollToElement,
  isElementInViewport,
  
  // Performance
  debounce,
  throttle,
  
  // Error Handling
  handleApiError,
  createErrorHandler
}