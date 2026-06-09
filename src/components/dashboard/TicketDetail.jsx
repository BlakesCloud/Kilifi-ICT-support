import { useState, useEffect } from 'react'
import { useUpdateTicket } from '../../hooks/useTickets'
import { StatusBadge, PriorityBadge, inputStyle } from '../shared'

function timeAgo(iso) {
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 60000)    return 'just now'
  if (ms < 3600000)  return Math.round(ms / 60000) + 'm ago'
  if (ms < 86400000) return Math.round(ms / 3600000) + 'h ago'
  return Math.round(ms / 86400000) + 'd ago'
}

export default function TicketDetail({ ticket, onClose, onSaved }) {
  const [status, setStatus] = useState(ticket.status)
  const [note, setNote]     = useState(ticket.resolution_note || '')
  const { update, loading } = useUpdateTicket()

  useEffect(() => {
    setStatus(ticket.status)
    setNote(ticket.resolution_note || '')
  }, [ticket])

  const handleSave = async () => {
    const ok = await update(ticket.id, { status, resolution_note: note })
    if (ok) onSaved()
  }

  return (
    <div style={{
      background: '#fff', border: '1px solid #E5E7EB',
      borderRadius: 12, padding: '1.5rem', marginTop: '1rem',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '1.25rem',
        paddingBottom: '1rem', borderBottom: '1px solid #F3F4F6',
      }}>
        <div>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Ticket detail</p>
          <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 2 }}>
            {ticket.ticket_number} — {ticket.category}
          </h3>
          <p style={{ fontSize: 12, color: '#9CA3AF' }}>Submitted {timeAgo(ticket.created_at)}</p>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '6px 12px', border: '1px solid #E5E7EB',
            borderRadius: 8, background: '#fff', cursor: 'pointer',
            fontSize: 13, color: '#6B7280', fontFamily: 'Inter, sans-serif',
          }}
        >
          ✕ Close
        </button>
      </div>

      {/* Staff info */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        gap: 12, marginBottom: '1.25rem',
      }}>
        {[
          ['Staff name',  ticket.staff_name],
          ['Department',  ticket.department],
          ['Contact',     ticket.contact || '—'],
        ].map(([label, value]) => (
          <div key={label} style={{
            background: '#F9FAFB', borderRadius: 8, padding: '10px 12px',
          }}>
            <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 3 }}>{label}</p>
            <p style={{ fontSize: 13, fontWeight: 500 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Priority */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', gap: 8, alignItems: 'center' }}>
        <PriorityBadge priority={ticket.priority} />
        <StatusBadge status={ticket.status} />
      </div>

      {/* Description */}
      <div style={{
        background: '#F9FAFB', borderRadius: 8,
        padding: '12px 14px', marginBottom: '1.25rem',
        border: '1px solid #F3F4F6',
      }}>
        <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 6 }}>Problem description</p>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: '#111827' }}>{ticket.description}</p>
      </div>

      {/* Update status */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
          Update status
        </label>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          style={{ ...inputStyle, width: 'auto', minWidth: 180 }}
        >
          <option>Open</option>
          <option>In Progress</option>
          <option>Resolved</option>
        </select>
      </div>

      {/* Resolution note */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
          Resolution / technician note
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Describe what you did to resolve the issue. This will be visible to the staff member."
          style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            padding: '9px 20px', background: '#1D9E75', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
            cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {loading ? 'Saving...' : 'Save changes'}
        </button>
        <button
          onClick={onClose}
          style={{
            padding: '9px 16px', background: '#fff', color: '#374151',
            border: '1px solid #D1D5DB', borderRadius: 8,
            fontSize: 13, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
