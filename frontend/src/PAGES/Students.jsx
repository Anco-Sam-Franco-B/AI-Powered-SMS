import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, Users, X, Search, Mail, Phone, Calendar } from 'lucide-react'
import useAcademicStore from '../STORES/AcademicStore'

function Students() {
  const { students, classes, fetchStudents, fetchClasses, createStudent, updateStudent, deleteStudent, loading } = useAcademicStore()
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', date_of_birth: '', gender: '', address: '', class_id: '', enrollment_date: '' })

  useEffect(() => { fetchStudents(); fetchClasses() }, [])

  const filtered = students.filter(s =>
    `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase().includes(search.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.first_name || !form.last_name) return toast.error('Name is required')
    try {
      if (editItem) await updateStudent(editItem, form)
      else await createStudent(form)
      toast.success(editItem ? 'Updated!' : 'Created!')
      setShowModal(false); setEditItem(null)
      setForm({ first_name: '', last_name: '', email: '', phone: '', date_of_birth: '', gender: '', address: '', class_id: '', enrollment_date: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this student?')) return
    try { await deleteStudent(id); toast.success('Deleted!') }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fadeInUp">
        <div>
          <h1 className="section-title">Student Records</h1>
          <p className="section-sub">{students.length} total students</p>
        </div>
        <button onClick={() => { setEditItem(null); setForm({ first_name: '', last_name: '', email: '', phone: '', date_of_birth: '', gender: '', address: '', class_id: '', enrollment_date: '' }); setShowModal(true) }} className="glass-btn glass-btn-primary text-xs">
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      <div className="relative max-w-xs animate-fadeInUp">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-subtle)' }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="glass-input w-full pl-10" />
      </div>

      <div className="glass-table-wrap animate-fadeInUp">
        <div className="overflow-x-auto">
          <table className="glass-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Class</th><th>Gender</th><th>Enrolled</th><th className="w-20">Actions</th></tr>
            </thead>
            <tbody>
              {loading.students ? (
                <tr><td colSpan={7} className="text-center py-12"><div className="flex justify-center"><div className="w-6 h-6 rounded-full border-2 border-[var(--accent-blue)] border-t-transparent animate-spin" /></div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12"><div className="empty-state"><Users className="w-8 h-8" style={{ color: 'var(--text-muted)' }} /><p className="empty-state-title">{search ? 'No matches' : 'No students enrolled'}</p><p className="empty-state-desc">{search ? 'Try a different search term' : 'Add your first student to get started'}</p></div></td></tr>
              ) : filtered.map((s, i) => (
                <tr key={s.id || s.student_id || i} className="animate-fadeInUp" style={{ animationDelay: `${i*0.025}s` }}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: 'var(--grad-primary)' }}>
                        {(s.first_name || 'U').charAt(0)}{(s.last_name || '').charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-white">{s.first_name} {s.last_name}</span>
                    </div>
                  </td>
                  <td><span className="flex items-center gap-1.5 text-xs"><Mail className="w-3 h-3" style={{ color: 'var(--text-muted)' }} /> {s.email || '—'}</span></td>
                  <td><span className="flex items-center gap-1.5 text-xs"><Phone className="w-3 h-3" style={{ color: 'var(--text-muted)' }} /> {s.phone || '—'}</span></td>
                  <td><span className="glass-badge glass-badge-blue text-[10px]">{s.class_name || `Class #${s.class_id}` || '—'}</span></td>
                  <td className="text-xs">{s.gender || '—'}</td>
                  <td className="text-xs"><span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" style={{ color: 'var(--text-muted)' }} /> {s.enrollment_date?.slice(0,10) || '—'}</span></td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditItem(s.id || s.student_id); setForm({ first_name: s.first_name || '', last_name: s.last_name || '', email: s.email || '', phone: s.phone || '', date_of_birth: s.date_of_birth?.slice(0,10) || '', gender: s.gender || '', address: s.address || '', class_id: s.class_id || '', enrollment_date: s.enrollment_date?.slice(0,10) || '' }); setShowModal(true) }} className="glass-btn-ghost p-1.5 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(s.id || s.student_id)} className="glass-btn-ghost p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="glass-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="glass-modal max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="glass-modal-header">
              <h3 className="text-base font-bold text-white">{editItem ? 'Edit' : 'Add'} Student</h3>
              <button onClick={() => setShowModal(false)} className="glass-btn-ghost p-1.5 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="glass-modal-body space-y-0">
                <div className="form-section">
                  <div className="form-section-title">Personal Information</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">First Name <span className="text-[#f87171]">*</span></label>
                      <div className="form-input-wrap">
                        <input type="text" value={form.first_name} onChange={e => setForm({...form,first_name:e.target.value})} className="glass-input w-full" placeholder="John" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name <span className="text-[#f87171]">*</span></label>
                      <div className="form-input-wrap">
                        <input type="text" value={form.last_name} onChange={e => setForm({...form,last_name:e.target.value})} className="glass-input w-full" placeholder="Doe" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="form-group">
                      <label className="form-label">Email <span className="form-label-optional">(optional)</span></label>
                      <div className="form-input-wrap">
                        <Mail className="form-input-icon" />
                        <input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} className="glass-input w-full" placeholder="john@school.edu" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone <span className="form-label-optional">(optional)</span></label>
                      <div className="form-input-wrap">
                        <Phone className="form-input-icon" />
                        <input type="text" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} className="glass-input w-full" placeholder="+1 555-0123" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="form-section">
                  <div className="form-section-title">Demographics</div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="form-group">
                      <label className="form-label">Date of Birth <span className="form-label-optional">(optional)</span></label>
                      <div className="form-input-wrap">
                        <Calendar className="form-input-icon" />
                        <input type="date" value={form.date_of_birth} onChange={e => setForm({...form,date_of_birth:e.target.value})} className="glass-input w-full" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gender <span className="form-label-optional">(optional)</span></label>
                      <select value={form.gender} onChange={e => setForm({...form,gender:e.target.value})} className="glass-input w-full">
                        <option value="" className="bg-[#0b1120]">Select</option>
                        <option value="Male" className="bg-[#0b1120]">Male</option>
                        <option value="Female" className="bg-[#0b1120]">Female</option>
                        <option value="Other" className="bg-[#0b1120]">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Class <span className="form-label-optional">(optional)</span></label>
                      <select value={form.class_id} onChange={e => setForm({...form,class_id:e.target.value})} className="glass-input w-full">
                        <option value="" className="bg-[#0b1120]">Select</option>
                        {classes.map(c => <option key={c.id||c.class_id} value={c.id||c.class_id} className="bg-[#0b1120]">{c.class_name||c.name||`Class #${c.class_id}`}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="form-section">
                  <div className="form-section-title">Enrollment</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Enrollment Date <span className="form-label-optional">(optional)</span></label>
                      <div className="form-input-wrap">
                        <Calendar className="form-input-icon" />
                        <input type="date" value={form.enrollment_date} onChange={e => setForm({...form,enrollment_date:e.target.value})} className="glass-input w-full" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Address <span className="form-label-optional">(optional)</span></label>
                      <div className="form-input-wrap">
                        <input type="text" value={form.address} onChange={e => setForm({...form,address:e.target.value})} className="glass-input w-full" placeholder="123 Main St, City" />
                      </div>
                    </div>
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

export default Students
