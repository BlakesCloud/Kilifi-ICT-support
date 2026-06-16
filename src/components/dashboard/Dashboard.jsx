import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTickets, useStats, useAuth, useProfile } from '../../hooks/useTickets'
import { StatusBadge, PriorityBadge, StatCard, Spinner, Toast } from '../shared'
import TicketDetail from './TicketDetail'
import ProfilePage from './ProfilePage'
import { Avatar } from './ProfilePage'
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

// Assigned-to pill shown in ticket table
function AssigneePill({ name }) {
  if (!name) return <span style={{ color: '#D1D5DB', fontSize: 12 }}>Unassigned</span>
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: '#EFF6FF', color: '#1D4ED8',
      padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 500,
    }}>
      🔧 {name}
    </span>
  )
}

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { profile }                             = useProfile(user?.id)
  const [filter, setFilter]                     = useState('all')
  const [selected, setSelected]                 = useState(null)
  const [showProfile, setShowProfile]           = useState(false)
  const [toast, setToast]                       = useState({ visible: false, msg: '' })
  const { tickets, loading, refetch }           = useTickets(filter)
  const { stats }                               = useStats()

  const showToast = (msg) => {
    setToast({ visible: true, msg })
    setTimeout(() => setToast({ visible: false, msg: '' }), 2500)
  }

  if (authLoading) return <Spinner />
  if (!user)       return <Login />

  const displayName = profile?.display_name || profile?.name || user.email

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

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Profile button */}
          <button
            onClick={() => setShowProfile(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '4px 10px 4px 4px',
              border: '1px solid #E5E7EB', borderRadius: 20,
              background: '#fff', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <Avatar url={profile?.avatar_url} name={displayName} size={28} />
            <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{displayName}</span>
          </button>

          <button onClick={signOut} style={ghostBtn}>Sign out</button>
          <Link to="/" style={{ ...ghostBtn, textDecoration: 'none' }}>← Staff portal</Link>
        </div>
      </div>

      <div style={{ padding: '1.5rem', maxWidth: 1150, margin: '0 auto' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: '1.25rem' }}>
          <StatCard label="Open"        value={stats?.open}       color="#1D4ED8" bg="#EFF6FF" />
          <StatCard label="In progress" value={stats?.inProgress} color="#92400E" bg="#FFFBEB" />
          <StatCard label="Resolved"    value={stats?.resolved}   color="#166534" bg="#F0FDF4" />
          <StatCard label="Urgent open" value={stats?.urgentOpen} color="#991B1B" bg="#FEF2F2" />
        </div>

        {/* Ticket table */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>

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
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    {['Ticket', 'Category', 'Department', 'Staff', 'Priority', 'Status', 'Handled by', 'Time'].map(h => (
                      <th key={h} style={{
                        padding: '9px 1rem', textAlign: 'left',
                        fontSize: 12, fontWeight: 500, color: '#6B7280',
                        borderBottom: '1px solid #E5E7EB', whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tickets.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding: '2.5rem', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
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
                      onMouseLeave={e => { if (selected?.id !== t.id) e.currentTarget.style.background = selected?.id === t.id ? '#F0FDF4' : 'transparent' }}
                    >
                      <td style={td}><strong>{t.ticket_number}</strong></td>
                      <td style={td}>{t.category}</td>
                      <td style={td}>{t.department}</td>
                      <td style={td}>{t.staff_name}</td>
                      <td style={td}><PriorityBadge priority={t.priority} /></td>
                      <td style={td}><StatusBadge status={t.status} /></td>
                      <td style={td}><AssigneePill name={t.assigned_to_name} /></td>
                      <td style={{ ...td, color: '#9CA3AF' }}>{timeAgo(t.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Ticket detail panel */}
        {selected && (
          <TicketDetail
            ticket={selected}
            user={user}
            onClose={() => setSelected(null)}
            onSaved={() => {
              setSelected(null)
              refetch()
              showToast(`Ticket ${selected.ticket_number} updated`)
            }}
          />
        )}
      </div>

      {/* Profile modal */}
      {showProfile && (
        <ProfilePage user={user} onClose={() => setShowProfile(false)} />
      )}

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  )
}

const ghostBtn = {
  padding: '5px 12px', border: '1px solid #E5E7EB',
  borderRadius: 6, background: '#fff', cursor: 'pointer',
  fontSize: 12, color: '#6B7280', fontFamily: 'Inter, sans-serif',
}

const td = {
  padding: '10px 1rem',
  borderBottom: '1px solid #F3F4F6',
  verticalAlign: 'middle',
}
