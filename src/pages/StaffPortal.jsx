import { useState } from 'react'
import SubmitForm from '../components/staff/SubmitForm'
import TrackTicket from '../components/staff/TrackTicket'

const TABS = [
  { id: 'submit', label: '+ Submit request' },
  { id: 'track',  label: '🔍 Track my ticket' },
]

export default function StaffPortal() {
  const [tab, setTab] = useState('submit')

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Nav */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #E5E7EB',
        padding: '0 1.5rem', height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: '#1D9E75',
          }} />
          <span style={{ fontWeight: 600, fontSize: 15 }}>Kilifi Hospital IT Support</span>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '6px 14px', borderRadius: 6, fontSize: 13,
                cursor: 'pointer', border: 'none',
                background: tab === t.id ? '#F3F4F6' : 'transparent',
                color: tab === t.id ? '#111827' : '#6B7280',
                fontWeight: tab === t.id ? 500 : 400,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '2rem 1.5rem' }}>
        {tab === 'submit' && <SubmitForm />}
        {tab === 'track'  && <TrackTicket />}
      </div>
    </div>
  )
}
