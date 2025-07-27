import { supabase, DB_TABLES, handleSupabaseError } from './supabaseClient'
import { getCurrentDate } from '@/utils/helpers'
import { APP_CONFIG } from '@/utils/constants'

class VibrationService {
  constructor() {
    this.cache = new Map()
    this.cacheExpiry = 5 * 60 * 1000 // 5 minutes
  }

  // Save vibration data
  async saveVibrationData(data) {
    try {
      const { error } = await supabase
        .from(DB_TABLES.VIBRATION_DATA)
        .upsert({
          ...data,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'unit,equipment,date'
        })

      if (error) throw error
      
      // Clear cache for this unit and date
      this.clearCacheForUnitDate(data.unit, data.date)
      
      return true
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Get vibration data with filters
  async getVibrationData(filters = {}) {
    try {
      const cacheKey = JSON.stringify(filters)
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached

      let query = supabase
        .from(DB_TABLES.VIBRATION_DATA)
        .select(`
          *,
          profiles (
            username,
            full_name
          )
        `)

      // Apply filters
      if (filters.unit) {
        query = query.eq('unit', filters.unit)
      }
      
      if (filters.equipment) {
        query = query.eq('equipment', filters.equipment)
      }
      
      if (filters.date) {
        query = query.eq('date', filters.date)
      }
      
      if (filters.dateFrom && filters.dateTo) {
        query = query.gte('date', filters.dateFrom).lte('date', filters.dateTo)
      } else if (filters.dateFrom) {
        query = query.gte('date', filters.dateFrom)
      } else if (filters.dateTo) {
        query = query.lte('date', filters.dateTo)
      }

      // Sorting
      query = query.order('date', { ascending: false })
      query = query.order('created_at', { ascending: false })

      // Limit
      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error

      // Cache the result
      this.setCache(cacheKey, data)

      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Get today's data for a specific unit
  async getTodayData(unit) {
    const today = getCurrentDate()
    return this.getVibrationData({ unit, date: today })
  }

  // Get data for specific unit and equipment
  async getEquipmentData(unit, equipment, dateFrom = null, dateTo = null) {
    const filters = { unit, equipment }
    
    if (dateFrom) filters.dateFrom = dateFrom
    if (dateTo) filters.dateTo = dateTo

    return this.getVibrationData(filters)
  }

  // Get statistics for a unit
  async getUnitStatistics(unit) {
    try {
      const { data, error } = await supabase
        .from(DB_TABLES.VIBRATION_DATA)
        .select('*')
        .eq('unit', unit)

      if (error) throw error

      const stats = {
        totalRecords: data.length,
        totalDays: [...new Set(data.map(d => d.date))].length,
        equipmentCount: [...new Set(data.map(d => d.equipment))].length,
        lastUpdate: data.length > 0 ? Math.max(...data.map(d => new Date(d.created_at))) : null,
        dataSize: JSON.stringify(data).length
      }

      return stats
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Find anomalies (abnormal increases)
  async findAnomalies(threshold = 20, timeRange = 7, comparisonDays = 1) {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - timeRange)

      const { data, error } = await supabase
        .from(DB_TABLES.VIBRATION_DATA)
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (error) throw error

      const anomalies = []
      
      // Group data by unit and equipment
      const groupedData = {}
      data.forEach(item => {
        const key = `${item.unit}_${item.equipment}`
        if (!groupedData[key]) {
          groupedData[key] = []
        }
        groupedData[key].push(item)
      })

      // Check for anomalies
      Object.entries(groupedData).forEach(([key, records]) => {
        if (records.length < 2) return

        const [unit, equipment] = key.split('_')
        const sortedRecords = records.sort((a, b) => new Date(a.date) - new Date(b.date))
        
        for (let i = comparisonDays; i < sortedRecords.length; i++) {
          const currentRecord = sortedRecords[i]
          const previousRecord = sortedRecords[i - comparisonDays]
          
          APP_CONFIG.parameters.forEach(parameter => {
            const currentValue = currentRecord.parameters[parameter.id]
            const previousValue = previousRecord.parameters[parameter.id]
            
            if (currentValue && previousValue && previousValue > 0) {
              const increasePercentage = ((currentValue - previousValue) / previousValue) * 100
              
              if (increasePercentage >= threshold) {
                anomalies.push({
                  unit,
                  equipment,
                  parameter: parameter.id,
                  parameterName: parameter.name,
                  currentValue,
                  previousValue,
                  increasePercentage: Math.round(increasePercentage * 100) / 100,
                  increaseAmount: Math.round((currentValue - previousValue) * 100) / 100,
                  date: currentRecord.date,
                  previousDate: previousRecord.date
                })
              }
            }
          })
        }
      })

      return anomalies.sort((a, b) => b.increasePercentage - a.increasePercentage)
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Export data to CSV format
  async exportDataToCSV(filters = {}) {
    try {
      const data = await this.getVibrationData(filters)
      
      const headers = ['واحد', 'تجهیز', 'تاریخ', 'زمان', 'کاربر', 'یادداشت']
      APP_CONFIG.parameters.forEach(param => {
        headers.push(param.name)
      })

      const rows = [headers]
      
      data.forEach(item => {
        const equipmentInfo = APP_CONFIG.equipments.find(e => e.id === item.equipment)
        const row = [
          item.unit,
          equipmentInfo?.name || item.equipment,
          item.date,
          new Date(item.created_at).toLocaleTimeString('fa-IR'),
          item.profiles?.full_name || item.profiles?.username || 'نامشخص',
          item.notes || ''
        ]
        
        APP_CONFIG.parameters.forEach(param => {
          row.push(item.parameters[param.id] || '')
        })
        
        rows.push(row)
      })

      // Convert to CSV string
      const csvContent = rows.map(row => 
        row.map(cell => {
          const cellStr = String(cell)
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`
          }
          return cellStr
        }).join(',')
      ).join('\n')

      return '\uFEFF' + csvContent // Add BOM for UTF-8
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // Get equipment master data
  async getEquipmentMaster() {
    try {
      const { data, error } = await supabase
        .from(DB_TABLES.EQUIPMENT_MASTER)
        .select('*')
        .order('equipment_code')

      if (error) throw error
      return data || APP_CONFIG.equipments
    } catch (error) {
      console.error('Error getting equipment master:', error)
      return APP_CONFIG.equipments
    }
  }

  // Cache management
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  getFromCache(key) {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() - cached.timestamp > this.cacheExpiry) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  clearCache() {
    this.cache.clear()
  }

  clearCacheForUnitDate(unit, date) {
    const keysToDelete = []
    this.cache.forEach((value, key) => {
      if (key.includes(unit) && key.includes(date)) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  // Real-time subscriptions
  subscribeToVibrationData(callback) {
    return supabase
      .channel('vibration_data_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: DB_TABLES.VIBRATION_DATA
        },
        (payload) => {
          this.clearCache() // Clear cache on any change
          callback(payload)
        }
      )
      .subscribe()
  }
}

export default new VibrationService()