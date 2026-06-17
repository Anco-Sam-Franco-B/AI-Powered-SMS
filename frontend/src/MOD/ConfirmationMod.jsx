import { useState } from 'react'
import { Trash2Icon, X, AlertTriangle, Loader2 } from 'lucide-react'
import useAcademicStore from '../STORES/AcademicStore'

function ConfirmationMod({ termId, onDelete }) {
  const [show, setShow] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { deleteTerm } = useAcademicStore()

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteTerm(termId)
      setShow(false)
      onDelete?.()
    } catch {
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <button onClick={() => setShow(true)}
        className="glass-btn-ghost p-1.5 rounded-lg" style={{ color: '#f87171' }}>
        <Trash2Icon className="w-3.5 h-3.5" />
      </button>

      {show && (
        <div className="glass-modal-overlay" onClick={() => setShow(false)}>
          <div className="glass-modal max-w-md" onClick={e => e.stopPropagation()}>
            <div className="glass-modal-header">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" style={{ color: '#f59e0b' }} />
                Confirm Delete
              </h3>
              <button onClick={() => setShow(false)} className="glass-btn-ghost p-1.5 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="glass-modal-body">
              <div className="flex items-start gap-4 p-5 rounded-xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(245,158,11,0.1)' }}>
                  <AlertTriangle className="w-6 h-6" style={{ color: '#f59e0b' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1.5">Delete this term?</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    All data gathered for this term will be permanently lost. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-modal-footer">
              <button onClick={() => setShow(false)} className="glass-btn glass-btn-outline flex-1">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="glass-btn glass-btn-danger flex-1">
                {deleting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                ) : (
                  <><Trash2Icon className="w-4 h-4" /> Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ConfirmationMod