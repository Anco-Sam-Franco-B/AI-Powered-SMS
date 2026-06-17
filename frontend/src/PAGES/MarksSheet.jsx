import { useEffect, useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { Save, BookOpen, Users, Award, CheckCircle2, XCircle, AlertCircle, ChevronRight, ClipboardList } from 'lucide-react'
import useDataStore from '../STORES/DataStore'
import useAcademicStore from '../STORES/AcademicStore'

function MarksSheet() {
  const { marks, fetchMarks, bulkMarks, loading } = useDataStore()
  const { students, courses, classes, terms, currentYear, currentTerm, fetchStudents, fetchCourses, fetchClasses, fetchTerms, fetchCurrentAcademicInfo } = useAcademicStore()

  const [classId, setClassId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [termId, setTermId] = useState('')
  const [examType, setExamType] = useState('Midterm')
  const [totalMarks, setTotalMarks] = useState(100)
  const [markEntries, setMarkEntries] = useState({})
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState('select') // select | enter | review

  useEffect(() => {
    fetchCurrentAcademicInfo().then(info => {
      if (info?.term) setTermId(String(info.term.id))
    })
    fetchMarks(); fetchStudents(); fetchCourses(); fetchClasses(); fetchTerms()
  }, [])

  const classStudents = useMemo(() => {
    if (!classId) return []
    return students.filter(s => String(s.class_id) === String(classId))
  }, [classId, students])

  const existingMarks = useMemo(() => {
    if (!courseId || !classId) return {}
    const map = {}
    marks.forEach(m => {
      if (String(m.course_id) === String(courseId) && String(m.class_id) === String(classId) && (!termId || String(m.term_id) === String(termId))) {
        map[String(m.student_id)] = m
      }
    })
    return map
  }, [marks, courseId, classId, termId])

  const calcGrade = (obtained, total) => {
    if (!total || obtained === undefined || obtained === '' || obtained === null) return ''
    const pct = (Number(obtained) / Number(total)) * 100
    if (pct >= 90) return 'A+'
    if (pct >= 80) return 'A'
    if (pct >= 70) return 'B'
    if (pct >= 60) return 'C'
    if (pct >= 50) return 'D'
    return 'F'
  }

  const handleMarksChange = (studentId, value) => {
    setMarkEntries(prev => ({ ...prev, [String(studentId)]: value }))
  }

  const handleLoadStudents = () => {
    if (!classId) return toast.error('Please select a class/trade')
    if (!courseId) return toast.error('Please select a course')
    if (!examType) return toast.error('Please select exam type')
    // Pre-fill with existing marks
    const entries = {}
    classStudents.forEach(s => {
      const existing = existingMarks[String(s.id || s.student_id)]
      entries[String(s.id || s.student_id)] = existing ? String(existing.marks_obtained) : ''
    })
    setMarkEntries(entries)
    setStep('enter')
    toast.success(`Loaded ${classStudents.length} students`)
  }

  const handleSaveAll = async () => {
    const records = []
    for (const studentId of Object.keys(markEntries)) {
      const val = markEntries[studentId]
      if (val === '' || val === undefined || val === null) continue
      const student = students.find(s => String(s.id || s.student_id) === studentId)
      const grade = calcGrade(val, totalMarks)
      records.push({
        student_id: Number(studentId),
        course_id: Number(courseId),
        class_id: Number(classId),
        term_id: termId ? Number(termId) : undefined,
        marks_obtained: Number(val),
        total_marks: Number(totalMarks),
        exam_type: examType,
        grade,
      })
    }
    if (records.length === 0) return toast.error('No marks entered to save')

    setSaving(true)
    try {
      const result = await bulkMarks(records)
      if (result.errors && result.errors.length > 0) {
        toast.error(`Saved ${result.count}, but ${result.errors.length} had errors`)
      } else {
        toast.success(`${result.count} marks saved successfully!`)
      }
      setStep('review')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save marks')
    } finally {
      setSaving(false)
    }
  }

  const filledCount = Object.values(markEntries).filter(v => v !== '' && v !== undefined && v !== null).length
  const selectedClass = classes.find(c => String(c.id || c.class_id) === String(classId))
  const selectedCourse = courses.find(c => String(c.id || c.course_id) === String(courseId))

  const FIELDS = [
    { key: 'classId', label: 'Class / Trade', icon: Users, options: classes, valKey: 'id', labelKey: 'class_name', placeholder: 'Select class...' },
    { key: 'courseId', label: 'Course', icon: BookOpen, options: courses, valKey: 'id', labelKey: 'course_name', placeholder: 'Select course...' },
  ]

  const gradeBadge = (grade) => {
    if (!grade) return null
    const colors = { 'A+': 'glass-badge-green', 'A': 'glass-badge-green', 'B': 'glass-badge-blue', 'C': 'glass-badge-amber', 'D': 'glass-badge-amber', 'F': 'glass-badge-red' }
    return <span className={`glass-badge ${colors[grade] || 'glass-badge-cyan'} text-[10px]`}>{grade}</span>
  }

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between animate-fadeInUp">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--grad-purple)' }}>
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="section-title">Mark Sheet</h1>
            <p className="section-sub">{step === 'select' ? 'Select class and course to begin' : step === 'enter' ? `${filledCount} of ${classStudents.length} students marked` : 'Review saved marks'}</p>
          </div>
        </div>
        {step === 'enter' && (
          <div className="flex items-center gap-3">
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="text-white font-medium">{filledCount}</span> / {classStudents.length} filled
            </div>
            <button onClick={handleSaveAll} disabled={saving || filledCount === 0} className="glass-btn glass-btn-primary text-xs">
              {saving ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" /> Saving...</> : <><Save className="w-3.5 h-3.5" /> Save All Marks</>}
            </button>
          </div>
        )}
      </div>

      {/* ─── Step indicator ─── */}
      <div className="flex items-center gap-2 animate-fadeInUp">
        {[{ key: 'select', label: 'Select', icon: Users }, { key: 'enter', label: 'Enter Marks', icon: Award }, { key: 'review', label: 'Review', icon: CheckCircle2 }].map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-subtle)' }} />}
            <button onClick={() => setStep(s.key)} className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${step === s.key ? 'glass-badge text-white' : ''}`}
              style={step === s.key ? { background: 'var(--grad-purple)' } : { color: 'var(--text-muted)' }}>
              <s.icon className="w-3 h-3" /> {s.label}
            </button>
          </div>
        ))}
      </div>

      {/* ─── Step 1: Select Class & Course ─── */}
      {step === 'select' && (
        <div className="glass-card p-6 animate-fadeInUp">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Users className="w-4 h-4" /> Select Class, Course & Exam Details</h2>
          {currentTerm && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.12)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Current: <strong className="text-white">{currentYear?.year_name}</strong> &middot; <strong className="text-white">{currentTerm.term_name}</strong></span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-5 mb-5">
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
                  {students.filter(s => String(s.class_id) === String(classId)).length} students in this class
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Course *</label>
              <select value={courseId} onChange={e => { setCourseId(e.target.value); setStep('select') }} className="glass-input w-full">
                <option value="" className="bg-[#0b1120]">— Select course —</option>
                {courses.map(c => (
                  <option key={c.id || c.course_id} value={c.id || c.course_id} className="bg-[#0b1120]">
                    {c.course_name}{c.trade ? ` (${c.trade})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-5 mb-6">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Term</label>
              <select value={termId} onChange={e => setTermId(e.target.value)} className="glass-input w-full">
                <option value="" className="bg-[#0b1120]">— Current term —</option>
                {terms.filter(t => !currentYear || String(t.acyearid || t.academic_year_id) === String(currentYear.id)).map(t => (
                  <option key={t.id || t.term_id} value={t.id || t.term_id} className="bg-[#0b1120]">
                    {t.term_name}{t.is_active ? ' (Active)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Exam Type</label>
              <select value={examType} onChange={e => setExamType(e.target.value)} className="glass-input w-full">
                {['Midterm', 'Final', 'Quiz', 'Assignment', 'Practical'].map(t => (
                  <option key={t} className="bg-[#0b1120]">{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Total Marks</label>
              <input type="number" value={totalMarks} onChange={e => setTotalMarks(Number(e.target.value))} className="glass-input w-full" min="1" />
            </div>
          </div>
          {classStudents.length > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl mb-4" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5" style={{ color: 'var(--accent-purple)' }} />
                <div>
                  <p className="text-sm font-medium text-white">{classStudents.length} students ready</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>
                    {selectedClass?.class_name}{selectedClass?.section ? ` (${selectedClass.section})` : ''} &middot; {selectedCourse?.course_name || 'No course selected'}
                  </p>
                </div>
              </div>
              <button onClick={handleLoadStudents} className="glass-btn glass-btn-primary text-xs">
                <ClipboardList className="w-3.5 h-3.5" /> Load Mark Sheet
              </button>
            </div>
          )}
          {!classId && (
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.12)' }}>
              <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-amber)' }} />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Select a class and course above, then click "Load Mark Sheet" to begin entering marks.</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Step 2: Enter Marks ─── */}
      {step === 'enter' && (
        <div className="glass-card p-0 overflow-hidden animate-fadeInUp">
          {/* Summary bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span><span className="text-white font-medium">{selectedClass?.class_name}</span></span>
              <span><span className="text-white font-medium">{selectedCourse?.course_name}</span></span>
              <span>{examType}</span>
              <span>Total: <span className="text-white font-medium">{totalMarks}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setStep('select')} className="glass-btn-ghost text-xs px-2 py-1 rounded-lg" style={{ color: 'var(--text-muted)' }}>Change</button>
            </div>
          </div>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="glass-table">
              <thead>
                <tr>
                  <th className="w-10">#</th>
                  <th>Student</th>
                  <th className="w-24">Student ID</th>
                  <th className="w-28">Marks Obtained</th>
                  <th className="w-20">Grade</th>
                  <th className="w-24">Status</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12"><div className="empty-state"><Users className="w-8 h-8" style={{ color: 'var(--text-muted)' }} /><p className="empty-state-title">No students in this class</p></div></td></tr>
                ) : classStudents.map((s, i) => {
                  const sid = String(s.id || s.student_id)
                  const val = markEntries[sid]
                  const hasExisting = existingMarks[sid]
                  const grade = calcGrade(val, totalMarks)
                  const isFilled = val !== '' && val !== undefined && val !== null
                  return (
                    <tr key={sid} className="animate-fadeInUp" style={{ animationDelay: `${i * 0.015}s` }}>
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
                      <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.student_id || s.stu_code || `#${s.id}`}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={val !== undefined ? val : ''}
                            onChange={e => handleMarksChange(sid, e.target.value)}
                            onFocus={e => e.target.select()}
                            className={`glass-input w-full text-sm font-medium text-center ${hasExisting ? 'border-l-2' : ''}`}
                            style={hasExisting ? { borderLeftColor: 'var(--accent-amber)' } : {}}
                            min="0"
                            max={totalMarks}
                            placeholder="—"
                          />
                          <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>/ {totalMarks}</span>
                        </div>
                      </td>
                      <td>{gradeBadge(grade)}</td>
                      <td>
                        {hasExisting && !isFilled ? (
                          <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--accent-amber)' }}><AlertCircle className="w-3 h-3" /> Existing</span>
                        ) : isFilled ? (
                          <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--accent-green)' }}><CheckCircle2 className="w-3 h-3" /> Marked</span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-subtle)' }}><XCircle className="w-3 h-3" /> Pending</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>Total: <strong className="text-white">{classStudents.length}</strong></span>
              <span>Filled: <strong className="text-white">{filledCount}</strong></span>
              <span>Empty: <strong className="text-white">{classStudents.length - filledCount}</strong></span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep('select')} className="glass-btn glass-btn-outline text-xs">Back</button>
              <button onClick={handleSaveAll} disabled={saving || filledCount === 0} className="glass-btn glass-btn-primary text-xs">
                {saving ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" /> Saving...</> : <><Save className="w-3.5 h-3.5" /> Save All ({filledCount})</>}
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
                <h2 className="text-sm font-bold text-white">Marks Saved!</h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Review the saved marks below or add more</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setStep('select'); setMarkEntries({}) }} className="glass-btn glass-btn-outline text-xs"><Users className="w-3.5 h-3.5" /> New Sheet</button>
              <button onClick={handleLoadStudents} className="glass-btn glass-btn-purple text-xs"><ClipboardList className="w-3.5 h-3.5" /> Re-enter Marks</button>
            </div>
          </div>

          {/* Existing marks view */}
          <div className="glass-card p-4">
            <h3 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
              <Award className="w-3.5 h-3.5" /> Saved Marks for {selectedCourse?.course_name}
            </h3>
            <div className="overflow-x-auto">
              <table className="glass-table">
                <thead><tr><th>Student</th><th>Marks</th><th>Grade</th><th>Exam</th></tr></thead>
                <tbody>
                  {marks.filter(m => String(m.course_id) === String(courseId) && String(m.class_id) === String(classId)).slice(0, 50).map((m, i) => {
                    const s = students.find(st => String(st.id || st.student_id) === String(m.student_id))
                    const pct = m.total_marks ? ((m.marks_obtained / m.total_marks) * 100).toFixed(1) : '—'
                    return (
                      <tr key={m.id || i}>
                        <td className="text-sm font-medium text-white">{s?.first_name} {s?.last_name || `#${m.student_id}`}</td>
                        <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>{m.marks_obtained}/{m.total_marks} <span style={{ color: 'var(--text-subtle)' }}>({pct}%)</span></td>
                        <td>{gradeBadge(m.grade || calcGrade(m.marks_obtained, m.total_marks))}</td>
                        <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>{m.exam_type}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MarksSheet
