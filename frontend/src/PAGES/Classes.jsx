import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, School, X, Search, Users } from 'lucide-react'
import useAcademicStore from '../STORES/AcademicStore'

function Classes() {
  const { classes, academicYears, fetchClasses, fetchAcademicYears, createClass, updateClass, deleteClass, loading } = useAcademicStore()
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ class_name: '', section: '', academic_year_id: '', capacity: '' })

  useEffect(() => { fetchClasses(); fetchAcademicYears() }, [])

  const filtered = classes.filter(c =>
    (c.class_name || c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.section || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.class_name) return toast.error('Class name is required')
    try {
      const payload = { ...form, capacity: form.capacity ? Number(form.capacity) : undefined }
      if (editItem) await updateClass(editItem, payload)
      else await createClass(payload)
      toast.success(editItem ? 'Updated!' : 'Created!')
      setShowModal(false); setEditItem(null); setForm({ class_name: '', section: '', academic_year_id: '', capacity: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this class?')) return
    try { await deleteClass(id); toast.success('Deleted!') }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fadeInUp">
        <div>
          <h1 className="section-title">Class Management</h1>
          <p className="section-sub">{classes.length} classes</p>
        </div>
        <button onClick={() => { setEditItem(null); setForm({ class_name: '', section: '', academic_year_id: '', capacity: '' }); setShowModal(true) }} className="glass-btn glass-btn-primary text-xs">
          <Plus className="w-4 h-4" /> Add Class
        </button>
      </div>

      <div className="relative max-w-xs animate-fadeInUp">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-subtle)' }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search classes..." className="glass-input w-full pl-10" />
      </div>

      <div className="glass-table-wrap animate-fadeInUp">
        <div className="overflow-x-auto">
          <table className="glass-table">
            <thead>
              <tr><th>Class Name</th><th>Section</th><th>Academic Year</th><th>Capacity</th><th>Students</th><th className="w-20">Actions</th></tr>
            </thead>
            <tbody>
              {loading.classes ? (
                <tr><td colSpan={6} className="text-center py-12"><div className="flex justify-center"><div className="w-6 h-6 rounded-full border-2 border-[var(--accent-blue)] border-t-transparent animate-spin" /></div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12"><div className="empty-state"><School className="w-8 h-8" style={{ color: 'var(--text-muted)' }} /><p className="empty-state-title">{search ? 'No matches' : 'No classes defined'}</p></div></td></tr>
              ) : filtered.map((c, i) => (
                <tr key={c.id || c.class_id || i} className="animate-fadeInUp" style={{ animationDelay: `${i*0.03}s` }}>
                  <td className="font-medium text-white">{c.class_name || c.name}</td>
                  <td className="text-xs">{c.section || '—'}</td>
                  <td><span className="glass-badge glass-badge-blue text-[10px]">{c.year_name || `Year #${c.academic_year_id}` || '—'}</span></td>
                  <td className="text-xs">{c.capacity || 'Unlimited'}</td>
                  <td className="text-xs"><span className="flex items-center gap-1.5"><Users className="w-3 h-3" style={{ color: 'var(--text-muted)' }} /> {c.student_count || 0}</span></td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditItem(c.id || c.class_id); setForm({ class_name: c.class_name || c.name || '', section: c.section || '', academic_year_id: c.academic_year_id || '', capacity: c.capacity || '' }); setShowModal(true) }} className="glass-btn-ghost p-1.5 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(c.id || c.class_id)} className="glass-btn-ghost p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}><Trash2 className="w-3.5 h-3.5" /></button>
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
          <div className="glass-modal" onClick={e => e.stopPropagation()}>
            <div className="glass-modal-header">
              <h3 className="text-base font-bold text-white">{editItem ? 'Edit' : 'Add'} Class</h3>
              <button onClick={() => setShowModal(false)} className="glass-btn-ghost p-1.5 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="glass-modal-body space-y-0">
                <div className="form-section">
                  <div className="form-section-title">Class Details</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Class Name <span className="text-[#f87171]">*</span></label>
                      <div className="form-input-wrap">
                        <input type="text" value={form.class_name} onChange={e => setForm({...form,class_name:e.target.value})} className="glass-input w-full" placeholder="e.g. Grade 10" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Section <span className="form-label-optional">(optional)</span></label>
                      <div className="form-input-wrap">
                        <input type="text" value={form.section} onChange={e => setForm({...form,section:e.target.value})} className="glass-input w-full" placeholder="e.g. A" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="form-section">
                  <div className="form-section-title">Configuration</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Academic Year <span className="form-label-optional">(optional)</span></label>
                      <select value={form.academic_year_id} onChange={e => setForm({...form,academic_year_id:e.target.value})} className="glass-input w-full">
                        <option value="" className="bg-[#0b1120]">Select</option>
                        {academicYears.map(y => <option key={y.id||y.year_id} value={y.id||y.year_id} className="bg-[#0b1120]">{y.name||y.year_name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Capacity <span className="form-label-optional">(optional)</span></label>
                      <div className="form-input-wrap">
                        <input type="number" value={form.capacity} onChange={e => setForm({...form,capacity:e.target.value})} className="glass-input w-full" placeholder="Max students" />
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

export default Classes
