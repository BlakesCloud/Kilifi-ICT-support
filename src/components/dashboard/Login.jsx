import { useState } from 'react'
import { useAuth } from '../../hooks/useTickets'
import { ErrorMessage, inputStyle } from '../shared'

export default function Login() {
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(false)
  const { signIn }            = useAuth()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const err = await signIn(email, password)
    if (err) setError('Invalid email or password. Try again.')
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#F9FAFB',
    }}>
      <div style={{
        background: '#fff', borderRadius: 12,
        border: '1px solid #E5E7EB', padding: '2rem',
        width: '100%', maxWidth: 380,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: '#ECFDF5', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 22, margin: '0 auto 1rem',
          }}>🏥</div>
          <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>IT staff login</h1>
          <p style={{ fontSize: 13, color: '#6B7280' }}>Kilifi Hospital IT Support Dashboard</p>
        </div>

        <ErrorMessage message={error} />

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Email address
            </label>
            <input
              type="email" required
              style={inputStyle} value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@kilifi.go.ke"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password" required
              style={inputStyle} value={password}
              onChange={e => setPass(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '10px 0',
              background: '#1D9E75', color: '#fff',
              border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: '1rem' }}>
          Staff accounts are created by the IT administrator.
        </p>
      </div>
    </div>
  )
}
