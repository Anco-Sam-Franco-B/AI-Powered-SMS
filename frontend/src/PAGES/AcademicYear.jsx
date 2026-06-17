import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, Calendar, CheckCircle, X, Clock, Hash, Flag } from 'lucide-react'
import useAcademicStore from '../STORES/AcademicStore'

function AcademicYear() {
  const { academicYears, terms, fetchAcademicYears, fetchTerms, createAcademicYear, updateAcademicYear, deleteAcademicYear, createTerm, updateTerm, setCurrentTerm, loading } = useAcademicStore()
  const [tab, setTab] = useState('years')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ name: '', start_date: '', end_date: '', is_current: false })

  useEffect(() => { fetchAcademicYears(); fetchTerms() }, [])

  const resetForm = () => { setForm({ name: '', start_date: '', end_date: '', is_current: false }); setEditItem(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name) return toast.error('Name is required')
    try {
      if (tab === 'years') {
        if (editItem) await updateAcademicYear(editItem, { ...form, is_current: form.is_current || undefined })
        else await createAcademicYear(form)
      } else {
        if (editItem) await updateTerm(editItem, form)
        else await createTerm(form)
      }
      toast.success(editItem ? 'Updated!' : 'Created!')
      setShowModal(false); resetForm()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const handleDelete = async (id, type) => {
    if (!confirm('Delete this item?')) return
    try {
      if (type === 'year') await deleteAcademicYear(id)
      toast.success('Deleted!')
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const openEdit = (item, type) => {
    setEditItem(item.id || item.year_id)
    setForm({ name: item.name || item.year_name || '', start_date: item.start_date?.slice(0,10) || '', end_date: item.end_date?.slice(0,10) || '', is_current: item.is_current || false })
    setShowModal(true)
  }

  const items = tab === 'years' ? academicYears : terms
  const isEmpty = items.length === 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fadeInUp">
        <div>
          <h1 className="section-title">Academic Management</h1>
          <p className="section-sub">Manage academic years and terms</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true) }} className="glass-btn glass-btn-primary text-xs">
          <Plus className="w-4 h-4" /> Add {tab === 'years' ? 'Year' : 'Term'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl animate-fadeInUp" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', width: 'fit-content' }}>
        {[
          { key: 'years', label: 'Academic Years', icon: Calendar },
          { key: 'terms', label: 'Terms', icon: Clock },
        ].map(t => {
          const Icon = t.icon
          const active = tab === t.key
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all"
              style={{
                color: active ? 'white' : 'var(--text-muted)',
                background: active ? 'rgba(14,165,233,0.1)' : 'transparent',
                border: active ? '1px solid rgba(14,165,233,0.15)' : '1px solid transparent',
              }}>
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="glass-table-wrap animate-fadeInUp">
        <div className="overflow-x-auto">
          <table className="glass-table">
            <thead>
              <tr>
                {tab === 'years'
                  ? <><th>Name</th><th>Start Date</th><th>End Date</th><th>Status</th><th className="w-20">Actions</th></>
                  : <><th>Name</th><th>Academic Year</th><th>Start</th><th>End</th><th>Current</th><th className="w-20">Actions</th></>
                }
              </tr>
            </thead>
            <tbody>
              {isEmpty ? (
                <tr><td colSpan={5} className="text-center py-12"><div className="empty-state"><Calendar className="w-8 h-8" style={{ color: 'var(--text-muted)' }} /><p className="empty-state-title">No {tab} found</p><p className="empty-state-desc">Create your first {tab === 'years' ? 'academic year' : 'term'} to get started</p></div></td></tr>
              ) : items.map((item, i) => (
                <tr key={item.id || item.term_id || i} className="animate-fadeInUp" style={{ animationDelay: `${i*0.03}s` }}>
                  {tab === 'years' ? (
                    <>
                      <td className="font-medium text-white">{item.name || item.year_name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{item.start_date?.slice(0,10) || '—'}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{item.end_date?.slice(0,10) || '—'}</td>
                      <td>
                        {item.is_current
                          ? <span className="glass-badge glass-badge-green"><CheckCircle className="w-3 h-3" /> Active</span>
                          : <span className="glass-badge glass-badge-gray">Inactive</span>}
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(item, 'year')} className="glass-btn-ghost p-1.5 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(item.id || item.year_id, 'year')} className="glass-btn-ghost p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="font-medium text-white">{item.name || item.term_name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{item.year_name || `Year #${item.academic_year_id}`}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{item.start_date?.slice(0,10) || '—'}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{item.end_date?.slice(0,10) || '—'}</td>
                      <td>
                        {item.is_current
                          ? <span className="glass-badge glass-badge-green"><CheckCircle className="w-3 h-3" /> Active</span>
                          : <button onClick={() => setCurrentTerm(item.id || item.term_id)} className="text-xs font-medium transition-colors" style={{ color: 'var(--text-muted)' }}>Set Active</button>}
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(item, 'term')} className="glass-btn-ghost p-1.5 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="glass-modal-overlay" onClick={() => { setShowModal(false); resetForm() }}>
          <div className="glass-modal" onClick={e => e.stopPropagation()}>
            <div className="glass-modal-header">
              <h3 className="text-base font-bold text-white">{editItem ? 'Edit' : 'Add'} {tab === 'years' ? 'Academic Year' : 'Term'}</h3>
              <button onClick={() => { setShowModal(false); resetForm() }} className="glass-btn-ghost p-1.5 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="glass-modal-body space-y-0">
                <div className="form-section">
                  <div className="form-section-title">{tab === 'years' ? 'Year Information' : 'Term Information'}</div>
                  <div className="form-group">
                    <label className="form-label">{tab === 'years' ? 'Year Name' : 'Term Name'} <span className="text-[#f87171]">*</span></label>
                    <div className="form-input-wrap">
                      {tab === 'years' ? <Calendar className="form-input-icon" /> : <Hash className="form-input-icon" />}
                      <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="glass-input w-full" placeholder={tab === 'years' ? 'e.g. 2025-2026' : 'e.g. Term 1'} />
                    </div>
                  </div>
                </div>
                <div className="form-section">
                  <div className="form-section-title">Date Range</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Start Date <span className="form-label-optional">(optional)</span></label>
                      <div className="form-input-wrap">
                        <Calendar className="form-input-icon" />
                        <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="glass-input w-full" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">End Date <span className="form-label-optional">(optional)</span></label>
                      <div className="form-input-wrap">
                        <Calendar className="form-input-icon" />
                        <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="glass-input w-full" />
                      </div>
                    </div>
                  </div>
                </div>
                {tab === 'years' && (
                  <div className="form-section">
                    <div className="form-section-title">Status</div>
                    <label className="glass-checkbox">
                      <input type="checkbox" checked={form.is_current} onChange={e => setForm({ ...form, is_current: e.target.checked })} />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>Set as current academic year</span>
                    </label>
                  </div>
                )}
              </div>
              <div className="glass-modal-footer">
                <button type="button" onClick={() => { setShowModal(false); resetForm() }} className="glass-btn glass-btn-outline flex-1">Cancel</button>
                <button type="submit" className="glass-btn glass-btn-primary flex-1">{editItem ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AcademicYear
