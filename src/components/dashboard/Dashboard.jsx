import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTickets, useStats, useAuth } from '../../hooks/useTickets'
import { StatusBadge, PriorityBadge, StatCard, Spinner, Toast } from '../shared'
import TicketDetail from './TicketDetail'
import Login from './Login'

function timeAgo(iso) {
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 60000)    return 'just now'
  if (ms < 3600000)  return Math.round(ms / 60000) + 'm ago'
  if (ms < 86400000) return Math.round(ms / 3600000) + 'h ago'
  return Math.round(ms / 86400000) + 'd ago'
}

const FILTERS = [
  { label: 'All',         value: 'all' },
  { label: 'Open',        value: 'Open' },
  { label: 'In progress', value: 'In Progress' },
  { label: 'Resolved',    value: 'Resolved' },
]

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [filter, setFilter]       = useState('all')
  const [selected, setSelected]   = useState(null)
  const [toast, setToast]         = useState({ visible: false, msg: '' })
  const { tickets, loading, refetch } = useTickets(filter)
  const { stats }                 = useStats()

  const showToast = (msg) => {
    setToast({ visible: true, msg })
    setTimeout(() => setToast({ visible: false, msg: '' }), 2500)
  }

  if (authLoading) return <Spinner />
  if (!user)       return <Login />

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Top bar */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #E5E7EB',
        padding: '0 1.5rem', height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>🏥</span>
          <span style={{ fontWeight: 600, fontSize: 15 }}>IT Support Dashboard</span>
          <span style={{
            fontSize: 11, background: '#ECFDF5', color: '#065F46',
            padding: '2px 8px', borderRadius: 12, fontWeight: 500,
          }}>Live</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#6B7280' }}>{user.email}</span>
          <button
            onClick={signOut}
            style={{
              padding: '5px 12px', border: '1px solid #E5E7EB',
              borderRadius: 6, background: '#fff', cursor: 'pointer',
              fontSize: 12, color: '#6B7280', fontFamily: 'Inter, sans-serif',
            }}
          >Sign out</button>
          <Link
            to="/"
            style={{
              padding: '5px 12px', border: '1px solid #E5E7EB',
              borderRadius: 6, background: '#fff', cursor: 'pointer',
              fontSize: 12, color: '#6B7280', fontFamily: 'Inter, sans-serif',
              textDecoration: 'none',
            }}
          >← Staff portal</Link>
        </div>
      </div>

      <div style={{ padding: '1.5rem', maxWidth: 1100, margin: '0 auto' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: '1.25rem' }}>
          <StatCard label="Open"          value={stats?.open}        color="#1D4ED8" bg="#EFF6FF" />
          <StatCard label="In progress"   value={stats?.inProgress}  color="#92400E" bg="#FFFBEB" />
          <StatCard label="Resolved"      value={stats?.resolved}    color="#166534" bg="#F0FDF4" />
          <StatCard label="Urgent open"   value={stats?.urgentOpen}  color="#991B1B" bg="#FEF2F2" />
        </div>

        {/* Ticket table */}
        <div style={{
          background: '#fff', border: '1px solid #E5E7EB',
          borderRadius: 12, overflow: 'hidden',
        }}>
          {/* Toolbar */}
          <div style={{
            padding: '10px 1rem', borderBottom: '1px solid #F3F4F6',
            display: 'flex', gap: 6, alignItems: 'center',
          }}>
            <span style={{ fontSize: 12, color: '#9CA3AF', marginRight: 4 }}>Filter:</span>
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => { setFilter(f.value); setSelected(null) }}
                style={{
                  padding: '5px 12px', borderRadius: 6, fontSize: 12,
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  border: filter === f.value ? '1px solid #D1D5DB' : '1px solid transparent',
                  background: filter === f.value ? '#F3F4F6' : 'transparent',
                  fontWeight: filter === f.value ? 500 : 400,
                  color: filter === f.value ? '#111827' : '#6B7280',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Table */}
          {loading ? <Spinner /> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['Ticket', 'Category', 'Department', 'Staff', 'Priority', 'Status', 'Time'].map(h => (
                    <th key={h} style={{
                      padding: '9px 1rem', textAlign: 'left',
                      fontSize: 12, fontWeight: 500, color: '#6B7280',
                      borderBottom: '1px solid #E5E7EB',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
                    No tickets found.
                  </td></tr>
                ) : tickets.map(t => (
                  <tr
                    key={t.id}
                    onClick={() => setSelected(selected?.id === t.id ? null : t)}
                    style={{
                      cursor: 'pointer',
                      background: selected?.id === t.id ? '#F0FDF4' : 'transparent',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { if (selected?.id !== t.id) e.currentTarget.style.background = '#F9FAFB' }}
                    onMouseLeave={e => { if (selected?.id !== t.id) e.currentTarget.style.background = 'transparent' }}
                  >
                    <td style={{ padding: '10px 1rem', borderBottom: '1px solid #F3F4F6', fontWeight: 600 }}>{t.ticket_number}</td>
                    <td style={{ padding: '10px 1rem', borderBottom: '1px solid #F3F4F6' }}>{t.category}</td>
                    <td style={{ padding: '10px 1rem', borderBottom: '1px solid #F3F4F6' }}>{t.department}</td>
                    <td style={{ padding: '10px 1rem', borderBottom: '1px solid #F3F4F6' }}>{t.staff_name}</td>
                    <td style={{ padding: '10px 1rem', borderBottom: '1px solid #F3F4F6' }}><PriorityBadge priority={t.priority} /></td>
                    <td style={{ padding: '10px 1rem', borderBottom: '1px solid #F3F4F6' }}><StatusBadge status={t.status} /></td>
                    <td style={{ padding: '10px 1rem', borderBottom: '1px solid #F3F4F6', color: '#9CA3AF' }}>{timeAgo(t.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Ticket detail panel */}
        {selected && (
          <TicketDetail
            ticket={selected}
            onClose={() => setSelected(null)}
            onSaved={() => {
              setSelected(null)
              refetch()
              showToast(`Ticket ${selected.ticket_number} updated`)
            }}
          />
        )}
      </div>

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  )
}
