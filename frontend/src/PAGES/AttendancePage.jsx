import { useEffect, useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { Save, Users, Award, CheckCircle2, XCircle, AlertCircle, ChevronRight, ClipboardCheck, Clock, UserCheck, Calendar } from 'lucide-react'
import useDataStore from '../STORES/DataStore'
import useAcademicStore from '../STORES/AcademicStore'

function AttendancePage() {
  const { attendance, fetchAttendance, bulkAttendance, loading } = useDataStore()
  const { students, courses, classes, currentYear, currentTerm, fetchStudents, fetchCourses, fetchClasses, fetchCurrentAcademicInfo } = useAcademicStore()

  const [classId, setClassId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [attDate, setAttDate] = useState(new Date().toISOString().slice(0, 10))
  const [attEntries, setAttEntries] = useState({})
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState('select')

  useEffect(() => { fetchCurrentAcademicInfo(); fetchAttendance(); fetchStudents(); fetchClasses(); fetchCourses() }, [])

  const classStudents = useMemo(() => {
    if (!classId) return []
    return students.filter(s => String(s.class_id) === String(classId))
  }, [classId, students])

  const todayAttendance = useMemo(() => {
    return attendance.filter(a => {
      const ad = (a.class_date || a.date || '').slice(0, 10)
      return ad === attDate && String(a.class_id) === String(classId)
    })
  }, [attendance, attDate, classId])

  const handleStatusChange = (studentId, status) => {
    setAttEntries(prev => ({ ...prev, [String(studentId)]: status }))
  }

  const handleLoadSheet = () => {
    if (!classId) return toast.error('Please select a class')
    if (!attDate) return toast.error('Please select a date')
    // Pre-fill existing attendance
    const entries = {}
    classStudents.forEach(s => {
      const sid = String(s.id || s.student_id)
      const existing = todayAttendance.find(a => String(a.student_id) === sid)
      entries[sid] = existing ? existing.status : ''
    })
    setAttEntries(entries)
    setStep('enter')
    toast.success(`Loaded ${classStudents.length} students`)
  }

  const handleSaveAll = async () => {
    const records = []
    for (const studentId of Object.keys(attEntries)) {
      const status = attEntries[studentId]
      if (!status) continue
      records.push({
        student_id: Number(studentId),
        course_id: courseId ? Number(courseId) : null,
        class_id: Number(classId),
        date: attDate,
        status,
      })
    }
    if (records.length === 0) return toast.error('No attendance marked')

    setSaving(true)
    try {
      const result = await bulkAttendance(records)
      toast.success(`${result.count || records.length} attendance records saved!`)
      setStep('review')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance')
    } finally {
      setSaving(false)
    }
  }

  const filledCount = Object.values(attEntries).filter(v => v !== '' && v !== undefined && v !== null).length
  const presentCount = Object.values(attEntries).filter(v => v === 'present').length
  const absentCount = Object.values(attEntries).filter(v => v === 'absent').length
  const lateCount = Object.values(attEntries).filter(v => v === 'late').length
  const excusedCount = Object.values(attEntries).filter(v => v === 'excused').length

  const selectedClass = classes.find(c => String(c.id || c.class_id) === String(classId))
  const selectedCourse = courses.find(c => String(c.id || c.course_id) === String(courseId))

  const statusBadge = (status) => {
    if (!status) return null
    const s = status.toLowerCase()
    const colors = { present: 'glass-badge-green', absent: 'glass-badge-red', late: 'glass-badge-amber', excused: 'glass-badge-cyan' }
    const icons = { present: CheckCircle2, absent: XCircle, late: Clock, excused: UserCheck }
    const Icon = icons[s] || CheckCircle2
    return <span className={`glass-badge text-[10px] ${colors[s] || 'glass-badge-cyan'}`}><Icon className="w-3 h-3" /> {status}</span>
  }

  const statusBtns = [
    { value: 'present', label: 'Present', icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.2)' },
    { value: 'absent', label: 'Absent', icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.2)' },
    { value: 'late', label: 'Late', icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.2)' },
    { value: 'excused', label: 'Excused', icon: UserCheck, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.2)' },
  ]

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between animate-fadeInUp">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
            <ClipboardCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="section-title">Attendance Sheet</h1>
            <p className="section-sub">
              {step === 'select' ? 'Select class and date to begin'
                : step === 'enter' ? `${filledCount} of ${classStudents.length} marked (${presentCount} present)`
                  : 'Saved successfully'}
            </p>
          </div>
        </div>
        {step === 'enter' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span style={{ color: '#10b981' }}>{presentCount} P</span>
              <span style={{ color: '#ef4444' }}>{absentCount} A</span>
              <span style={{ color: '#f59e0b' }}>{lateCount} L</span>
              <span style={{ color: '#06b6d4' }}>{excusedCount} E</span>
            </div>
            <button onClick={handleSaveAll} disabled={saving || filledCount === 0} className="glass-btn text-xs"
              style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
              {saving ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" /> Saving...</>
                : <><Save className="w-3.5 h-3.5" /> Save All ({filledCount})</>}
            </button>
          </div>
        )}
      </div>

      {/* ─── Step indicator ─── */}
      <div className="flex items-center gap-2 animate-fadeInUp">
        {[{ key: 'select', label: 'Select', icon: Users }, { key: 'enter', label: 'Mark Attendance', icon: ClipboardCheck }, { key: 'review', label: 'Review', icon: CheckCircle2 }].map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-subtle)' }} />}
            <button onClick={() => setStep(s.key)} className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${step === s.key ? 'text-white' : ''}`}
              style={step === s.key ? { background: 'linear-gradient(135deg, #10b981, #06b6d4)' } : { color: 'var(--text-muted)' }}>
              <s.icon className="w-3 h-3" /> {s.label}
            </button>
          </div>
        ))}
      </div>

      {/* ─── Step 1: Select ─── */}
      {step === 'select' && (
        <div className="glass-card p-6 animate-fadeInUp">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Calendar className="w-4 h-4" /> Select Class, Course & Date</h2>
          {currentTerm && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.12)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Current: <strong className="text-white">{currentYear?.year_name}</strong> &middot; <strong className="text-white">{currentTerm.term_name}</strong></span>
            </div>
          )}
          <div className="grid grid-cols-3 gap-5 mb-6">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Class / Trade *</label>
              <select value={classId} onChange={e => { setClassId(e.target.value); setStep('select') }} className="glass-input w-full">
                <option value="" className="bg-[#0b1120]">— Select class —</option>
                {classes.map(c => (
                  <option key={c.id || c.class_id} value={c.id || c.class_id} className="bg-[#0b1120]">
                    {c.class_name}{c.section ? ` (${c.section})` : ''}
                  </option>
                ))}
              </select>
              {classId && (
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-subtle)' }}>
                  {students.filter(s => String(s.class_id) === String(classId)).length} students
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Course (optional)</label>
              <select value={courseId} onChange={e => setCourseId(e.target.value)} className="glass-input w-full">
                <option value="" className="bg-[#0b1120]">— All courses —</option>
                {courses.map(c => (
                  <option key={c.id || c.course_id} value={c.id || c.course_id} className="bg-[#0b1120]">
                    {c.course_name}{c.trade ? ` (${c.trade})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Date *</label>
              <input type="date" value={attDate} onChange={e => setAttDate(e.target.value)} className="glass-input w-full" />
            </div>
          </div>
          {classStudents.length > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" style={{ color: '#10b981' }} />
                <div>
                  <p className="text-sm font-medium text-white">{classStudents.length} students ready</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>
                    {selectedClass?.class_name} &middot; {attDate}
                    {todayAttendance.length > 0 && ` &middot; ${todayAttendance.length} already marked`}
                  </p>
                </div>
              </div>
              <button onClick={handleLoadSheet} className="glass-btn text-xs"
                style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
                <ClipboardCheck className="w-3.5 h-3.5" /> Load Attendance Sheet
              </button>
            </div>
          )}
          {!classId && (
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.12)' }}>
              <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-amber)' }} />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Select a class and date, then click "Load Attendance Sheet" to begin.</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Step 2: Enter Attendance ─── */}
      {step === 'enter' && (
        <div className="glass-card p-0 overflow-hidden animate-fadeInUp">
          {/* Summary bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span><span className="text-white font-medium">{selectedClass?.class_name}</span></span>
              <span><span className="text-white font-medium">{attDate}</span></span>
              {selectedCourse && <span>{selectedCourse.course_name}</span>}
            </div>
            <button onClick={() => setStep('select')} className="glass-btn-ghost text-xs px-2 py-1 rounded-lg" style={{ color: 'var(--text-muted)' }}>Change</button>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 px-5 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            <span className="text-[10px] font-medium" style={{ color: 'var(--text-subtle)' }}>Quick fill:</span>
            {statusBtns.map(s => (
              <button key={s.value} onClick={() => {
                const newEntries = {}
                classStudents.forEach(st => { newEntries[String(st.id || st.student_id)] = s.value })
                setAttEntries(newEntries)
              }} className="text-[10px] font-medium px-2 py-0.5 rounded transition-all"
                style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
                All {s.label}
              </button>
            ))}
          </div>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="glass-table">
              <thead>
                <tr>
                  <th className="w-10">#</th>
                  <th>Student</th>
                  <th className="w-24">Student ID</th>
                  <th className="w-28">Status</th>
                  <th className="w-20">Marked</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12"><div className="empty-state"><Users className="w-8 h-8" style={{ color: 'var(--text-muted)' }} /><p className="empty-state-title">No students in this class</p></div></td></tr>
                ) : classStudents.map((s, i) => {
                  const sid = String(s.id || s.student_id)
                  const current = attEntries[sid]
                  const existing = todayAttendance.find(a => String(a.student_id) === sid)
                  return (
                    <tr key={sid} className="animate-fadeInUp" style={{ animationDelay: `${i * 0.012}s` }}>
                      <td className="text-xs" style={{ color: 'var(--text-subtle)' }}>{i + 1}</td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ background: `var(--grad-${['purple', 'blue', 'cyan', 'green', 'amber', 'red', 'pink', 'indigo'][i % 8]})` }}>
                            {s.first_name?.[0]}{s.last_name?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{s.first_name} {s.last_name}</p>
                            {s.email && <p className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>{s.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.student_id || `#${s.id}`}</td>
                      <td>
                        <div className="flex gap-1.5">
                          {statusBtns.map(btn => {
                            const active = current === btn.value
                            return (
                              <button key={btn.value} onClick={() => handleStatusChange(sid, active ? '' : btn.value)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium capitalize transition-all"
                                style={active
                                  ? { background: btn.bg, border: `1px solid ${btn.border}`, color: btn.color, boxShadow: `0 0 12px ${btn.bg}` }
                                  : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                                <btn.icon className="w-3 h-3" /> {btn.label}
                              </button>
                            )
                          })}
                        </div>
                      </td>
                      <td>
                        {current ? (
                          <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--accent-green)' }}>
                            <CheckCircle2 className="w-3 h-3" /> Yes
                          </span>
                        ) : existing ? (
                          <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--accent-amber)' }}>
                            <AlertCircle className="w-3 h-3" /> Existing
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-subtle)' }}>
                            <XCircle className="w-3 h-3" /> No
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {/* Footer stats */}
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>Total: <strong className="text-white">{classStudents.length}</strong></span>
              <span style={{ color: '#10b981' }}>Present: <strong>{presentCount}</strong></span>
              <span style={{ color: '#ef4444' }}>Absent: <strong>{absentCount}</strong></span>
              <span style={{ color: '#f59e0b' }}>Late: <strong>{lateCount}</strong></span>
              <span style={{ color: '#06b6d4' }}>Excused: <strong>{excusedCount}</strong></span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep('select')} className="glass-btn glass-btn-outline text-xs">Back</button>
              <button onClick={handleSaveAll} disabled={saving || filledCount === 0} className="glass-btn text-xs"
                style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
                {saving ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" /> Saving...</>
                  : <><Save className="w-3.5 h-3.5" /> Save All ({filledCount})</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Step 3: Review ─── */}
      {step === 'review' && (
        <div className="animate-fadeInUp space-y-4">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-6 h-6" style={{ color: 'var(--accent-green)' }} />
              <div>
                <h2 className="text-sm font-bold text-white">Attendance Saved!</h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {presentCount} present, {absentCount} absent, {lateCount} late, {excusedCount} excused on {attDate}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setStep('select'); setAttEntries({}) }} className="glass-btn glass-btn-outline text-xs"><Users className="w-3.5 h-3.5" /> New Sheet</button>
              <button onClick={handleLoadSheet} className="glass-btn text-xs" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
                <ClipboardCheck className="w-3.5 h-3.5" /> Re-enter Attendance
              </button>
            </div>
          </div>

          {/* Summary pie-like breakdown */}
          <div className="glass-card p-4">
            <h3 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Attendance Summary for {selectedClass?.class_name} &mdash; {attDate}
            </h3>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {statusBtns.map(s => {
                const count = { present: presentCount, absent: absentCount, late: lateCount, excused: excusedCount }[s.value] || 0
                const total = classStudents.length || 1
                const pct = Math.round((count / total) * 100)
                return (
                  <div key={s.value} className="p-3 rounded-xl text-center" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                    <s.icon className="w-5 h-5 mx-auto mb-1" style={{ color: s.color }} />
                    <p className="text-lg font-bold text-white">{count}</p>
                    <p className="text-[10px]" style={{ color: s.color }}>{s.label} ({pct}%)</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendancePage
