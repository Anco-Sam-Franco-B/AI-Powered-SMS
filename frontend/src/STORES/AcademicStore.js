import { create } from 'zustand'
import axios from 'axios'

const API = axios.create({ baseURL: 'http://localhost:5000/api/v1' })

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const extractData = (res) => res.data?.data ?? res.data ?? []

const useAcademicStore = create((set, get) => ({
  academicYears: [],
  terms: [],
  classes: [],
  courses: [],
  students: [],
  currentYear: null,
  currentTerm: null,
  currentTerms: [],
  loading: { years: false, terms: false, classes: false, courses: false, students: false },

  fetchAcademicYears: async () => {
    set((s) => ({ loading: { ...s.loading, years: true } }))
    try { const res = await API.get('/data/academic-years'); set({ academicYears: extractData(res) }) }
    catch (e) { console.error('Fetch academic years error:', e) }
    finally { set((s) => ({ loading: { ...s.loading, years: false } })) }
  },
  createAcademicYear: async (payload) => {
    const { data } = await API.post('/data/academic-years', payload)
    await get().fetchAcademicYears()
    return data
  },
  updateAcademicYear: async (id, payload) => {
    const { data } = await API.put(`/data/academic-years/${id}`, payload)
    await get().fetchAcademicYears()
    return data
  },
  deleteAcademicYear: async (id) => {
    await API.delete(`/data/academic-years/${id}`)
    await get().fetchAcademicYears()
  },

  fetchTerms: async () => {
    set((s) => ({ loading: { ...s.loading, terms: true } }))
    try { const res = await API.get('/data/academic-terms'); set({ terms: extractData(res) }) }
    catch (e) { console.error('Fetch terms error:', e) }
    finally { set((s) => ({ loading: { ...s.loading, terms: false } })) }
  },
  createTerm: async (payload) => {
    const { data } = await API.post('/data/academic-terms', payload)
    await get().fetchTerms()
    return data
  },
  updateTerm: async (id, payload) => {
    const { data } = await API.put(`/data/academic-terms/${id}`, payload)
    await get().fetchTerms()
    return data
  },
  setCurrentTerm: async (id) => {
    const { data } = await API.put(`/data/academic-terms/${id}`, { is_current: true })
    await get().fetchTerms()
    return data
  },

  fetchClasses: async () => {
    set((s) => ({ loading: { ...s.loading, classes: true } }))
    try { const res = await API.get('/data/classes'); set({ classes: extractData(res) }) }
    catch (e) { console.error('Fetch classes error:', e) }
    finally { set((s) => ({ loading: { ...s.loading, classes: false } })) }
  },
  createClass: async (payload) => {
    const { data } = await API.post('/data/classes', payload)
    await get().fetchClasses()
    return data
  },
  updateClass: async (id, payload) => {
    const { data } = await API.put(`/data/classes/${id}`, payload)
    await get().fetchClasses()
    return data
  },
  deleteClass: async (id) => {
    await API.delete(`/data/classes/${id}`)
    await get().fetchClasses()
  },

  fetchCourses: async () => {
    set((s) => ({ loading: { ...s.loading, courses: true } }))
    try { const res = await API.get('/data/courses'); set({ courses: extractData(res) }) }
    catch (e) { console.error('Fetch courses error:', e) }
    finally { set((s) => ({ loading: { ...s.loading, courses: false } })) }
  },
  createCourse: async (payload) => {
    const { data } = await API.post('/data/courses', payload)
    await get().fetchCourses()
    return data
  },
  updateCourse: async (id, payload) => {
    const { data } = await API.put(`/data/courses/${id}`, payload)
    await get().fetchCourses()
    return data
  },
  deleteCourse: async (id) => {
    await API.delete(`/data/courses/${id}`)
    await get().fetchCourses()
  },

  fetchCurrentAcademicInfo: async () => {
    try {
      const res = await API.get('/data/current-academic-info')
      const d = res.data?.data ?? res.data ?? {}
      set({ currentYear: d.year || null, currentTerm: d.term || null, currentTerms: d.terms || [] })
      return d
    } catch (e) { console.error('Fetch current academic info error:', e) }
  },

  fetchStudents: async () => {
    set((s) => ({ loading: { ...s.loading, students: true } }))
    try { const res = await API.get('/data/students'); set({ students: extractData(res) }) }
    catch (e) { console.error('Fetch students error:', e) }
    finally { set((s) => ({ loading: { ...s.loading, students: false } })) }
  },
  createStudent: async (payload) => {
    const { data } = await API.post('/data/students', payload)
    await get().fetchStudents()
    return data
  },
  updateStudent: async (id, payload) => {
    const { data } = await API.put(`/data/students/${id}`, payload)
    await get().fetchStudents()
    return data
  },
  deleteStudent: async (id) => {
    await API.delete(`/data/students/${id}`)
    await get().fetchStudents()
  },
}))

export default useAcademicStore
