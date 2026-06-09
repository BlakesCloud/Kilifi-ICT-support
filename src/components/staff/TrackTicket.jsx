import { useState } from 'react'
import { useTrackTicket } from '../../hooks/useTickets'
import { StatusBadge, PriorityBadge, ErrorMessage, inputStyle } from '../shared'

function timeAgo(iso) {
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 60000)    return 'just now'
  if (ms < 3600000)  return Math.round(ms / 60000) + 'm ago'
  if (ms < 86400000) return Math.round(ms / 3600000) + 'h ago'
  return Math.round(ms / 86400000) + 'd ago'
}

function Row({ label, children }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 0', borderBottom: '1px solid #F3F4F6', fontSize: 13,
    }}>
      <span style={{ color: '#6B7280' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{children}</span>
    </div>
  )
}

export default function TrackTicket() {
  const [input, setInput]          = useState('')
  const { ticket, track, loading, error } = useTrackTicket()

  const handleTrack = (e) => {
    e.preventDefault()
    if (input.trim()) track(input.trim())
  }

  return (
    <div style={cardStyle}>
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #F3F4F6' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Track your request</h2>
        <p style={{ fontSize: 14, color: '#6B7280' }}>
          Enter your ticket number to see the current status.
        </p>
      </div>

      <form onSubmit={handleTrack} style={{ display: 'flex', gap: 8 }}>
        <input
          style={{ ...inputStyle, textTransform: 'uppercase', flex: 1 }}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. KH-0042"
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '8px 20px', background: '#1D9E75', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500,
            cursor: loading ? 'wait' : 'pointer', whiteSpace: 'nowrap',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {loading ? '...' : 'Check status'}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: '1rem' }}>
          <ErrorMessage message={error} />
        </div>
      )}

      {ticket && (
        <div style={{
          marginTop: '1.25rem', border: '1px solid #E5E7EB',
          borderRadius: 10, overflow: 'hidden',
        }}>
          <div style={{
            background: '#F9FAFB', padding: '12px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: '1px solid #E5E7EB',
          }}>
            <span style={{ fontWeight: 600, fontSize: 16 }}>{ticket.ticket_number}</span>
            <StatusBadge status={ticket.status} />
          </div>

          <div style={{ padding: '0 16px' }}>
            <Row label="Category">{ticket.category}</Row>
            <Row label="Department">{ticket.department}</Row>
            <Row label="Priority"><PriorityBadge priority={ticket.priority} /></Row>
            <Row label="Submitted">{timeAgo(ticket.created_at)}</Row>
          </div>

          {ticket.resolution_note && (
            <div style={{
              margin: '0 16px 16px', padding: '12px',
              background: '#F0FDF4', borderRadius: 8,
              border: '1px solid #BBF7D0',
            }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#166534', marginBottom: 4 }}>
                Resolution note from IT
              </p>
              <p style={{ fontSize: 13, color: '#166534', lineHeight: 1.5 }}>
                {ticket.resolution_note}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const cardStyle = {
  background: '#fff', borderRadius: 12,
  border: '1px solid #E5E7EB', padding: '1.75rem',
  maxWidth: 520, margin: '0 auto',
}
