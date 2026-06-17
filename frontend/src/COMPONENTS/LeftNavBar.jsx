import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, UploadCloud, BookOpen, Library, School,
  Users, UserCheck, Table2, Brain, LogOut, ChevronLeft, ChevronRight,
  GraduationCap, Sparkles
} from 'lucide-react'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', gradient: 'from-cyan-400 to-blue-500', color: '#0ea5e9' },
  { path: '/upload-data-excel', icon: UploadCloud, label: 'Upload Data', gradient: 'from-emerald-400 to-teal-500', color: '#10b981' },
  { path: '/academic-year', icon: BookOpen, label: 'Academics', gradient: 'from-violet-400 to-purple-500', color: '#8b5cf6' },
  { path: '/courses', icon: Library, label: 'Courses/Trades', gradient: 'from-pink-400 to-rose-500', color: '#ec4899' },
  { path: '/classes', icon: School, label: 'Classes', gradient: 'from-amber-400 to-orange-500', color: '#f59e0b' },
  { path: '/students', icon: Users, label: 'Students', gradient: 'from-blue-400 to-indigo-500', color: '#6366f1' },
  { path: '/attendance', icon: UserCheck, label: 'Attendance', gradient: 'from-teal-400 to-cyan-500', color: '#14b8a6' },
  { path: '/marks-sheet', icon: Table2, label: 'Marks Sheet', gradient: 'from-orange-400 to-red-500', color: '#f97316' },
  { path: '/ai-dashboard', icon: Brain, label: 'AI Analytics', gradient: 'from-fuchsia-400 to-pink-500', color: '#d946ef', ai: true },
]

function LeftNavBar({ user, onLogout }) {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [activePath, setActivePath] = useState(location.pathname)

  useEffect(() => { setActivePath(location.pathname) }, [location])

  const isActive = (path) => path === '/' ? activePath === '/' : activePath.startsWith(path)

  return (
    <div className="relative z-20 flex flex-col h-full transition-all duration-300"
      style={{
        width: collapsed ? '72px' : '230px',
        background: 'rgba(7, 11, 21, 0.95)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}>

      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 h-16 shrink-0 border-b ${collapsed ? 'justify-center px-0' : ''}`}
        style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(99,102,241,0.15))', border: '1px solid rgba(14,165,233,0.15)' }}>
          <GraduationCap className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-white tracking-tight">SMS</h1>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>AI-Powered</p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${collapsed ? 'justify-center px-2' : ''}`}
              style={{
                background: active ? `linear-gradient(135deg, ${item.color}12, ${item.color}06)` : 'transparent',
                border: active ? `1px solid ${item.color}20` : '1px solid transparent',
              }}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${active ? '' : 'group-hover:scale-105'}`}
                style={{ background: active ? `linear-gradient(135deg, ${item.color}, ${item.color}cc)` : 'rgba(255,255,255,0.04)' }}>
                <Icon className="w-4 h-4" style={{ color: active ? 'white' : 'var(--text-muted)' }} />
              </div>
              {!collapsed && (
                <span className="text-xs font-medium truncate" style={{ color: active ? 'white' : 'var(--text-secondary)' }}>
                  {item.label}
                  {item.ai && <span className="ml-1.5 text-[9px] px-1 py-0.5 rounded" style={{ background: 'rgba(217,70,239,0.15)', color: '#d946ef' }}>AI</span>}
                </span>
              )}
              {active && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: `linear-gradient(180deg, ${item.color}, ${item.color}66)`, boxShadow: `0 0 8px ${item.color}44` }} />
              )}
            </Link>
          )
        })}
      </div>

      {/* Bottom */}
      <div className="px-2.5 pb-3 space-y-2 border-t shrink-0" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
        <div className={`flex gap-1 ${collapsed ? 'flex-col' : ''}`}>
          <button onClick={() => setCollapsed(!collapsed)}
            className="flex-1 p-2 rounded-lg transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            {collapsed ? <ChevronRight className="w-4 h-4 mx-auto" /> : <ChevronLeft className="w-4 h-4 mx-auto" />}
          </button>
          <button onClick={onLogout}
            className="flex-1 p-2 rounded-lg transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}>
            <LogOut className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default LeftNavBar
