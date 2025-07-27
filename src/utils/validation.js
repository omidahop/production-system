import { VALIDATION_RULES } from './constants'

/**
 * Email validation
 */
export const validateEmail = (email) => {
  if (!email) return { isValid: false, message: 'ایمیل الزامی است' }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValid = emailRegex.test(email)
  
  return {
    isValid,
    message: isValid ? '' : 'فرمت ایمیل معتبر نیست'
  }
}

/**
 * Password validation
 */
export const validatePassword = (password) => {
  if (!password) return { isValid: false, message: 'رمز عبور الزامی است' }
  
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  
  if (password.length < minLength) {
    return { isValid: false, message: `رمز عبور باید حداقل ${minLength} کاراکتر باشد` }
  }
  
  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return { 
      isValid: false, 
      message: 'رمز عبور باید شامل حروف بزرگ، کوچک و عدد باشد' 
    }
  }
  
  return { isValid: true, message: '' }
}

/**
 * Username validation
 */
export const validateUsername = (username) => {
  if (!username) return { isValid: false, message: 'نام کاربری الزامی است' }
  
  const minLength = 3
  const maxLength = 50
  const usernameRegex = /^[a-zA-Z0-9_]+$/
  
  if (username.length < minLength || username.length > maxLength) {
    return { 
      isValid: false, 
      message: `نام کاربری باید بین ${minLength} تا ${maxLength} کاراکتر باشد` 
    }
  }
  
  if (!usernameRegex.test(username)) {
    return { 
      isValid: false, 
      message: 'نام کاربری فقط می‌تواند شامل حروف انگلیسی، اعداد و _ باشد' 
    }
  }
  
  return { isValid: true, message: '' }
}

/**
 * Full name validation
 */
export const validateFullName = (fullName) => {
  if (!fullName) return { isValid: false, message: 'نام و نام خانوادگی الزامی است' }
  
  const minLength = 2
  const maxLength = 100
  
  if (fullName.length < minLength || fullName.length > maxLength) {
    return { 
      isValid: false, 
      message: `نام باید بین ${minLength} تا ${maxLength} کاراکتر باشد` 
    }
  }
  
  return { isValid: true, message: '' }
}

/**
 * Vibration value validation
 */
export const validateVibrationValue = (value, parameterType = 'velocity') => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, message: 'مقدار الزامی است' }
  }
  
  const numValue = parseFloat(value)
  
  if (isNaN(numValue)) {
    return { isValid: false, message: 'مقدار باید عدد باشد' }
  }
  
  if (numValue < 0) {
    return { isValid: false, message: 'مقدار نمی‌تواند منفی باشد' }
  }
  
  const maxValue = parameterType === 'velocity' ? 20 : 2
  if (numValue > maxValue) {
    return { 
      isValid: false, 
      message: `حداکثر مقدار مجاز ${maxValue} است` 
    }
  }
  
  // Check decimal places (max 2)
  const decimalPlaces = (numValue.toString().split('.')[1] || '').length
  if (decimalPlaces > 2) {
    return { 
      isValid: false, 
      message: 'حداکثر ۲ رقم اعشار مجاز است' 
    }
  }
  
  return { isValid: true, message: '' }
}

/**
 * Post content validation
 */
export const validatePostContent = (content) => {
  if (!content) return { isValid: false, message: 'محتوای پست الزامی است' }
  
  const minLength = 1
  const maxLength = 1000
  
  if (content.length < minLength || content.length > maxLength) {
    return { 
      isValid: false, 
      message: `محتوای پست باید بین ${minLength} تا ${maxLength} کاراکتر باشد` 
    }
  }
  
  return { isValid: true, message: '' }
}

/**
 * Comment content validation
 */
export const validateCommentContent = (content) => {
  if (!content) return { isValid: false, message: 'محتوای نظر الزامی است' }
  
  const minLength = 1
  const maxLength = 500
  
  if (content.length < minLength || content.length > maxLength) {
    return { 
      isValid: false, 
      message: `محتوای نظر باید بین ${minLength} تا ${maxLength} کاراکتر باشد` 
    }
  }
  
  return { isValid: true, message: '' }
}

/**
 * File validation
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    required = false
  } = options
  
  if (!file) {
    return { 
      isValid: !required, 
      message: required ? 'انتخاب فایل الزامی است' : '' 
    }
  }
  
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024))
    return { 
      isValid: false, 
      message: `حجم فایل نباید بیش از ${maxSizeMB} مگابایت باشد` 
    }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      message: 'نوع فایل پشتیبانی نمی‌شود' 
    }
  }
  
  return { isValid: true, message: '' }
}

/**
 * Form validation helper
 */
export const validateForm = (formData, validationRules) => {
  const errors = {}
  let isValid = true
  
  for (const [field, rules] of Object.entries(validationRules)) {
    const value = formData[field]
    
    for (const rule of rules) {
      const validation = rule(value)
      if (!validation.isValid) {
        errors[field] = validation.message
        isValid = false
        break // Stop at first error for this field
      }
    }
  }
  
  return { isValid, errors }
}

/**
 * Real-time field validation helper
 */
export const validateField = (value, validationRules) => {
  for (const rule of validationRules) {
    const validation = rule(value)
    if (!validation.isValid) {
      return validation
    }
  }
  
  return { isValid: true, message: '' }
}

// Export all validation functions
export default {
  validateEmail,
  validatePassword,
  validateUsername,
  validateFullName,
  validateVibrationValue,
  validatePostContent,
  validateCommentContent,
  validateFile,
  validateForm,
  validateField
}