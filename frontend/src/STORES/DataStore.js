import { create } from 'zustand'
import axios from 'axios'

const API = axios.create({ baseURL: 'http://localhost:5000/api/v1' })

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const useDataStore = create((set, get) => ({
  // Data
  marks: [],
  attendance: [],
  messages: [],

  // Loading
  loading: { marks: false, attendance: false, messages: false },

  // Marks
  fetchMarks: async (params = {}) => {
    set((s) => ({ loading: { ...s.loading, marks: true } }))
    try {
      const { data } = await API.get('/data/marks', { params })
      set({ marks: data.data || data })
    } catch (e) { console.error('Fetch marks error:', e) }
    finally { set((s) => ({ loading: { ...s.loading, marks: false } })) }
  },
  createMark: async (payload) => {
    const { data } = await API.post('/data/marks', payload)
    await get().fetchMarks()
    return data
  },
  updateMark: async (id, payload) => {
    const { data } = await API.put(`/data/marks/${id}`, payload)
    await get().fetchMarks()
    return data
  },
  deleteMark: async (id) => {
    await API.delete(`/data/marks/${id}`)
    await get().fetchMarks()
  },
  bulkMarks: async (records) => {
    const { data } = await API.post('/data/marks/bulk', { records })
    await get().fetchMarks()
    return data
  },

  // Attendance
  fetchAttendance: async (params = {}) => {
    set((s) => ({ loading: { ...s.loading, attendance: true } }))
    try {
      const { data } = await API.get('/data/attendance', { params })
      set({ attendance: data.data || data })
    } catch (e) { console.error('Fetch attendance error:', e) }
    finally { set((s) => ({ loading: { ...s.loading, attendance: false } })) }
  },
  createAttendance: async (payload) => {
    const { data } = await API.post('/data/attendance', payload)
    await get().fetchAttendance()
    return data
  },
  updateAttendance: async (id, payload) => {
    const { data } = await API.put(`/data/attendance/${id}`, payload)
    await get().fetchAttendance()
    return data
  },
  bulkAttendance: async (records) => {
    const { data } = await API.post('/data/attendance/bulk', { records })
    await get().fetchAttendance()
    return data
  },

  // Messages
  fetchMessages: async () => {
    set((s) => ({ loading: { ...s.loading, messages: true } }))
    try {
      const { data } = await API.get('/data/messages')
      set({ messages: data.data || data })
    } catch (e) { console.error('Fetch messages error:', e) }
    finally { set((s) => ({ loading: { ...s.loading, messages: false } })) }
  },
  sendMessage: async (payload) => {
    const { data } = await API.post('/data/messages', payload)
    await get().fetchMessages()
    return data
  },

  // Upload
  uploadExcel: async (formData) => {
    const { data } = await API.post('/upload/upload-excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    // Notify AI webhook
    try { await fetch('http://localhost:5000/api/v1/webhook/data-upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: 'excel-upload', timestamp: new Date().toISOString() }) }) } catch {}
    return data
  },
}))

export default useDataStore
