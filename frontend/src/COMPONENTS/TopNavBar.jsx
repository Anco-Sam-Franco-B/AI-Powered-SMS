import { useState } from 'react'
import { Search, Bell, Command } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import useAIStore from '../STORES/AIStore'

const pageTitles = {
  '/': 'Dashboard',
  '/upload-data-excel': 'Upload Data',
  '/academic-year': 'Academic Management',
  '/courses': 'Courses & Trades',
  '/classes': 'Class Management',
  '/students': 'Student Records',
  '/attendance': 'Attendance Tracker',
  '/marks-sheet': 'Marks Sheet',
  '/ai-dashboard': 'AI Analytics Hub',
}

function TopNavBar({ user }) {
  const location = useLocation()
  const [query, setQuery] = useState('')
  const { chatQuery } = useAIStore()

  const title = Object.entries(pageTitles).find(([p]) => location.pathname.startsWith(p))?.[1] || 'Student Management'

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && query.trim()) {
      await chatQuery(query.trim())
      setQuery('')
    }
  }

  return (
    <div className="relative z-10 px-6 h-16 flex items-center justify-between shrink-0"
      style={{
        background: 'rgba(11, 17, 32, 0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>
        <span className="glass-badge glass-badge-cyan text-[9px] px-2 py-0.5">v1.0</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors" style={{ color: 'var(--text-subtle)' }}
            onTransitionEnd={undefined} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search students, courses..."
            className="w-72 pl-9 pr-10 py-2 rounded-xl text-xs outline-none transition-all duration-300"
            style={{
              background: 'rgba(255,255,255,0.035)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(14,165,233,0.25)'
              e.target.style.background = 'rgba(14,165,233,0.04)'
              e.target.style.boxShadow = '0 0 20px rgba(14,165,233,0.06)'
              e.target.previousElementSibling.style.color = 'var(--accent-blue)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.06)'
              e.target.style.background = 'rgba(255,255,255,0.035)'
              e.target.style.boxShadow = 'none'
              e.target.previousElementSibling.style.color = 'var(--text-subtle)'
            }} />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium px-1.5 py-0.5 rounded-md pointer-events-none"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'var(--text-subtle)',
            }}>
            <Command className="w-2.5 h-2.5 inline mr-0.5" />K
          </kbd>
        </div>
      </div>
    </div>
  )
}

export default TopNavBar
