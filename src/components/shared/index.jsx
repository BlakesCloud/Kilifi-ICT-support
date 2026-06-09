import { STATUS_STYLES, PRIORITY_STYLES } from '../../lib/constants'

// ── Status badge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES['Open']
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
      background: s.bg, color: s.text,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
      {status}
    </span>
  )
}

// ── Priority badge ───────────────────────────────────────────────────────────
export function PriorityBadge({ priority }) {
  const p = PRIORITY_STYLES[priority] || PRIORITY_STYLES['Normal']
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
      background: p.bg, color: p.text,
    }}>
      {priority === 'Urgent' ? '⚠ ' : ''}{priority}
    </span>
  )
}

// ── Stat card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, color = '#374151', bg = '#F9FAFB' }) {
  return (
    <div style={{
      background: bg, borderRadius: 10, padding: '1rem 1.25rem',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <span style={{ fontSize: 26, fontWeight: 600, color }}>{value ?? '—'}</span>
      <span style={{ fontSize: 12, color: '#6B7280' }}>{label}</span>
    </div>
  )
}

// ── Toast notification ───────────────────────────────────────────────────────
export function Toast({ message, visible }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 999,
      background: '#111827', color: '#fff',
      padding: '10px 18px', borderRadius: 8, fontSize: 13,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(8px)',
      transition: 'opacity 0.25s, transform 0.25s',
      pointerEvents: 'none',
    }}>
      {message}
    </div>
  )
}

// ── Loading spinner ──────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        border: '2.5px solid #E5E7EB',
        borderTopColor: '#1D9E75',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

// ── Error message ────────────────────────────────────────────────────────────
export function ErrorMessage({ message }) {
  if (!message) return null
  return (
    <div style={{
      background: '#FEF2F2', border: '1px solid #FECACA',
      borderRadius: 8, padding: '10px 14px',
      color: '#991B1B', fontSize: 13, marginBottom: '1rem',
    }}>
      {message}
    </div>
  )
}

// ── Form field wrapper ───────────────────────────────────────────────────────
export function Field({ label, children, required }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
        {label}{required && <span style={{ color: '#EF4444', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

// ── Input / Select / Textarea base styles (export for reuse) ─────────────────
export const inputStyle = {
  width: '100%', padding: '8px 12px',
  border: '1px solid #D1D5DB', borderRadius: 8,
  fontSize: 14, color: '#111827', background: '#fff',
  fontFamily: 'Inter, sans-serif', outline: 'none',
  boxSizing: 'border-box',
}

// ── Relative time helper ─────────────────────────────────────────────────────
export function timeAgo(iso) {
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 60000)    return 'just now'
  if (ms < 3600000)  return Math.round(ms / 60000) + 'm ago'
  if (ms < 86400000) return Math.round(ms / 3600000) + 'h ago'
  return Math.round(ms / 86400000) + 'd ago'
}
