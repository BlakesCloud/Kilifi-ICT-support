import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ── Staff: submit a ticket ───────────────────────────────────────────────────
export function useSubmitTicket() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const submit = useCallback(async (formData) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('tickets')
        .insert({
          staff_name:  formData.staffName,
          department:  formData.department,
          contact:     formData.contact,
          category:    formData.category,
          description: formData.description,
          priority:    formData.priority,
        })
        .select('ticket_number')
        .single()

      if (err) throw err
      return { ticketNumber: data.ticket_number }
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { submit, loading, error }
}

// ── Staff: track a ticket by number ─────────────────────────────────────────
export function useTrackTicket() {
  const [ticket,  setTicket]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const track = useCallback(async (ticketNumber) => {
    setLoading(true)
    setError(null)
    setTicket(null)
    try {
      const { data, error: err } = await supabase
        .from('tickets')
        .select('ticket_number, status, category, department, priority, created_at, resolution_note, assigned_to_name')
        .eq('ticket_number', ticketNumber.toUpperCase())
        .single()

      if (err) throw new Error('Ticket not found. Check the number and try again.')
      setTicket(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { ticket, track, loading, error }
}

// ── IT Dashboard: all tickets with realtime updates ─────────────────────────
export function useTickets(statusFilter) {
  const [tickets,  setTickets]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error: err } = await query
      if (err) throw err
      setTickets(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { fetchTickets() }, [fetchTickets])

  useEffect(() => {
    const channel = supabase
      .channel('tickets-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
        fetchTickets()
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchTickets])

  return { tickets, loading, error, refetch: fetchTickets }
}

// ── IT: update a ticket (status + note + assignment) ────────────────────────
export function useUpdateTicket() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const update = useCallback(async (ticketId, updates) => {
    setLoading(true)
    setError(null)
    try {
      const { error: err } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', ticketId)

      if (err) throw err
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { update, loading, error }
}

// ── IT: dashboard stats ──────────────────────────────────────────────────────
export function useStats() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    const { data } = await supabase
      .from('tickets')
      .select('status, priority')

    if (!data) return
    setStats({
      open:        data.filter(t => t.status === 'Open').length,
      inProgress:  data.filter(t => t.status === 'In Progress').length,
      resolved:    data.filter(t => t.status === 'Resolved').length,
      urgentOpen:  data.filter(t => t.priority === 'Urgent' && t.status !== 'Resolved').length,
      total:       data.length,
    })
    setLoading(false)
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  useEffect(() => {
    const channel = supabase
      .channel('stats-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, fetchStats)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchStats])

  return { stats, loading }
}

// ── IT: fetch all IT users (for assignment dropdown) ─────────────────────────
export function useITUsers() {
  const [itUsers,  setITUsers]  = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    supabase
      .from('it_users')
      .select('id, name, display_name, role, avatar_url')
      .then(({ data }) => {
        setITUsers(data || [])
        setLoading(false)
      })
  }, [])

  return { itUsers, loading }
}

// ── IT: profile — fetch + update + avatar upload ─────────────────────────────
export function useProfile(userId) {
  const [profile,  setProfile]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState(null)

  const fetchProfile = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('it_users')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const updateProfile = async (updates) => {
    setSaving(true)
    setError(null)
    const { error: err } = await supabase
      .from('it_users')
      .update(updates)
      .eq('id', userId)

    if (err) { setError(err.message); setSaving(false); return false }
    await fetchProfile()
    setSaving(false)
    return true
  }

  const uploadAvatar = async (file) => {
    setSaving(true)
    setError(null)
    try {
      const ext  = file.name.split('.').pop()
      const path = `${userId}/avatar.${ext}`

      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (upErr) throw upErr

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      // Bust cache with timestamp
      const url = `${publicUrl}?t=${Date.now()}`
      await updateProfile({ avatar_url: url })
      return url
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setSaving(false)
    }
  }

  return { profile, loading, saving, error, updateProfile, uploadAvatar, refetch: fetchProfile }
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error
  }

  const signOut = () => supabase.auth.signOut()

  return { user, loading, signIn, signOut }
}
