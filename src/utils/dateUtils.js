import { format, parseISO, addDays, subDays, startOfWeek, endOfWeek } from 'date-fns'
import { faIR } from 'date-fns/locale'

/**
 * Format date to Persian
 */
export const formatPersianDate = (date, formatStr = 'yyyy/MM/dd') => {
  if (!date) return '--'
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatStr, { locale: faIR })
  } catch (error) {
    console.error('Date formatting error:', error)
    return '--'
  }
}

/**
 * Format date time to Persian
 */
export const formatPersianDateTime = (date) => {
  return formatPersianDate(date, 'yyyy/MM/dd - HH:mm')
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayString = () => {
  return format(new Date(), 'yyyy-MM-dd')
}

/**
 * Get week range
 */
export const getWeekRange = (date = new Date()) => {
  return {
    start: startOfWeek(date, { weekStartsOn: 6 }), // Saturday
    end: endOfWeek(date, { weekStartsOn: 6 })
  }
}

/**
 * Add days to date
 */
export const addDaysToDate = (date, days) => {
  return addDays(date, days)
}

/**
 * Subtract days from date
 */
export const subtractDaysFromDate = (date, days) => {
  return subDays(date, days)
}

/**
 * Check if date is today
 */
export const isToday = (date) => {
  const today = new Date()
  const checkDate = typeof date === 'string' ? parseISO(date) : date
  
  return format(today, 'yyyy-MM-dd') === format(checkDate, 'yyyy-MM-dd')
}

/**
 * Get relative time in Persian
 */
export const getRelativeTimePersian = (date) => {
  if (!date) return '--'
  
  try {
    const now = new Date()
    const targetDate = typeof date === 'string' ? parseISO(date) : date
    const diffInMinutes = Math.floor((now - targetDate) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'همین الان'
    if (diffInMinutes < 60) return `${diffInMinutes} دقیقه پیش`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} ساعت پیش`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} روز پیش`
    
    return formatPersianDate(targetDate)
  } catch (error) {
    console.error('Relative time error:', error)
    return '--'
  }
}

export default {
  formatPersianDate,
  formatPersianDateTime,
  getTodayString,
  getWeekRange,
  addDaysToDate,
  subtractDaysFromDate,
  isToday,
  getRelativeTimePersian
}