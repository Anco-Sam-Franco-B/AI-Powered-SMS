import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, BookOpen, X, Search, GraduationCap } from 'lucide-react'
import useAcademicStore from '../STORES/AcademicStore'

function Courses() {
  const { courses, fetchCourses, createCourse, updateCourse, deleteCourse, loading } = useAcademicStore()
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ course_name: '', course_code: '', description: '', credits: '' })

  useEffect(() => { fetchCourses() }, [])

  const filtered = courses.filter(c =>
    (c.course_name || c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.course_code || c.code || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.course_name) return toast.error('Course name is required')
    try {
      const payload = { ...form, credits: form.credits ? Number(form.credits) : undefined }
      if (editItem) await updateCourse(editItem, payload)
      else await createCourse(payload)
      toast.success(editItem ? 'Updated!' : 'Created!')
      setShowModal(false); setEditItem(null); setForm({ course_name: '', course_code: '', description: '', credits: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this course?')) return
    try { await deleteCourse(id); toast.success('Deleted!') }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fadeInUp">
        <div>
          <h1 className="section-title">Courses & Trades</h1>
          <p className="section-sub">{courses.length} courses</p>
        </div>
        <button onClick={() => { setEditItem(null); setForm({ course_name: '', course_code: '', description: '', credits: '' }); setShowModal(true) }} className="glass-btn glass-btn-primary text-xs">
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      <div className="relative max-w-xs animate-fadeInUp">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-subtle)' }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..." className="glass-input w-full pl-10" />
      </div>

      {loading.courses ? (
        <div className="grid grid-cols-3 gap-5">{[1,2,3].map(i => <div key={i} className="h-36 skeleton-glass rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 animate-fadeInUp">
          <div className="empty-state">
            <div className="empty-state-icon"><BookOpen className="w-5 h-5" /></div>
            <p className="empty-state-title">{search ? 'No courses match' : 'No courses defined'}</p>
            <p className="empty-state-desc">{search ? 'Try a different search term' : 'Add your first course to get started'}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {filtered.map((course, i) => (
            <div key={course.id || course.course_id || i} className="glass-card p-5 animate-fadeInUp group" style={{ animationDelay: `${i*0.04}s` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.12)' }}>
                    <GraduationCap className="w-5 h-5" style={{ color: 'var(--accent-violet)' }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{course.course_name || course.name}</h4>
                    {course.course_code && <p className="text-[10px] font-mono" style={{ color: 'var(--text-subtle)' }}>{course.course_code}</p>}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditItem(course.id || course.course_id); setForm({ course_name: course.course_name || course.name || '', course_code: course.course_code || '', description: course.description || '', credits: course.credits || '' }); setShowModal(true) }} className="glass-btn-ghost p-1.5 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(course.id || course.course_id)} className="glass-btn-ghost p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {course.description && <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{course.description}</p>}
              <div className="flex items-center gap-2">
                {course.credits && <span className="glass-badge glass-badge-purple text-[10px]">{course.credits} Credits</span>}
                {course.department && <span className="glass-badge glass-badge-blue text-[10px]">{course.department}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="glass-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="glass-modal" onClick={e => e.stopPropagation()}>
            <div className="glass-modal-header">
              <h3 className="text-base font-bold text-white">{editItem ? 'Edit' : 'Add'} Course</h3>
              <button onClick={() => setShowModal(false)} className="glass-btn-ghost p-1.5 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="glass-modal-body space-y-0">
                <div className="form-section">
                  <div className="form-section-title">Course Details</div>
                  <div className="form-group">
                    <label className="form-label">Course Name <span className="text-[#f87171]">*</span></label>
                    <div className="form-input-wrap">
                      <GraduationCap className="form-input-icon" />
                      <input type="text" value={form.course_name} onChange={e => setForm({...form,course_name:e.target.value})} className="glass-input w-full" placeholder="e.g. Mathematics" />
                    </div>
                  </div>
                </div>
                <div className="form-section">
                  <div className="form-section-title">Classification</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Course Code <span className="form-label-optional">(optional)</span></label>
                      <div className="form-input-wrap">
                        <input type="text" value={form.course_code} onChange={e => setForm({...form,course_code:e.target.value})} className="glass-input w-full" placeholder="e.g. MATH101" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Credits <span className="form-label-optional">(optional)</span></label>
                      <div className="form-input-wrap">
                        <input type="number" value={form.credits} onChange={e => setForm({...form,credits:e.target.value})} className="glass-input w-full" placeholder="e.g. 3" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="form-section">
                  <div className="form-section-title">Description</div>
                  <div className="form-group">
                    <textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})} className="glass-input w-full" rows={3} placeholder="Course description..." />
                    <span className="form-hint">Brief overview of the course content and objectives</span>
                  </div>
                </div>
              </div>
              <div className="glass-modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="glass-btn glass-btn-outline flex-1">Cancel</button>
                <button type="submit" className="glass-btn glass-btn-primary flex-1">{editItem ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Courses
