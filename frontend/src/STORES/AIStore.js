import { create } from 'zustand'
import axios from 'axios'

const AI_API = axios.create({ baseURL: 'http://localhost:8000/api/v1' })

AI_API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const useAIStore = create((set, get) => ({
  predictions: [],
  predictionLoading: false,

  // Analytics
  analytics: null,
  analyticsLoading: false,

  // Reports
  reportUrl: null,
  reportLoading: false,

  // Models
  models: [],
  modelsLoading: false,

  // Chat
  chatMessages: [
    { role: 'assistant', content: 'Hello! I\'m your AI assistant. I can help you with student queries, analytics, and insights. Try asking me about your data!' }
  ],
  chatLoading: false,
  chatError: null,

  // Status
  aiStatus: null,

  // Prediction
  predictStudent: async (studentData) => {
    set({ predictionLoading: true })
    try {
      const { data } = await AI_API.post('/predictions/student-performance', studentData)
      set({ predictions: [data] })
      return data
    } catch (e) { console.error('Predict student error:', e); return null }
    finally { set({ predictionLoading: false }) }
  },

  batchPredict: async (payload) => {
    set({ predictionLoading: true })
    try {
      const { data } = await AI_API.post('/predictions/batch', payload)
      set({ predictions: data.predictions || [] })
      return data
    } catch (e) { console.error('Batch predict error:', e); set({ predictions: [] }); return null }
    finally { set({ predictionLoading: false }) }
  },

  // Analytics
  fetchAnalytics: async () => {
    set({ analyticsLoading: true })
    try {
      const { data } = await AI_API.get('/analytics/at-risk-students')
      set({ analytics: data.data || data })
    } catch (e) { console.error('Fetch analytics error:', e); set({ analytics: null }) }
    finally { set({ analyticsLoading: false }) }
  },

  // Reports
  generateReport: async ({ type = 'summary', format = 'xlsx' } = {}) => {
    set({ reportLoading: true, reportUrl: null })
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:5000/api/v1/reports/generate?type=${type}&format=${format}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Report generation failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      set({ reportUrl: url })
      const a = document.createElement('a')
      a.href = url
      const disposition = res.headers.get('Content-Disposition')
      const match = disposition && disposition.match(/filename="?(.+?)"?$/)
      a.download = match ? match[1] : `report-${type}-${new Date().toISOString().slice(0,10)}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 10000)
      return url
    } catch (e) { console.error('Generate report error:', e); throw e }
    finally { set({ reportLoading: false }) }
  },

  // Models
  fetchModels: async () => {
    set({ modelsLoading: true })
    try {
      const { data } = await AI_API.get('/training/models')
      set({ models: data.data || data.models || [] })
    } catch (e) { console.error('Fetch models error:', e); set({ models: [] }) }
    finally { set({ modelsLoading: false }) }
  },

  triggerTraining: async (modelType = 'all') => {
    try {
      const { data } = await AI_API.post('/training/trigger', { model_type: modelType })
      return data
    } catch (e) { console.error('Training trigger error:', e); return null }
  },

  // Chat
  chatQuery: async (message) => {
    const msg = { role: 'user', content: message }
    set((s) => ({ chatMessages: [...s.chatMessages, msg], chatLoading: true, chatError: null }))
    try {
      const { data } = await AI_API.post('/chatbot/query', { query: message })
      const reply = data.answer || data.response || data.message || 'I could not process that request.'
      set((s) => ({ chatMessages: [...s.chatMessages, { role: 'assistant', content: reply }], chatLoading: false }))
      return reply
    } catch (e) {
      const fallback = `I'm here to help with student data! Try asking about attendance trends, at-risk students, or performance insights. (AI service: ${e.message})`
      set((s) => ({ chatMessages: [...s.chatMessages, { role: 'assistant', content: fallback }], chatLoading: false, chatError: e.message }))
      return fallback
    }
  },

  // Status
  checkAIStatus: async () => {
    try {
      const { data } = await AI_API.get('/monitoring/health')
      set({ aiStatus: data })
      return data
    } catch { set({ aiStatus: null }); return null }
  },

  // Risk
  fetchRiskAnalysis: async (threshold = 0.5) => {
    try {
      const { data } = await AI_API.get('/analytics/at-risk-students', { params: { threshold } })
      return data.data || data
    } catch { return [] }
  },

  fetchPromotionRecommendations: async (studentId) => {
    try {
      if (studentId) {
        const { data } = await AI_API.post('/promotions/recommend', { student_id: studentId })
        return data
      }
      const { data } = await AI_API.post('/promotions/recommend-batch')
      return data.data || data.recommendations || []
    } catch { return [] }
  },

  // Attendance forecast
  fetchAttendanceForecast: async (params = {}) => {
    try {
      const { data } = await AI_API.post('/analytics/attendance', params)
      return data
    } catch { return [] }
  },
}))

export default useAIStore
