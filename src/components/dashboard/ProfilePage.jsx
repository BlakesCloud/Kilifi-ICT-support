import { useState, useRef } from 'react'
import { useProfile } from '../../hooks/useTickets'
import { Spinner, ErrorMessage, inputStyle } from '../shared'

function Avatar({ url, name, size = 72 }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return url ? (
    <img
      src={url}
      alt={name}
      style={{
        width: size, height: size, borderRadius: '50%',
        objectFit: 'cover', border: '3px solid #E5E7EB',
      }}
    />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#1D9E75', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 600, border: '3px solid #E5E7EB',
      flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

export { Avatar }

export default function ProfilePage({ user, onClose }) {
  const { profile, loading, saving, error, updateProfile, uploadAvatar } = useProfile(user.id)
  const [displayName, setDisplayName] = useState('')
  const [saved, setSaved]             = useState(false)
  const fileRef                       = useRef()

  // Pre-fill name once profile loads
  if (profile && displayName === '' && profile.display_name) {
    setDisplayName(profile.display_name)
  }
  if (profile && displayName === '' && !profile.display_name && profile.name) {
    setDisplayName(profile.name)
  }

  const handleSaveName = async () => {
    const ok = await updateProfile({ display_name: displayName })
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  }

  const handlePhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    // Validate: image only, max 2MB
    if (!file.type.startsWith('image/')) return
    if (file.size > 2 * 1024 * 1024) { alert('Please choose a photo under 2MB.'); return }
    await uploadAvatar(file)
  }

  if (loading) return (
    <div style={overlay}>
      <div style={modal}><Spinner /></div>
    </div>
  )

  const name = profile?.display_name || profile?.name || user.email

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: 17, fontWeight: 600 }}>My profile</h2>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        {/* Avatar section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <Avatar url={profile?.avatar_url} name={name} size={80} />
            {saving && (
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(0,0,0,0.35)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: 20, height: 20, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              </div>
            )}
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{name}</p>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 10 }}>
              {profile?.role === 'admin' ? '🛡 Admin' : '🔧 Technician'} · {user.email}
            </p>
            <button
              onClick={() => fileRef.current.click()}
              disabled={saving}
              style={{
                padding: '6px 14px', background: '#F3F4F6', border: '1px solid #E5E7EB',
                borderRadius: 6, fontSize: 13, cursor: 'pointer', color: '#374151',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {saving ? 'Uploading...' : '📷 Change photo'}
            </button>
            <input
              ref={fileRef} type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handlePhoto}
            />
            <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>JPG or PNG, max 2MB</p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '1.25rem' }}>
          <ErrorMessage message={error} />

          {/* Display name */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Display name
            </label>
            <input
              style={inputStyle}
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your name as shown on tickets"
            />
            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
              This name appears on tickets you handle and resolve.
            </p>
          </div>

          {/* Email (read-only) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Email address
            </label>
            <input
              style={{ ...inputStyle, background: '#F9FAFB', color: '#9CA3AF' }}
              value={user.email}
              readOnly
            />
            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
              Email is managed by your administrator.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={handleSaveName}
              disabled={saving}
              style={{
                padding: '9px 20px', background: '#1D9E75', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Save changes
            </button>
            <button onClick={onClose} style={{
              padding: '9px 16px', background: '#fff', color: '#374151',
              border: '1px solid #D1D5DB', borderRadius: 8,
              fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}>
              Cancel
            </button>
            {saved && <span style={{ fontSize: 13, color: '#1D9E75', fontWeight: 500 }}>✓ Saved</span>}
          </div>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )
}

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 100, padding: '1rem',
}

const modal = {
  background: '#fff', borderRadius: 14,
  padding: '1.75rem', width: '100%', maxWidth: 460,
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
}

const closeBtn = {
  padding: '6px 10px', border: '1px solid #E5E7EB',
  borderRadius: 6, background: '#fff', cursor: 'pointer',
  fontSize: 14, color: '#6B7280', fontFamily: 'Inter, sans-serif',
}
