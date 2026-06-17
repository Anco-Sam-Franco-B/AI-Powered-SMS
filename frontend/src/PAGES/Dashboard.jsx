import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, BookOpen, School, TrendingUp, AlertTriangle, Brain, ArrowRight, GraduationCap, Sparkles, BarChart3, Activity } from 'lucide-react'
import useAcademicStore from '../STORES/AcademicStore'
import useDataStore from '../STORES/DataStore'
import useAIStore from '../STORES/AIStore'

const statCards = [
  { key: 'students', icon: Users, label: 'Total Students', gradient: 'from-[#0ea5e9] to-[#6366f1]', link: '/students', color: '#0ea5e9' },
  { key: 'classes', icon: School, label: 'Active Classes', gradient: 'from-[#f59e0b] to-[#f97316]', link: '/classes', color: '#f59e0b' },
  { key: 'courses', icon: BookOpen, label: 'Courses/Trades', gradient: 'from-[#8b5cf6] to-[#d946ef]', link: '/courses', color: '#8b5cf6' },
  { key: 'attendance', icon: Activity, label: 'Attendance Rate', gradient: 'from-[#10b981] to-[#06b6d4]', link: '/attendance', pct: true, color: '#10b981' },
]

function Dashboard() {
  const { students, classes, courses, currentYear, currentTerm, loading } = useAcademicStore()
  const { marks, attendance } = useDataStore()
  const { fetchAnalytics, analytics } = useAIStore()
  const [stats, setStats] = useState({ students: 0, classes: 0, courses: 0, attendance: 0 })

  useEffect(() => {
    useAcademicStore.getState().fetchCurrentAcademicInfo()
    useAcademicStore.getState().fetchStudents()
    useAcademicStore.getState().fetchClasses()
    useAcademicStore.getState().fetchCourses()
    useDataStore.getState().fetchAttendance()
    useDataStore.getState().fetchMarks()
    fetchAnalytics()
  }, [])

  useEffect(() => {
    const attRate = attendance.length > 0
      ? Math.round((attendance.filter(a => a.status === 'present' || a.status === 'Present').length / attendance.length) * 100)
      : 0
    setStats({ students: students.length, classes: classes.length, courses: courses.length, attendance: attRate })
  }, [students, classes, courses, attendance])

  const atRisk = analytics?.at_risk_count || analytics?.risk_analysis?.length || 0
  const avgPerformance = analytics?.average_performance || analytics?.avg_score || '—'

  const quickActions = [
    { to: '/upload-data-excel', label: 'Upload Data', icon: Sparkles, desc: 'Import Excel files' },
    { to: '/students', label: 'Add Student', icon: Users, desc: 'New enrollment' },
    { to: '/attendance', label: 'Mark Attendance', icon: Activity, desc: "Today's roll call" },
    { to: '/marks-sheet', label: 'Record Marks', icon: BarChart3, desc: 'Exam scores' },
    { to: '/ai-dashboard', label: 'AI Analytics', icon: Brain, desc: 'Predictions & insights' },
  ]

  if (loading.students && !students.length) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-5">
          {[1,2,3,4].map(i => <div key={i} className="h-32 skeleton-glass" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between animate-fadeInUp">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
            <span className="glass-badge glass-badge-cyan text-[10px]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-breathe mr-0.5" />
              Live
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Real-time overview across your institution</p>
        </div>
        <Link to="/ai-dashboard" className="glass-btn glass-btn-primary text-xs px-4 py-2">
          <Brain className="w-3.5 h-3.5" /> AI Insights
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-5">
        {statCards.map((card, i) => {
          const Icon = card.icon
          const val = stats[card.key]
          return (
            <Link key={card.key} to={card.link}
              className="stat-card glass-card p-5 animate-fadeInUp group"
              style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {card.label}
                  </p>
                  <p className="dashboard-stat-value text-white mt-1.5">
                    {card.pct ? `${val}%` : val}
                  </p>
                </div>
                <div className="stat-icon w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `linear-gradient(135deg, ${card.color}15, ${card.color}08)`, border: `1px solid ${card.color}20` }}>
                  <Icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
              </div>
              <div className="stat-progress">
                <div className="stat-progress-bar" style={{ width: `${card.pct ? val : Math.min(val * 8, 100)}%`, background: `linear-gradient(90deg, ${card.color}, ${card.color}cc)` }} />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Main Grid: AI Insights + Quick Actions */}
      <div className="grid grid-cols-5 gap-5">
        {/* AI Insights — spans 3 */}
        <div className="glass-card p-6 col-span-3 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(99,102,241,0.1))', border: '1px solid rgba(14,165,233,0.15)' }}>
                <Brain className="w-4.5 h-4.5" style={{ color: 'var(--accent-blue)' }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">AI Insights</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Machine learning analysis</p>
              </div>
            </div>
            <Link to="/ai-dashboard" className="text-xs font-medium flex items-center gap-1 transition-colors" style={{ color: 'var(--accent-blue)' }}>
              Full dashboard <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="rounded-xl p-4" style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.1)' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent-emerald)' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Avg Performance</span>
              </div>
              <p className="text-2xl font-bold text-white">{avgPerformance}</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.1)' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle className="w-4 h-4" style={{ color: 'var(--accent-amber)' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>At-Risk Students</span>
              </div>
              <p className="text-2xl font-bold text-white">{atRisk || 0}</p>
            </div>
          </div>

          {analytics?.top_performers?.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}>
              <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Top Performers</p>
              <div className="space-y-2">
                {analytics.top_performers.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                        {i + 1}
                      </span>
                      <span className="text-sm text-white">{s.name || s.student_name || `Student #${s.student_id}`}</span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--accent-emerald)' }}>{s.avg_score || s.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!analytics?.top_performers?.length && (
            <div className="empty-state py-6">
              <div className="empty-state-icon">
                <BarChart3 className="w-5 h-5" />
              </div>
              <p className="empty-state-title">No data yet</p>
              <p className="empty-state-desc">Upload student data and train AI models to see insights</p>
              <Link to="/upload-data-excel" className="glass-btn glass-btn-primary text-xs mt-4 px-4 py-2">
                Upload Data
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions — spans 2 */}
        <div className="glass-card p-6 col-span-2 animate-fadeInUp" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.1))', border: '1px solid rgba(245,158,11,0.15)' }}>
              <Sparkles className="w-4.5 h-4.5" style={{ color: 'var(--accent-amber)' }} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Quick Actions</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Common tasks</p>
            </div>
          </div>

          <div className="space-y-1.5">
            {quickActions.map((action, i) => {
              const Icon = action.icon
              return (
                <Link key={action.to} to={action.to}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all group"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'var(--glass-border-strong)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'transparent' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <Icon className="w-4 h-4" style={{ color: i === 0 ? 'var(--accent-emerald)' : i === 1 ? 'var(--accent-blue)' : i === 2 ? 'var(--accent-amber)' : i === 3 ? 'var(--accent-violet)' : 'var(--accent-indigo)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{action.label}</p>
                    <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>{action.desc}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5" style={{ color: 'var(--text-subtle)' }} />
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="glass-card p-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.15)' }}>
              <Activity className="w-4.5 h-4.5" style={{ color: 'var(--accent-indigo)' }} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">System Overview</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Current data summary</p>
            </div>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="empty-state py-8">
            <div className="empty-state-icon w-12 h-12 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <p className="empty-state-title">Your institution is empty</p>
            <p className="empty-state-desc">Start by uploading student records or adding data manually</p>
            <Link to="/upload-data-excel" className="glass-btn glass-btn-primary text-xs mt-4 px-5 py-2.5">
              <Sparkles className="w-3.5 h-3.5" /> Get Started
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Students', value: students.length, color: 'var(--accent-blue)' },
              { label: 'Classes', value: classes.length, color: 'var(--accent-amber)' },
              { label: 'Courses', value: courses.length, color: 'var(--accent-violet)' },
              { label: 'Attendance Records', value: attendance.length, color: 'var(--accent-emerald)' },
            ].map((item, i) => (
              <div key={i} className="rounded-xl p-4 text-center"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}>
                <p className="text-2xl font-bold text-white mb-1">{item.value}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
