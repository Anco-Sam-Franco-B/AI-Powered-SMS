import { useState, useEffect } from 'react'
import { SaveIcon, X, Calendar, Hash, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import useAcademicStore from '../STORES/AcademicStore'

function AcademicTermMod({ open, onClose, editTerm }) {
  const { academicYears, fetchAcademicYear, newTerm, loadingTerm, updateTerm, loadingUpdate, messagesForm, setMessagesForms } = useAcademicStore()
  const isEdit = !!editTerm

  const [form, setForm] = useState({
    term_name: '',
    start_date: '',
    end_date: '',
    academic_year_id: '',
    is_active: false,
  })

  useEffect(() => {
    fetchAcademicYear()
  }, [fetchAcademicYear])

  useEffect(() => {
    if (editTerm) {
      setForm({
        term_name: editTerm.term_name || '',
        start_date: editTerm.start_date?.slice(0, 10) || '',
        end_date: editTerm.end_date?.slice(0, 10) || '',
        academic_year_id: editTerm.academic_year_id || '',
        is_active: editTerm.is_active || false,
      })
    } else {
      setForm({ term_name: '', start_date: '', end_date: '', academic_year_id: '', is_active: false })
    }
  }, [editTerm, open])

  const handleClose = () => {
    setForm({ term_name: '', start_date: '', end_date: '', academic_year_id: '', is_active: false })
    setMessagesForms({ type: '', text: '' })
    onClose?.()
  }

  const handleSave = async () => {
    if (!form.term_name || !form.start_date || !form.end_date || !form.academic_year_id) return
    if (isEdit) {
      await updateTerm(editTerm.id, form)
    } else {
      await newTerm(form)
    }
    if (!messagesForm.type || messagesForm.type === 'success') {
      handleClose()
    }
  }

  if (!open) return null

  return (
    <div className="glass-modal-overlay" onClick={handleClose}>
      <div className="glass-modal max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="glass-modal-header">
          <h3 className="text-base font-bold text-white">{isEdit ? 'Update' : 'New'} Academic Term</h3>
          <button onClick={handleClose} className="glass-btn-ghost p-1.5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {messagesForm.text && (
          <div className="px-6 pt-4">
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs"
              style={{
                background: messagesForm.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${messagesForm.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
                color: messagesForm.type === 'success' ? '#34d399' : '#f87171',
              }}>
              {messagesForm.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span className="flex-1">{messagesForm.text}</span>
              <button onClick={() => setMessagesForms({ type: '', text: '' })} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
        
        <div className="glass-modal-body space-y-0">
          <div className="form-section">
            <div className="form-section-title">Term Information</div>
            <div className="form-group">
              <label className="form-label">Term Name <span className="text-[#f87171]">*</span></label>
              <div className="form-input-wrap">
                <Hash className="form-input-icon" />
                <input type="text" value={form.term_name}
                  onChange={e => setForm({ ...form, term_name: e.target.value })}
                  placeholder="e.g. Term 1" className="glass-input w-full" />
              </div>
            </div>
          </div>
          <div className="form-section">
            <div className="form-section-title">Date Range</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Start Date <span className="text-[#f87171]">*</span></label>
                <div className="form-input-wrap">
                  <Calendar className="form-input-icon" />
                  <input type="date" value={form.start_date}
                    onChange={e => setForm({ ...form, start_date: e.target.value })}
                    className="glass-input w-full" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">End Date <span className="text-[#f87171]">*</span></label>
                <div className="form-input-wrap">
                  <Calendar className="form-input-icon" />
                  <input type="date" value={form.end_date}
                    onChange={e => setForm({ ...form, end_date: e.target.value })}
                    className="glass-input w-full" />
                </div>
              </div>
            </div>
          </div>
          <div className="form-section">
            <div className="form-section-title">Classification</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Academic Year <span className="text-[#f87171]">*</span></label>
                <select value={form.academic_year_id}
                  onChange={e => setForm({ ...form, academic_year_id: e.target.value })}
                  className="glass-input w-full">
                  <option value="" className="bg-[#0b1120]">Select year</option>
                  {academicYears.map((data, i) => (
                    <option key={i} value={data.id} className="bg-[#0b1120]">{data.year_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status <span className="text-[#f87171]">*</span></label>
                <select value={form.is_active}
                  onChange={e => setForm({ ...form, is_active: e.target.value === 'true' })}
                  className="glass-input w-full">
                  <option value={false} className="bg-[#0b1120]">Inactive</option>
                  <option value={true} className="bg-[#0b1120]">Active</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-modal-footer">
          <button onClick={handleClose} className="glass-btn glass-btn-outline flex-1">
            <X className="w-4 h-4" /> Cancel
          </button>
          <button onClick={handleSave}
            disabled={!form.term_name || !form.start_date || !form.end_date || !form.academic_year_id || loadingTerm || loadingUpdate}
            className="glass-btn glass-btn-primary flex-1">
            {(loadingTerm || loadingUpdate) ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {isEdit ? 'Updating...' : 'Saving...'}</>
            ) : (
              <><SaveIcon className="w-4 h-4" /> {isEdit ? 'Update' : 'Save'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AcademicTermMod