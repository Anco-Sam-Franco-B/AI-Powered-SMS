import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Brain, TrendingUp, AlertTriangle, Award, BarChart3, RefreshCw, Download, Play, Cpu, Activity, Users, Clock, CheckCircle, Sparkles } from 'lucide-react'
import useAIStore from '../STORES/AIStore'

const tabs = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'predictions', label: 'Predictions', icon: TrendingUp },
  { key: 'attendance', label: 'Attendance Forecast', icon: Clock },
  { key: 'promotions', label: 'Promotions', icon: Award },
  { key: 'models', label: 'Models', icon: Cpu },
]

function AIDashboard() {
  const { batchPredict, predictions, predictionLoading, fetchAnalytics, analytics, analyticsLoading, fetchModels, models, modelsLoading, triggerTraining, generateReport, reportLoading, checkAIStatus, aiStatus } = useAIStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [riskData, setRiskData] = useState([])
  const [promoData, setPromoData] = useState([])
  const [forecastData, setForecastData] = useState([])
  const [trainingStatus, setTrainingStatus] = useState(null)

  useEffect(() => { checkAIStatus(); fetchAnalytics(); fetchModels() }, [])

  useEffect(() => {
    if (activeTab === 'predictions') batchPredict({ student_ids: [] })
    if (activeTab === 'promotions') { useAIStore.getState().fetchPromotionRecommendations().then(d => setPromoData(d?.data || d || [])) }
    if (activeTab === 'attendance') { useAIStore.getState().fetchAttendanceForecast().then(d => setForecastData(d?.data || d || [])) }
    if (activeTab === 'overview') { useAIStore.getState().fetchRiskAnalysis().then(d => setRiskData(d?.data || d || [])) }
  }, [activeTab])

  const handleTrain = async () => {
    const res = await triggerTraining()
    if (res) { toast.success('Training started!'); setTrainingStatus('running'); setTimeout(() => { setTrainingStatus('completed'); fetchModels() }, 5000) }
    else toast.error('Training trigger failed')
  }

  const [reportType, setReportType] = useState('summary')
  const [reportFormat, setReportFormat] = useState('xlsx')

  const reportTypes = [
    { value: 'summary', label: 'Academic Summary' },
    { value: 'performance', label: 'Performance Report' },
    { value: 'attendance', label: 'Attendance Report' },
    { value: 'students', label: 'Student Directory' },
    { value: 'risk', label: 'Risk Analysis' },
  ]

  const reportFormats = [
    { value: 'xlsx', label: 'Excel (.xlsx)' },
    { value: 'pdf', label: 'PDF (.pdf)' },
    { value: 'md', label: 'Markdown (.md)' },
  ]

  const handleReport = async () => {
    try {
      await generateReport({ type: reportType, format: reportFormat })
      toast.success('Report downloaded!')
    } catch { toast.error('Report generation failed') }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fadeInUp">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="section-title">AI Analytics Hub</h1>
            <span className={`glass-badge text-[10px] ${aiStatus ? 'glass-badge-green' : 'glass-badge-red'}`}>
              <Activity className="w-3 h-3" /> {aiStatus ? 'AI Online' : 'Offline'}
            </span>
          </div>
          <p className="section-sub">ML-powered insights, predictions, and automation</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={reportType} onChange={e => setReportType(e.target.value)} className="glass-input text-xs py-1.5 px-2.5 w-auto">
            {reportTypes.map(r => <option key={r.value} value={r.value} className="bg-[#0b1120]">{r.label}</option>)}
          </select>
          <select value={reportFormat} onChange={e => setReportFormat(e.target.value)} className="glass-input text-xs py-1.5 px-2.5 w-auto">
            {reportFormats.map(r => <option key={r.value} value={r.value} className="bg-[#0b1120]">{r.label}</option>)}
          </select>
          <button onClick={handleTrain} className="glass-btn text-xs" style={{ background: 'var(--grad-purple)' }}><Play className="w-3.5 h-3.5" /> Retrain</button>
          <button onClick={handleReport} disabled={reportLoading} className="glass-btn glass-btn-outline text-xs">
            {reportLoading ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" /> Generating...</> : <><Download className="w-3.5 h-3.5" /> Download</>}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl animate-fadeInUp overflow-auto" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {tabs.map(t => {
          const Icon = t.icon
          const active = activeTab === t.key
          return (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap"
              style={{ color: active ? 'white' : 'var(--text-muted)', background: active ? 'rgba(14,165,233,0.1)' : 'transparent', border: active ? '1px solid rgba(14,165,233,0.15)' : '1px solid transparent' }}>
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          )
        })}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-5 animate-fadeInUp">
          <div className="grid grid-cols-4 gap-5">
            {[
              { label: 'Total Students', value: analytics?.total_students || analytics?.student_count || riskData.length || 0, icon: Users, color: 'var(--accent-blue)' },
              { label: 'Avg Performance', value: analytics?.average_performance || analytics?.avg_score || '—', icon: TrendingUp, color: 'var(--accent-emerald)' },
              { label: 'At Risk', value: analytics?.at_risk_count || riskData.filter(r => r.risk_level === 'High' || r.is_at_risk).length || 0, icon: AlertTriangle, color: 'var(--accent-amber)' },
              { label: 'Top Performers', value: analytics?.top_performers?.length || 0, icon: Award, color: 'var(--accent-violet)' },
            ].map((s, i) => (
              <div key={i} className="glass-card p-5 animate-fadeInUp" style={{ animationDelay: `${i*0.06}s` }}>
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                </div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
              </div>
            ))}
          </div>

          {riskData.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Risk Analysis</h3>
              <div className="glass-table-wrap">
                <div className="overflow-x-auto"><table className="glass-table">
                  <thead><tr><th>Student</th><th>Risk Level</th><th>Score</th><th>Factors</th></tr></thead>
                  <tbody>{riskData.slice(0, 10).map((r, i) => (
                    <tr key={i} className="animate-fadeInUp" style={{animationDelay:`${i*0.02}s`}}>
                      <td className="text-sm font-medium text-white">{r.name || r.student_name || `Student #${r.student_id}`}</td>
                      <td><span className={`glass-badge text-[10px] ${r.risk_level === 'High' || r.is_at_risk ? 'glass-badge-red' : r.risk_level === 'Medium' ? 'glass-badge-amber' : 'glass-badge-green'}`}>{r.risk_level || (r.is_at_risk ? 'High' : 'Low')}</span></td>
                      <td className="text-xs" style={{color:'var(--text-secondary)'}}>{r.risk_score || r.score || '—'}</td>
                      <td className="text-xs" style={{color:'var(--text-muted)'}}>{r.factors?.join(', ') || r.reason || '—'}</td>
                    </tr>
                  ))}</tbody>
                </table></div>
              </div>
            </div>
          )}
          {riskData.length === 0 && (
            <div className="glass-card p-12"><div className="empty-state"><BarChart3 className="w-8 h-8" style={{color:'var(--text-muted)'}} /><p className="empty-state-title">No data available</p><p className="empty-state-desc">Upload data and train models to see AI insights</p></div></div>
          )}
        </div>
      )}

      {/* Predictions */}
      {activeTab === 'predictions' && (
        <div className="glass-card p-6 animate-fadeInUp">
          <h3 className="text-sm font-semibold text-white mb-4">Performance Predictions</h3>
          {predictionLoading ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-[var(--accent-blue)] border-t-transparent animate-spin" /></div>
          ) : predictions.length === 0 ? (
            <div className="empty-state py-8"><Brain className="w-8 h-8" style={{color:'var(--text-muted)'}} /><p className="empty-state-title">No predictions yet</p><p className="empty-state-desc">Upload data and retrain models</p></div>
          ) : (
            <div className="glass-table-wrap"><div className="overflow-x-auto"><table className="glass-table">
              <thead><tr><th>Student</th><th>Predicted Score</th><th>Confidence</th><th>Risk</th><th>Recommendation</th></tr></thead>
              <tbody>{predictions.map((p, i) => (
                <tr key={i} className="animate-fadeInUp" style={{animationDelay:`${i*0.02}s`}}>
                  <td className="text-sm font-medium text-white">{p.name || p.student_name || `Student #${p.student_id}`}</td>
                  <td className="text-xs" style={{color:'var(--text-secondary)'}}>{p.predicted_score || p.score || '—'}</td>
                  <td className="text-xs" style={{color:'var(--text-secondary)'}}>{p.confidence ? `${(p.confidence*100).toFixed(0)}%` : '—'}</td>
                  <td><span className={`glass-badge text-[10px] ${p.risk === 'High' || p.is_at_risk ? 'glass-badge-red' : p.risk === 'Medium' ? 'glass-badge-amber' : 'glass-badge-green'}`}>{p.risk || 'Low'}</span></td>
                  <td className="text-xs" style={{color:'var(--text-muted)'}}>{p.recommendation || p.intervention || '—'}</td>
                </tr>
              ))}</tbody></table></div></div>
          )}
        </div>
      )}

      {/* Attendance Forecast */}
      {activeTab === 'attendance' && (
        <div className="glass-card p-6 animate-fadeInUp">
          <h3 className="text-sm font-semibold text-white mb-4">Attendance Forecast</h3>
          {forecastData.length === 0 ? (
            <div className="empty-state py-8"><Clock className="w-8 h-8" style={{color:'var(--text-muted)'}} /><p className="empty-state-title">No forecast data</p></div>
          ) : (
            <div className="glass-table-wrap"><div className="overflow-x-auto"><table className="glass-table">
              <thead><tr><th>Student</th><th>Current Rate</th><th>Predicted Rate</th><th>Trend</th><th>Alert</th></tr></thead>
              <tbody>{forecastData.map((f, i) => (
                <tr key={i} className="animate-fadeInUp" style={{animationDelay:`${i*0.02}s`}}>
                  <td className="text-sm font-medium text-white">{f.name || f.student_name || `Student #${f.student_id}`}</td>
                  <td className="text-xs" style={{color:'var(--text-secondary)'}}>{f.current_rate || f.current_attendance || '—'}%</td>
                  <td className="text-xs" style={{color:'var(--text-secondary)'}}>{f.predicted_rate || f.forecast || '—'}%</td>
                  <td><span className={`glass-badge text-[10px] ${(f.trend||'').toLowerCase()==='declining'||(f.predicted_rate||0)<(f.current_rate||0) ? 'glass-badge-red' : 'glass-badge-green'}`}>{f.trend || ((f.predicted_rate||0)>=(f.current_rate||0) ? 'Improving' : 'Declining')}</span></td>
                  <td className="text-xs" style={{color:'var(--text-muted)'}}>{f.alert || '—'}</td>
                </tr>
              ))}</tbody></table></div></div>
          )}
        </div>
      )}

      {/* Promotions */}
      {activeTab === 'promotions' && (
        <div className="glass-card p-6 animate-fadeInUp">
          <h3 className="text-sm font-semibold text-white mb-4">Promotion Recommendations</h3>
          {promoData.length === 0 ? (
            <div className="empty-state py-8"><Award className="w-8 h-8" style={{color:'var(--text-muted)'}} /><p className="empty-state-title">No data available</p></div>
          ) : (
            <div className="glass-table-wrap"><div className="overflow-x-auto"><table className="glass-table">
              <thead><tr><th>Student</th><th>Current Grade</th><th>Recommendation</th><th>Confidence</th><th>Notes</th></tr></thead>
              <tbody>{promoData.map((p, i) => (
                <tr key={i} className="animate-fadeInUp" style={{animationDelay:`${i*0.02}s`}}>
                  <td className="text-sm font-medium text-white">{p.name || p.student_name || `Student #${p.student_id}`}</td>
                  <td className="text-xs" style={{color:'var(--text-secondary)'}}>{p.current_grade || p.grade || '—'}</td>
                  <td><span className={`glass-badge text-[10px] ${p.recommendation === 'Promote' || p.should_promote ? 'glass-badge-green' : p.recommendation === 'Conditional' ? 'glass-badge-amber' : 'glass-badge-red'}`}>{p.recommendation || (p.should_promote ? 'Promote' : 'Retain')}</span></td>
                  <td className="text-xs" style={{color:'var(--text-secondary)'}}>{p.confidence ? `${(p.confidence*100).toFixed(0)}%` : '—'}</td>
                  <td className="text-xs" style={{color:'var(--text-muted)'}}>{p.notes || p.reason || '—'}</td>
                </tr>
              ))}</tbody></table></div></div>
          )}
        </div>
      )}

      {/* Models */}
      {activeTab === 'models' && (
        <div className="space-y-5 animate-fadeInUp">
          {trainingStatus && (
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium ${
              trainingStatus === 'running' ? 'bg-amber-500/10 border border-amber-500/15' : 'bg-emerald-500/10 border border-emerald-500/15'
            }`} style={{ color: trainingStatus === 'running' ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
              {trainingStatus === 'running' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              {trainingStatus === 'running' ? 'Training in progress...' : 'Training complete'}
            </div>
          )}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Model Registry</h3>
            {modelsLoading ? (
              <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-[var(--accent-blue)] border-t-transparent animate-spin" /></div>
            ) : models.length === 0 ? (
              <div className="empty-state py-8"><Cpu className="w-8 h-8" style={{color:'var(--text-muted)'}} /><p className="empty-state-title">No models trained</p><p className="empty-state-desc">Click "Retrain" to start training</p></div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {models.map((m, i) => (
                  <div key={i} className="p-5 rounded-xl animate-fadeInUp" style={{animationDelay:`${i*0.06}s`, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)'}}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-medium text-white">{m.name || m.model_name || `Model #${m.id}`}</h4>
                        <p className="text-[10px] font-mono" style={{color:'var(--text-subtle)'}}>v{m.version || m.model_version || '1.0'}</p>
                      </div>
                      <span className={`glass-badge text-[10px] ${m.status === 'active' || m.is_champion ? 'glass-badge-green' : m.status === 'challenger' ? 'glass-badge-amber' : 'glass-badge-cyan'}`}>{m.status || (m.is_champion ? 'Champion' : 'Challenger')}</span>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      {[
                        { label: 'Accuracy', value: m.accuracy || m.metrics?.accuracy || '—' },
                        { label: 'Trained', value: (m.trained_at||m.created_at||'').slice(0,10) || '—' },
                        { label: 'Type', value: m.model_type || m.type || '—' },
                      ].map((r, j) => (
                        <div key={j} className="flex justify-between"><span style={{color:'var(--text-muted)'}}>{r.label}</span><span style={{color:'var(--text-secondary)'}}>{r.value}</span></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AIDashboard
