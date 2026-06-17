import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LeftNavBar from './COMPONENTS/LeftNavBar'
import TopNavBar from './COMPONENTS/TopNavBar'
import ChatBotWidget from './COMPONENTS/ChatBotWidget'
import LoginPage from './PAGES/LoginPage'
import Dashboard from './PAGES/Dashboard'
import AcademicYear from './PAGES/AcademicYear'
import UploadData from './PAGES/UploadData'
import Courses from './PAGES/Courses'
import Students from './PAGES/Students'
import Classes from './PAGES/Classes'
import AttendancePage from './PAGES/AttendancePage'
import MarksSheet from './PAGES/MarksSheet'
import AIDashboard from './PAGES/AIDashboard'

function AppContent({ user, setUser }) {
  return (
    <div className="w-full h-screen flex" style={{ background: 'var(--bg-base)' }}>
      <LeftNavBar user={user} onLogout={() => { setUser(null); localStorage.clear() }} />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="bg-orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        <TopNavBar user={user} />
        <div className="flex-1 overflow-y-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto space-y-6 animate-fadeInUp">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/academic-year" element={<AcademicYear />} />
              <Route path="/upload-data-excel" element={<UploadData />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/students" element={<Students />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/marks-sheet" element={<MarksSheet />} />
              <Route path="/ai-dashboard" element={<AIDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      try { setUser(JSON.parse(savedUser)) } catch { setUser(null) }
    }
    setLoading(false)
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-blue)] border-t-transparent animate-spin" />
    </div>
  )

  if (!user) return (
    <>
      <LoginPage onLogin={(u) => { setUser(u); localStorage.setItem('user', JSON.stringify(u)) }} />
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a2332', color: '#f1f5f9', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.8125rem' }}} />
    </>
  )

  return (
    <BrowserRouter>
      <AppContent user={user} setUser={setUser} />
      <ChatBotWidget />
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a2332', color: '#f1f5f9', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.8125rem' }}} />
    </BrowserRouter>
  )
}

export default App
