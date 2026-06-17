import { useState, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, Database, ChevronDown, ChevronRight, Table2, Eye } from 'lucide-react'
import useDataStore from '../STORES/DataStore'
import * as XLSX from 'xlsx'

function UploadData() {
  const { uploadExcel } = useDataStore()
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [previewData, setPreviewData] = useState(null)
  const [expandedSheets, setExpandedSheets] = useState({})
  const fileRef = useRef()

  const parseExcel = useCallback((f) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheets = workbook.SheetNames.map((name) => {
          const sheet = workbook.Sheets[name]
          const rows = XLSX.utils.sheet_to_json(sheet)
          const columns = rows.length > 0 ? Object.keys(rows[0]) : []
          return { name, rows, columns, rowCount: rows.length }
        })
        setPreviewData(sheets)
        setExpandedSheets({})
      } catch (err) {
        toast.error('Failed to parse Excel file')
        setPreviewData(null)
      }
    }
    reader.onerror = () => toast.error('Failed to read file')
    reader.readAsArrayBuffer(f)
  }, [])

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && (f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.csv'))) {
      setFile(f)
      setResult(null)
      parseExcel(f)
    } else toast.error('Please upload an Excel (.xlsx/.xls) or CSV file')
  }

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (f) { setFile(f); setResult(null); parseExcel(f) }
  }

  const removeFile = () => { setFile(null); setPreviewData(null); setResult(null) }

  const handleUpload = async () => {
    if (!file) return toast.error('Select a file first')
    setUploading(true); setResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await uploadExcel(fd)
      setResult({ success: true, message: `Uploaded to "${res.table}" table — ${res.count} records` })
      toast.success('Upload complete!')
      setFile(null)
      setPreviewData(null)
    } catch (err) {
      const data = err.response?.data || {}
      const msg = data.error || data.message || err.message || 'Upload failed'
      setResult({ success: false, message: msg, details: data.details, detectedColumns: data.detected_columns, hints: data.hints })
      toast.error('Upload failed')
    } finally { setUploading(false) }
  }

  const toggleSheet = (name) => setExpandedSheets((prev) => ({ ...prev, [name]: !prev[name] }))

  const normalizeCol = (k) => k.trim().replace(/[\s_-]+/g, '_').toLowerCase().replace(/^_|_$/g, '')

  const detectedTable = (columns) => {
    const c = columns.map(normalizeCol)
    if (c.includes('first_name') && c.includes('last_name')) return 'students'
    if (c.includes('course_code') && c.includes('course_name')) return 'courses'
    if (c.some(k => ['marks_obtained', 'marks', 'score', 'mark'].includes(k))) return 'marks'
    if (c.includes('status') && c.some(k => ['date', 'class_date'].includes(k))) return 'attendance'
    return 'unknown'
  }

  const tableColor = (table) => {
    const map = { students: 'var(--accent-blue)', courses: 'var(--accent-violet)', marks: 'var(--accent-emerald)', attendance: 'var(--accent-amber)' }
    return map[table] || 'var(--text-muted)'
  }

  const PREVIEW_LIMIT = 500
  const [previewOffsets, setPreviewOffsets] = useState({})

  return (
    <div className="space-y-6">
      <div className="animate-fadeInUp">
        <h1 className="section-title">Upload Data</h1>
        <p className="section-sub">Import student records, marks, and attendance from Excel</p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Upload Card */}
        <div className="glass-card p-6 col-span-3 animate-fadeInUp">
          <div
            className={`upload-zone ${dragging ? 'dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
            {file ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <FileSpreadsheet className="w-8 h-8" style={{ color: 'var(--accent-emerald)' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{file.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-subtle)' }}>{(file.size / 1024).toFixed(1)} KB{previewData ? ` · ${previewData.reduce((s, sh) => s + sh.rowCount, 0)} rows across ${previewData.length} sheet(s)` : ''}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeFile() }}
                  className="px-3 py-1 rounded-lg text-xs font-medium transition-all hover:bg-red-500/10"
                  style={{ color: '#f87171', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <FileSpreadsheet className="w-3 h-3 inline mr-1" />Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <UploadCloud className="w-8 h-8" style={{ color: dragging ? 'var(--accent-blue)' : 'var(--text-muted)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Drop your file here or <span style={{ color: 'var(--accent-blue)' }}>browse</span></p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-subtle)' }}>Supports .xlsx, .xls, .csv &middot; Max 50MB</p>
                </div>
              </div>
            )}
          </div>

          <button onClick={handleUpload} disabled={!file || uploading}
            className="w-full mt-4 glass-btn glass-btn-primary py-3 disabled:opacity-50">
            {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><UploadCloud className="w-4 h-4" /> Upload & Process</>}
          </button>

          {result && (
            <div className={`mt-4 p-4 rounded-xl flex flex-col gap-2 text-sm ${result.success ? '' : ''}`}
              style={{ background: result.success ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${result.success ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'}` }}>
              <div className="flex items-start gap-3">
                {result.success ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--accent-emerald)' }} /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#f87171' }} />}
                <span style={{ color: result.success ? 'var(--accent-emerald)' : '#f87171' }}>{result.message}</span>
              </div>

              {/* Detected columns hint */}
              {result.detectedColumns && Array.isArray(result.detectedColumns) && (
                <div className="ml-7 space-y-1">
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Detected columns:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.detectedColumns.map((col, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Hints */}
              {result.hints && Array.isArray(result.hints) && (
                <div className="ml-7 space-y-1">
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Suggestions:</p>
                  {result.hints.map((h, i) => (
                    <p key={i} className="text-xs" style={{ color: 'var(--accent-amber)' }}>{h}</p>
                  ))}
                </div>
              )}

              {/* Validation details */}
              {result.details && Array.isArray(result.details) && (
                <ul className="ml-7 space-y-1">
                  {result.details.slice(0, 10).map((d, i) => (
                    <li key={i} className="text-xs" style={{ color: 'var(--text-muted)' }}>&bull; {typeof d === 'string' ? d : JSON.stringify(d)}</li>
                  ))}
                  {result.details.length > 10 && <li className="text-xs" style={{ color: 'var(--text-muted)' }}>&hellip; and {result.details.length - 10} more</li>}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Guidelines */}
        <div className="glass-card p-6 col-span-2 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-sm font-semibold text-white mb-4">Format Guidelines</h3>
          <div className="space-y-3">
            {[
              { title: 'Students', desc: 'first_name, last_name, email, phone, date_of_birth, gender, class_id', color: 'var(--accent-blue)' },
              { title: 'Marks', desc: 'student_id, course_id, marks_obtained, total_marks, exam_type', color: 'var(--accent-violet)' },
              { title: 'Attendance', desc: 'student_id, date, status (Present/Absent/Late/Excused)', color: 'var(--accent-amber)' },
            ].map((s, i) => (
              <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <p className="text-xs font-medium text-white">{s.title}</p>
                </div>
                <p className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-xl flex items-start gap-3" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.1)' }}>
            <Database className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--accent-blue)' }} />
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--accent-blue)' }}>AI Auto-Trigger</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Models retrain automatically after upload</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Sections */}
      {previewData && previewData.length > 0 && (
        <div className="space-y-4 animate-fadeInUp" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
            <span className="text-sm font-semibold text-white">Data Preview ({previewData.reduce((s, sh) => s + sh.rowCount, 0)} rows)</span>
          </div>

          {previewData.map((sheet, idx) => {
            const table = detectedTable(sheet.columns)
            const isOpen = expandedSheets[sheet.name]
            return (
              <div key={idx} className="glass-card overflow-hidden" style={{ border: `1px solid ${tableColor(table)}22` }}>
                {/* Sheet Header */}
                <button
                  onClick={() => toggleSheet(sheet.name)}
                  className="w-full flex items-center justify-between p-4 hover:opacity-80 transition-opacity"
                  style={{ borderBottom: isOpen ? '1px solid var(--glass-border)' : 'none' }}>
                  <div className="flex items-center gap-3">
                    {isOpen ? <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /> : <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
                    <Table2 className="w-4 h-4" style={{ color: tableColor(table) }} />
                    <div className="text-left">
                      <span className="text-sm font-medium text-white">{sheet.name}</span>
                      <span className="text-xs ml-2" style={{ color: 'var(--text-subtle)' }}>{sheet.rowCount} rows</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full capitalize"
                    style={{ background: `${tableColor(table)}18`, color: tableColor(table), border: `1px solid ${tableColor(table)}22` }}>
                    {table}
                  </span>
                </button>

                {/* Table Body */}
                {isOpen && (() => {
                  const offset = previewOffsets[sheet.name] || 0
                  const visible = sheet.rows.slice(offset, offset + PREVIEW_LIMIT)
                  const total = sheet.rowCount
                  return (
                    <div className="overflow-x-auto" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <table className="w-full text-xs">
                        <thead>
                          <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <th className="px-3 py-2 text-left font-medium" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>#</th>
                            {sheet.columns.map((col, ci) => (
                              <th key={ci} className="px-3 py-2 text-left font-medium whitespace-nowrap" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {visible.map((row, ri) => (
                            <tr key={ri} className="transition-colors hover:bg-white/[0.02]">
                              <td className="px-3 py-1.5 whitespace-nowrap" style={{ color: 'var(--text-subtle)', borderBottom: '1px solid var(--glass-border)' }}>{offset + ri + 1}</td>
                              {sheet.columns.map((col, ci) => (
                                <td key={ci} className="px-3 py-1.5 whitespace-nowrap text-white/80" style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                  {row[col] != null ? String(row[col]) : <span style={{ color: 'var(--text-subtle)' }}>&mdash;</span>}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="flex items-center justify-between p-3 text-xs" style={{ color: 'var(--text-subtle)' }}>
                        <span>Showing {offset + 1}–{Math.min(offset + PREVIEW_LIMIT, total)} of {total} rows</span>
                        <div className="flex gap-2">
                          <button disabled={offset === 0} onClick={() => setPreviewOffsets(p => ({ ...p, [sheet.name]: Math.max(0, offset - PREVIEW_LIMIT) }))}
                            className="px-3 py-1 rounded-lg transition-colors disabled:opacity-30 hover:bg-white/[0.04]"
                            style={{ border: '1px solid var(--glass-border)' }}>Prev</button>
                          <button disabled={offset + PREVIEW_LIMIT >= total} onClick={() => setPreviewOffsets(p => ({ ...p, [sheet.name]: offset + PREVIEW_LIMIT }))}
                            className="px-3 py-1 rounded-lg transition-colors disabled:opacity-30 hover:bg-white/[0.04]"
                            style={{ border: '1px solid var(--glass-border)' }}>Next</button>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default UploadData
