import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crown, LockKeyhole, LogIn, UserRound } from 'lucide-react'
import { login } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { Alert, Button, GlassCard, Input } from '../components/ui'

export default function Login() {
  const { loginUser } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await login(form.username, form.password)
      loginUser({ access: data.access, refresh: data.refresh }, data.user)
      navigate(data.user.is_staff ? '/admin/dashboard' : '/dashboard')
    } catch (err) {
      if (!err.response) setError(`Network error — cannot reach server. (${err.message})`)
      else {
        const data = err.response.data
        setError(data?.detail || data?.non_field_errors?.[0] || JSON.stringify(data) || `Error ${err.response.status}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="login-screen">
      <div className="ambient-orb ambient-orb--one" />
      <div className="ambient-orb ambient-orb--two" />
      <div className="login-layout">
        <div className="login-hero">
          <span className="brand-mark brand-mark--large"><Crown size={30} /></span>
          <p className="eyebrow">Private financial operating system</p>
          <h1>Finance, elevated.</h1>
          <p className="login-hero__copy">A precise, secure workspace built for the people shaping Eswatini's financial future.</p>
          <div className="login-proof"><span /> Encrypted access · Live portfolio intelligence</div>
        </div>

        <GlassCard className="login-card">
          <div className="login-card__heading">
            <p className="eyebrow">Qinance</p>
            <h2>Welcome back</h2>
            <p>Sign in to continue to your workspace.</p>
          </div>
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          <form className="login-form" onSubmit={handleSubmit}>
            <Input label="Username" icon={<UserRound size={18} />} autoComplete="username" autoFocus value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required />
            <Input label="Password" icon={<LockKeyhole size={18} />} type="password" autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
            <Button variant="primary" size="lg" className="login-submit" disabled={loading}>
              <LogIn size={19} /> {loading ? 'Signing in…' : 'Sign in securely'}
            </Button>
          </form>
          <p className="login-card__footnote">Kings of Future Finance</p>
        </GlassCard>
      </div>
    </section>
  )
}
