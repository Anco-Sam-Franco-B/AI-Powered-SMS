import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react'
import useAIStore from '../STORES/AIStore'

function ChatBotWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const { chatMessages, chatLoading, chatQuery } = useAIStore()
  const messagesEndRef = useRef(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages])

  const handleSend = async () => {
    if (!input.trim() || chatLoading) return
    const msg = input.trim()
    setInput('')
    await chatQuery(msg)
  }

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center z-50 animate-float"
          style={{ background: 'var(--grad-primary)', boxShadow: '0 4px 24px rgba(14,165,233,0.35)' }}>
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 w-[380px] h-[560px] z-50 flex flex-col rounded-2xl animate-scaleIn"
          style={{
            background: 'rgba(11, 17, 32, 0.95)',
            backdropFilter: 'var(--glass-blur-xl)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(99,102,241,0.1))' }}>
                <Bot className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
                <p className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>Powered by Local LLM</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="glass-btn-ghost p-1.5 rounded-lg"><X className="w-4 h-4" /></button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? '' : ''
                }`}
                  style={msg.role === 'user'
                    ? { background: 'var(--grad-primary)' }
                    : { background: 'rgba(255,255,255,0.06)' }}>
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5" style={{ color: 'var(--accent-blue)' }} />}
                </div>
                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed ${
                  msg.role === 'user' ? 'text-white' : ''
                }`}
                  style={msg.role === 'user'
                    ? { background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(99,102,241,0.1))', border: '1px solid rgba(14,165,233,0.12)' }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <Bot className="w-3.5 h-3.5" style={{ color: 'var(--accent-blue)' }} />
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--accent-blue)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
                  placeholder="Ask anything about your students..."
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl text-xs outline-none transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)' }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(14,165,233,0.25)'
                    e.target.style.background = 'rgba(14,165,233,0.04)'
                    e.target.style.boxShadow = '0 0 16px rgba(14,165,233,0.06)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.06)'
                    e.target.style.background = 'rgba(255,255,255,0.03)'
                    e.target.style.boxShadow = 'none'
                  }} />
                <button onClick={handleSend} disabled={!input.trim() || chatLoading}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-white disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'var(--grad-primary)' }}>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-center mt-2" style={{ color: 'var(--text-subtle)' }}>
              Ask about performance, attendance, at-risk students & more
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatBotWidget
