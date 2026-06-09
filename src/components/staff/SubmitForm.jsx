import { useState } from 'react'
import { DEPARTMENTS, CATEGORIES } from '../../lib/constants'
import { useSubmitTicket } from '../../hooks/useTickets'
import { Field, inputStyle, ErrorMessage } from '../shared'

const INITIAL = {
  staffName: '', department: '', contact: '',
  category: '', description: '', priority: 'Normal',
}

// ── Confirmation screen shown after successful submit ──────────────────────
function Confirmation({ ticketNumber, onReset }) {
  return (
    <div style={cardStyle}>
      <div style={{
        width: 60, height: 60, borderRadius: '50%',
        background: '#ECFDF5', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 28, margin: '0 auto 1.25rem',
      }}>✅</div>

      <h2 style={{ textAlign: 'center', fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
        Request submitted
      </h2>
      <p style={{ textAlign: 'center', fontSize: 14, color: '#6B7280', marginBottom: '1.5rem' }}>
        The IT team has been notified and will attend to you shortly.
      </p>

      <div style={{
        background: '#F0FDF4', border: '1px solid #BBF7D0',
        borderRadius: 10, padding: '1.25rem', textAlign: 'center', marginBottom: '1.5rem',
      }}>
        <p style={{ fontSize: 13, color: '#166534', marginBottom: 8 }}>Your ticket number</p>
        <p style={{ fontSize: 32, fontWeight: 700, color: '#15803D', letterSpacing: 2 }}>
          {ticketNumber}
        </p>
        <p style={{ fontSize: 12, color: '#166534', marginTop: 8 }}>
          Write this down — you'll need it to check your request status.
        </p>
      </div>

      <button onClick={onReset} style={secondaryBtn}>
        Submit another request
      </button>
    </div>
  )
}

// ── Category tile grid ─────────────────────────────────────────────────────
function CategoryGrid({ selected, onChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {CATEGORIES.map(cat => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onChange(cat.label)}
          style={{
            padding: '10px 12px',
            border: `1.5px solid ${selected === cat.label ? '#1D9E75' : '#E5E7EB'}`,
            borderRadius: 8, cursor: 'pointer', textAlign: 'left',
            background: selected === cat.label ? '#ECFDF5' : '#fff',
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}
        >
          <span style={{ fontSize: 20, lineHeight: 1 }}>{cat.icon}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: selected === cat.label ? '#065F46' : '#111827' }}>
              {cat.label}
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2, lineHeight: 1.4 }}>
              {cat.description}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

// ── Main form ──────────────────────────────────────────────────────────────
export default function SubmitForm() {
  const [form, setForm]               = useState(INITIAL)
  const [ticketNumber, setTicketNum]  = useState(null)
  const { submit, loading, error }    = useSubmitTicket()

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.staffName || !form.department || !form.category || !form.description) return
    const result = await submit(form)
    if (result) setTicketNum(result.ticketNumber)
  }

  if (ticketNumber) {
    return <Confirmation ticketNumber={ticketNumber} onReset={() => { setForm(INITIAL); setTicketNum(null) }} />
  }

  return (
    <div style={cardStyle}>
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #F3F4F6' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Report an IT issue</h2>
        <p style={{ fontSize: 14, color: '#6B7280' }}>
          Fill in the details below and the IT team will attend to you as soon as possible.
        </p>
      </div>

      <ErrorMessage message={error} />

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Your full name" required>
            <input
              style={inputStyle} value={form.staffName}
              onChange={set('staffName')} placeholder="e.g. Mary Otieno"
              required
            />
          </Field>
          <Field label="Department" required>
            <select style={inputStyle} value={form.department} onChange={set('department')} required>
              <option value="">Select department</option>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Contact (phone or extension)">
          <input
            style={inputStyle} value={form.contact}
            onChange={set('contact')} placeholder="e.g. 0712 345 678 or ext. 204"
          />
        </Field>

        <Field label="What type of issue is this?" required>
          <CategoryGrid selected={form.category} onChange={(cat) => setForm(f => ({ ...f, category: cat }))} />
        </Field>

        <Field label="Describe the problem" required>
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
            value={form.description}
            onChange={set('description')}
            placeholder="e.g. My screen shows a blue error when I try to open KenyaEMR in the morning..."
            required
          />
        </Field>

        <Field label="Priority">
          <div style={{ display: 'flex', gap: 10 }}>
            {['Normal', 'Urgent'].map(p => (
              <button
                key={p} type="button"
                onClick={() => setForm(f => ({ ...f, priority: p }))}
                style={{
                  flex: 1, padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
                  fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
                  border: `1.5px solid ${form.priority === p
                    ? (p === 'Urgent' ? '#F87171' : '#1D9E75')
                    : '#E5E7EB'}`,
                  background: form.priority === p
                    ? (p === 'Urgent' ? '#FEF2F2' : '#ECFDF5')
                    : '#fff',
                  color: form.priority === p
                    ? (p === 'Urgent' ? '#991B1B' : '#065F46')
                    : '#374151',
                }}
              >
                {p === 'Urgent' ? '⚠ Urgent — blocking my work' : '✓ Normal'}
              </button>
            ))}
          </div>
        </Field>

        <button
          type="submit"
          disabled={loading}
          style={{
            ...primaryBtn,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading ? 'Submitting...' : 'Submit request'}
        </button>
      </form>
    </div>
  )
}

const cardStyle = {
  background: '#fff', borderRadius: 12,
  border: '1px solid #E5E7EB', padding: '1.75rem',
  maxWidth: 580, margin: '0 auto',
}

const primaryBtn = {
  width: '100%', padding: '11px 0',
  background: '#1D9E75', color: '#fff',
  border: 'none', borderRadius: 8,
  fontSize: 14, fontWeight: 600,
  cursor: 'pointer', marginTop: '0.5rem',
  fontFamily: 'Inter, sans-serif',
}

const secondaryBtn = {
  width: '100%', padding: '10px 0',
  background: '#fff', color: '#374151',
  border: '1px solid #D1D5DB', borderRadius: 8,
  fontSize: 14, cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
}
