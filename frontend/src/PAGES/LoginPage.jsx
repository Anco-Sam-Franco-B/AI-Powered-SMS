import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react'

function LoginPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.password || (isLogin ? !form.email : !form.username || !form.email)) {
      return toast.error('Please fill all required fields')
    }
    setLoading(true)
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup'
      const payload = isLogin ? { username: form.email, password: form.password } : form
      const { data } = await axios.post(`http://localhost:5000/api/v1${endpoint}`, payload)
      if (!isLogin) {
        toast.success('Account created! Please log in.')
        setIsLogin(true)
        setForm({ username: '', email: '', password: '' })
      } else {
        localStorage.setItem('token', data.userToken)
        toast.success(`Welcome back, ${data.user?.username || form.email}!`)
        onLogin(data.user || { username: form.email, email: form.email, role: 'Teacher' })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-8 animate-fadeInUp">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
            style={{
              background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(99,102,241,0.1))',
              border: '1px solid rgba(14,165,233,0.15)',
              boxShadow: '0 8px 32px rgba(14,165,233,0.08)',
            }}>
            <GraduationCap className="w-8 h-8" style={{ color: 'var(--accent-blue)' }} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-white">Student</span>
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--grad-primary)' }}> Management</span>
          </h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>AI-Powered School Administration</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 animate-scaleIn"
          style={{
            background: 'rgba(11, 17, 32, 0.8)',
            backdropFilter: 'blur(48px)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          }}>
          {/* Tabs */}
          <div className="flex mb-6 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            {['Sign In', 'Sign Up'].map((label, i) => {
              const active = (i === 0) === isLogin
              return (
                <button key={label} onClick={() => { setIsLogin(i === 0); setForm({ username: '', email: '', password: '' }) }}
                  className="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300"
                  style={{
                    color: active ? 'white' : 'var(--text-muted)',
                    background: active ? 'linear-gradient(135deg, rgba(14,165,233,0.12), rgba(99,102,241,0.08))' : 'transparent',
                    border: active ? '1px solid rgba(14,165,233,0.15)' : '1px solid transparent',
                  }}>
                  {label}
                </button>
              )
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="form-input-wrap">
                <User className="form-input-icon" />
                <input type="text" placeholder="Username" value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="glass-input w-full pl-11 pr-4 py-3 rounded-xl text-sm" />
              </div>
            )}
            <div className="form-input-wrap">
              <Mail className="form-input-icon" />
              <input type="email" placeholder="Email address" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="glass-input w-full pl-11 pr-4 py-3 rounded-xl text-sm" />
            </div>
            <div className="form-input-wrap">
              <Lock className="form-input-icon" />
              <input type={showPw ? 'text' : 'password'} placeholder="Password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="glass-input w-full pl-11 pr-11 py-3 rounded-xl text-sm" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'var(--text-subtle)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-subtle)'}>
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 disabled:opacity-50 relative overflow-hidden group hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]"
              style={{ background: 'var(--grad-primary)', boxShadow: '0 4px 20px rgba(14,165,233,0.25)' }}>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : (
                  <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" /></>
                )}
              </span>
            </button>
          </form>

          <div className="mt-6 pt-5 text-center border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => { setIsLogin(!isLogin); setForm({ username: '', email: '', password: '' }) }}
                className="font-medium transition-colors"
                style={{ color: 'var(--accent-blue)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#7dd3fc'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--accent-blue)'}>
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: 'var(--text-subtle)' }}>
          Powered by AI &middot; All data processed locally
        </p>
      </div>
    </div>
  )
}

export default LoginPage
