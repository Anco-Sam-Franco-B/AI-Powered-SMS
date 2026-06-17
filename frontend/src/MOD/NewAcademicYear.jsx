import { useState } from 'react'
import { SaveIcon, X, Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import useAcademicStore from '../STORES/AcademicStore'

function NewAcademicYear({ open, onClose }) {
  const { loadingAc, newAcademic, messagesForm, setMessagesForms } = useAcademicStore()
  const [form, setForm] = useState({ yearname: '', isActive: false })

  const handleClose = () => {
    setForm({ yearname: '', isActive: false })
    setMessagesForms({ type: '', text: '' })
    onClose?.()
  }

  const handleSave = async () => {
    if (!form.yearname) return
    await newAcademic(form)
    if (!messagesForm.type || messagesForm.type === 'success') {
      setForm({ yearname: '', isActive: false })
    }
  }

  if (!open) return null

  return (
    <div className="glass-modal-overlay" onClick={handleClose}>
      <div className="glass-modal max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="glass-modal-header">
          <h3 className="text-base font-bold text-white">New Academic Year</h3>
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
            <div className="form-section-title">Year Information</div>
            <div className="form-group">
              <label className="form-label">Academic Name <span className="text-[#f87171]">*</span></label>
              <div className="form-input-wrap">
                <Calendar className="form-input-icon" />
                <input type="text" placeholder="e.g. 2025-2026" value={form.yearname}
                  onChange={e => setForm({ ...form, yearname: e.target.value })}
                  className="glass-input w-full" />
              </div>
            </div>
            <div className="form-group mt-4">
              <label className="form-label">Status <span className="text-[#f87171]">*</span></label>
              <select value={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.value })}
                className="glass-input w-full">
                <option value={false} className="bg-[#0b1120]">Inactive</option>
                <option value={true} className="bg-[#0b1120]">Active</option>
              </select>
            </div>
          </div>
        </div>

        <div className="glass-modal-footer">
          <button onClick={handleClose} className="glass-btn glass-btn-outline flex-1">
            <X className="w-4 h-4" /> Cancel
          </button>
          <button onClick={handleSave} disabled={!form.yearname || loadingAc}
            className="glass-btn glass-btn-primary flex-1">
            {loadingAc ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : (
              <><SaveIcon className="w-4 h-4" /> Save</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewAcademicYear