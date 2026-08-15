import { useState } from 'react'
import { askQinance } from '../api/agent'

export default function AIChat({ customerId, customerName, role = 'agent' }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const context = customerId ? { customer_id: customerId } : {}
      const res = await askQinance(input, role, context)
      const reply = res.data.reply
      setMessages(prev => [...prev, { role: 'assistant', text: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'AI advice unavailable. Please try again later.' }])
    }
    setLoading(false)
  }

  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <h6 className="card-title">
          🤖 Ask Qinance{customerName ? ` — ${customerName}` : ''}
        </h6>
        <div style={{ maxHeight: 250, overflowY: 'auto', marginBottom: 10 }}>
          {messages.map((m, i) => (
            <div key={i} className={`mb-2 p-2 rounded ${m.role === 'user' ? 'bg-light text-end' : 'bg-primary bg-opacity-10'}`}>
              {m.text}
            </div>
          ))}
        </div>
        <div className="d-flex gap-2">
          <input
            className="form-control form-control-sm"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask Qinance anything…"
            disabled={loading}
          />
          <button className="btn btn-primary btn-sm" onClick={send} disabled={loading || !input.trim()}>
            {loading ? '…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}