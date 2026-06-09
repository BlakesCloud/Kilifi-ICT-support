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
        .select('ticket_number, status, category, department, priority, created_at, resolution_note')
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

  // Initial load
  useEffect(() => { fetchTickets() }, [fetchTickets])

  // Realtime subscription — new tickets appear instantly on dashboard
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

// ── IT: update a ticket (status + resolution note) ──────────────────────────
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
