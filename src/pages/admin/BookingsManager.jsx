// Run these SQL statements in Supabase Dashboard → SQL Editor:
//   alter table public.bookings add column if not exists seen boolean default false;
//   alter table public.bookings add column if not exists scheduled_time time;

import { useState, useEffect, Fragment } from 'react'
import { supabase } from '../../lib/supabase'

const STATUSES = [
  { value: 'new',       label: 'New',       cls: 'text-blue-400 bg-blue-400/10' },
  { value: 'contacted', label: 'Contacted', cls: 'text-yellow-400 bg-yellow-400/10' },
  { value: 'scheduled', label: 'Scheduled', cls: 'text-purple-400 bg-purple-400/10' },
  { value: 'completed', label: 'Completed', cls: 'text-green-400 bg-green-400/10' },
  { value: 'cancelled', label: 'Cancelled', cls: 'text-red-400 bg-red-400/10' },
]

const SERVICE_OPTIONS = [
  'Water Damage Restoration',
  'Water Mitigation',
  'Carpet Cleaning',
  'Insulation Removal & Restoration',
  'Other',
]

function statusCls(status) {
  return STATUSES.find(s => s.value === status)?.cls ?? 'text-brand-silver/60 bg-brand-silver/10'
}

function fmtSubmitted(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((todayStart.getTime() - dStart.getTime()) / 86400000)
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (diffDays === 0) return `Today · ${time}`
  if (diffDays === 1) return `Yesterday · ${time}`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + time
}

function fmtPreferred(d) {
  if (!d) return null
  const [y, mo, day] = d.split('-').map(Number)
  return new Date(y, mo - 1, day).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function fmtPhone(phone) {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  const local = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits.slice(0, 10)
  if (local.length !== 10) return phone
  return `+1 (${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`
}

function telUri(phone) {
  if (!phone) return '#'
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) return `tel:+${digits}`
  if (digits.length === 10) return `tel:+1${digits}`
  return `tel:${phone}`
}

function fmtScheduledTime(timeStr) {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`
}

const EDIT_INPUT = 'w-full text-xs rounded px-2 py-1.5 bg-[#0a0f2c] border border-brand-electric/30 text-brand-white placeholder:text-brand-silver/30 focus:outline-none focus:border-brand-electric transition-colors'
const EDIT_LABEL = 'block text-[10px] font-semibold text-brand-silver/40 uppercase tracking-wider mb-1'

export default function BookingsManager() {
  const [bookings, setBookings]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [updating, setUpdating]           = useState(null)
  const [expanded, setExpanded]           = useState(new Set())
  const [pastOpen, setPastOpen]           = useState(false)
  const [editId, setEditId]               = useState(null)
  const [editForm, setEditForm]           = useState({})
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setBookings(data ?? [])
        setLoading(false)
      })
  }, [])

  async function updateStatus(id, status) {
    setUpdating(id)
    await supabase.from('bookings').update({ status }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
    setUpdating(null)
  }

  async function markSeen(id) {
    setUpdating(id)
    await supabase.from('bookings').update({ seen: true }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, seen: true } : b))
    setUpdating(null)
  }

  function toggleExpanded(id) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function matchSearch(b) {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      b.full_name?.toLowerCase().includes(q) ||
      b.email?.toLowerCase().includes(q) ||
      b.service?.toLowerCase().includes(q) ||
      b.phone?.toLowerCase().includes(q)
    )
  }

  function startEdit(b) {
    setEditId(b.id)
    setEditForm({
      full_name:      b.full_name      ?? '',
      phone:          b.phone          ?? '',
      email:          b.email          ?? '',
      service:        b.service        ?? '',
      preferred_date: b.preferred_date ?? '',
      message:        b.message        ?? '',
    })
  }

  function handleEditChange(e) {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: value }))
  }

  async function saveEdit(id) {
    setUpdating(id)
    const { data } = await supabase
      .from('bookings')
      .update({
        full_name:      editForm.full_name,
        phone:          editForm.phone,
        email:          editForm.email,
        service:        editForm.service,
        preferred_date: editForm.preferred_date || null,
        message:        editForm.message,
      })
      .eq('id', id)
      .select()
      .single()
    if (data) setBookings(prev => prev.map(b => b.id === id ? { ...b, ...data } : b))
    setEditId(null)
    setUpdating(null)
  }

  async function updateScheduledTime(id, time) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, scheduled_time: time || null } : b))
    await supabase.from('bookings').update({ scheduled_time: time || null }).eq('id', id)
  }

  async function deleteBooking(id) {
    setUpdating(id)
    await supabase.from('bookings').delete().eq('id', id)
    setBookings(prev => prev.filter(b => b.id !== id))
    setConfirmDelete(null)
    setUpdating(null)
  }

  const activeBookings    = bookings.filter(b => b.status !== 'completed')
  const completedBookings = bookings.filter(b => b.status === 'completed')
  const unseenCount       = bookings.filter(b => !b.seen).length
  const activeFiltered    = activeBookings.filter(matchSearch)
  const pastFiltered      = completedBookings.filter(matchSearch)
  const showPast          = pastOpen || (search.length > 0 && pastFiltered.length > 0)

  const handlers = {
    updating, expanded, editId, editForm, confirmDelete,
    updateStatus, markSeen, toggleExpanded,
    startEdit, handleEditChange, saveEdit,
    cancelEdit: () => setEditId(null),
    updateScheduledTime, setConfirmDelete, deleteBooking,
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-3xl sm:text-4xl tracking-widest text-brand-white mb-1">BOOKINGS</h1>
          <p className="text-brand-silver/60 text-sm">
            {loading ? 'Loading…' : `${bookings.length} total · ${unseenCount} unseen`}
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search name, email, service…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-lg bg-[#0d1435] border border-brand-electric/20 text-brand-white text-sm placeholder:text-brand-silver/30 focus:outline-none focus:ring-2 focus:ring-brand-electric/40 focus:border-brand-electric transition-colors duration-200 w-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-20 text-brand-silver/50 text-sm">
          <Spinner />
          Loading bookings…
        </div>
      ) : (
        <div className="flex flex-col gap-8">

          {/* ── New Bookings (not completed) ──────────────────── */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-display text-xl tracking-widest text-brand-white">NEW BOOKINGS</h2>
              <span className="text-xs font-bold px-2 py-0.5 bg-brand-electric/20 text-brand-electric rounded-full">
                {activeFiltered.length}
              </span>
            </div>

            <div className="rounded-xl border border-brand-electric/25 overflow-hidden" style={{ background: '#0d1435' }}>
              {activeFiltered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-brand-silver/40">
                  <AllCaughtUpIcon />
                  <span className="text-sm">
                    {search ? 'No active bookings match your search' : "No active bookings — you're all caught up!"}
                  </span>
                </div>
              ) : (
                <>
                  <BookingCards bookings={activeFiltered} isPast={false} {...handlers} />
                  <BookingTable bookings={activeFiltered} isPast={false} {...handlers} />
                </>
              )}
            </div>
          </div>

          {/* ── Past Bookings (completed) ──────────────────────── */}
          <div>
            <button
              onClick={() => setPastOpen(o => !o)}
              className="flex items-center gap-2.5 mb-4 group"
            >
              <h2 className="font-display text-xl tracking-widest text-brand-silver/50 group-hover:text-brand-silver/80 transition-colors duration-150">
                PAST BOOKINGS
              </h2>
              <span className="text-xs font-semibold text-brand-silver/40">({pastFiltered.length})</span>
              <ChevronIcon className={`text-brand-silver/30 group-hover:text-brand-silver/50 transition-all duration-200 ${showPast ? '' : '-rotate-90'}`} />
            </button>

            {showPast && (
              <div className="rounded-xl border border-brand-electric/10 overflow-hidden" style={{ background: '#0d1435' }}>
                {pastFiltered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 gap-3 text-brand-silver/30">
                    <CalendarIcon size={26} />
                    <span className="text-sm">{search ? 'No past bookings match your search' : 'No past bookings yet'}</span>
                  </div>
                ) : (
                  <>
                    <BookingCards bookings={pastFiltered} isPast={true} {...handlers} />
                    <BookingTable bookings={pastFiltered} isPast={true} {...handlers} />
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}

/* ── Booking Cards (mobile) ────────────────────────────────── */
function BookingCards({
  bookings, isPast, updating, expanded, editId, editForm, confirmDelete,
  updateStatus, markSeen, toggleExpanded, startEdit, handleEditChange,
  saveEdit, cancelEdit, updateScheduledTime, setConfirmDelete, deleteBooking,
}) {
  return (
    <div className="sm:hidden divide-y divide-brand-electric/8">
      {bookings.map(b => (
        <div key={b.id} className={`px-4 py-4 ${isPast ? 'opacity-70' : ''}`}>

          {editId === b.id ? (
            /* ── Edit form (card) ── */
            <div className="flex flex-col gap-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={EDIT_LABEL}>Name</label>
                  <input name="full_name" value={editForm.full_name} onChange={handleEditChange} className={EDIT_INPUT} />
                </div>
                <div>
                  <label className={EDIT_LABEL}>Phone</label>
                  <input name="phone" value={editForm.phone} onChange={handleEditChange} className={EDIT_INPUT} />
                </div>
              </div>
              <div>
                <label className={EDIT_LABEL}>Email</label>
                <input name="email" value={editForm.email} onChange={handleEditChange} className={EDIT_INPUT} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={EDIT_LABEL}>Service</label>
                  <select name="service" value={editForm.service} onChange={handleEditChange} className={EDIT_INPUT}>
                    {SERVICE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className={EDIT_LABEL}>Preferred Date</label>
                  <input type="date" name="preferred_date" value={editForm.preferred_date} onChange={handleEditChange} className={EDIT_INPUT + ' [color-scheme:dark]'} />
                </div>
              </div>
              <div>
                <label className={EDIT_LABEL}>Message</label>
                <textarea name="message" value={editForm.message} onChange={handleEditChange} rows={3} className={EDIT_INPUT + ' resize-none'} />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => saveEdit(b.id)}
                  disabled={updating === b.id}
                  className="text-xs px-3 py-1.5 rounded-lg bg-brand-electric/15 text-brand-electric hover:bg-brand-electric/25 font-semibold transition-colors disabled:opacity-50"
                >
                  {updating === b.id ? 'Saving…' : 'Save'}
                </button>
                <button onClick={cancelEdit} className="text-xs px-3 py-1.5 rounded-lg text-brand-silver/50 hover:text-brand-silver transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* ── Normal card ── */
            <>
              {/* Name + Status */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {!b.seen && <span className="shrink-0 w-2 h-2 rounded-full bg-brand-electric" aria-hidden="true" />}
                    <span className={`text-sm font-semibold truncate ${isPast ? 'text-brand-silver/80' : 'text-brand-white'}`}>
                      {b.full_name}
                    </span>
                  </div>
                  <div className="text-xs text-brand-silver/50 truncate">{b.service ?? '—'}</div>
                </div>
                <StatusSelect b={b} updating={updating} onUpdate={updateStatus} />
              </div>

              {/* Dates */}
              <div className="flex flex-col gap-0.5 text-xs mb-2">
                <span className="text-brand-silver/50">
                  <span className="text-brand-silver/30 mr-1">Submitted:</span>
                  {fmtSubmitted(b.created_at)}
                </span>
                {(b.preferred_date || b.scheduled_time) && (
                  <span className="text-brand-silver/50">
                    <span className="text-brand-silver/30 mr-1">Requested:</span>
                    {fmtPreferred(b.preferred_date) ?? ''}
                    {b.scheduled_time && (
                      <span className="text-brand-electric/70"> at {fmtScheduledTime(b.scheduled_time)}</span>
                    )}
                  </span>
                )}
              </div>

              {/* Time picker */}
              {(b.status === 'scheduled' || b.status === 'contacted') && (
                <div className="mb-2">
                  <label className={EDIT_LABEL}>Set appointment time</label>
                  <input
                    type="time"
                    value={b.scheduled_time?.slice(0, 5) ?? ''}
                    onChange={e => updateScheduledTime(b.id, e.target.value)}
                    className="text-xs bg-[#0a0f2c] border border-brand-electric/30 rounded px-2 py-1 text-brand-electric focus:outline-none focus:border-brand-electric [color-scheme:dark]"
                  />
                </div>
              )}

              {/* Contact links */}
              <div className="flex flex-col gap-0.5 text-xs mb-2">
                {b.phone && (
                  <a href={telUri(b.phone)} className="text-brand-electric hover:underline underline-offset-2 w-fit">
                    {fmtPhone(b.phone)}
                  </a>
                )}
                {b.email && (
                  <a href={`mailto:${b.email}`} className="text-brand-electric hover:underline underline-offset-2 truncate w-fit max-w-full">
                    {b.email}
                  </a>
                )}
              </div>

              {/* Message */}
              {b.message && (
                <div className="text-xs text-brand-silver/60 leading-relaxed mb-2">
                  {expanded.has(b.id) || b.message.length <= 120 ? (
                    <>
                      {b.message}
                      {b.message.length > 120 && (
                        <button onClick={() => toggleExpanded(b.id)} className="ml-1 text-brand-electric/70 hover:text-brand-electric">
                          Show less
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {b.message.slice(0, 120)}…{' '}
                      <button onClick={() => toggleExpanded(b.id)} className="text-brand-electric/70 hover:text-brand-electric">
                        View more
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Actions */}
              {confirmDelete === b.id ? (
                <div className="mt-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 flex flex-col gap-1.5">
                  <span className="text-xs text-red-400">Delete this booking? This cannot be undone.</span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => deleteBooking(b.id)}
                      disabled={updating === b.id}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold disabled:opacity-50"
                    >
                      {updating === b.id ? 'Deleting…' : 'Yes, delete'}
                    </button>
                    <button onClick={() => setConfirmDelete(null)} className="text-xs text-brand-silver/50 hover:text-brand-silver">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {!b.seen && (
                    <button
                      onClick={() => markSeen(b.id)}
                      disabled={updating === b.id}
                      className="text-xs text-brand-electric/60 hover:text-brand-electric transition-colors duration-150 flex items-center gap-1 disabled:opacity-40"
                    >
                      <EyeIcon />
                      Mark as seen
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(b)}
                    className="text-xs text-brand-silver/50 hover:text-brand-silver transition-colors duration-150 flex items-center gap-1"
                  >
                    <PencilIcon />
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmDelete(b.id)}
                    className="text-xs text-red-400/60 hover:text-red-400 transition-colors duration-150 flex items-center gap-1"
                  >
                    <TrashIcon />
                    Delete
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  )
}

/* ── Booking Table (desktop) ───────────────────────────────── */
function BookingTable({
  bookings, isPast, updating, expanded, editId, editForm, confirmDelete,
  updateStatus, markSeen, toggleExpanded, startEdit, handleEditChange,
  saveEdit, cancelEdit, updateScheduledTime, setConfirmDelete, deleteBooking,
}) {
  const headers = ['Name', 'Submitted', 'Requested / Time', 'Phone', 'Email', 'Service', 'Status', 'Message', '']

  return (
    <div className="hidden sm:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-brand-electric/10">
            {headers.map(h => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase text-brand-silver/40"
                style={{ background: 'rgba(46,127,255,0.04)' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-electric/8">
          {bookings.map(b => (
            <Fragment key={b.id}>
              {editId === b.id ? (
                /* ── Edit row ── */
                <tr>
                  <td colSpan={20} className="px-4 py-4">
                    <div className="rounded-lg border border-brand-electric/25 bg-brand-electric/5 p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className={EDIT_LABEL}>Name</label>
                          <input name="full_name" value={editForm.full_name} onChange={handleEditChange} className={EDIT_INPUT} />
                        </div>
                        <div>
                          <label className={EDIT_LABEL}>Phone</label>
                          <input name="phone" value={editForm.phone} onChange={handleEditChange} className={EDIT_INPUT} />
                        </div>
                        <div>
                          <label className={EDIT_LABEL}>Email</label>
                          <input name="email" value={editForm.email} onChange={handleEditChange} className={EDIT_INPUT} />
                        </div>
                        <div>
                          <label className={EDIT_LABEL}>Service</label>
                          <select name="service" value={editForm.service} onChange={handleEditChange} className={EDIT_INPUT}>
                            {SERVICE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={EDIT_LABEL}>Preferred Date</label>
                          <input type="date" name="preferred_date" value={editForm.preferred_date} onChange={handleEditChange} className={EDIT_INPUT + ' [color-scheme:dark]'} />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className={EDIT_LABEL}>Message</label>
                        <textarea name="message" value={editForm.message} onChange={handleEditChange} rows={2} className={EDIT_INPUT + ' resize-none w-full'} />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => saveEdit(b.id)}
                          disabled={updating === b.id}
                          className="text-xs px-3 py-1.5 rounded-lg bg-brand-electric/15 text-brand-electric hover:bg-brand-electric/25 font-semibold transition-colors disabled:opacity-50"
                        >
                          {updating === b.id ? 'Saving…' : 'Save Changes'}
                        </button>
                        <button onClick={cancelEdit} className="text-xs px-3 py-1.5 rounded-lg text-brand-silver/50 hover:text-brand-silver transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                /* ── Normal row ── */
                <>
                  <tr className={`transition-colors duration-150 ${isPast ? 'hover:bg-white/[0.02]' : 'hover:bg-brand-electric/5'}`}>

                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-1.5">
                        {!b.seen && (
                          <span className="mt-[5px] shrink-0 w-2 h-2 rounded-full bg-brand-electric" aria-hidden="true" />
                        )}
                        <span className={`font-medium whitespace-nowrap ${isPast ? 'text-brand-silver/70' : 'text-brand-white'}`}>
                          {b.full_name}
                        </span>
                      </div>
                    </td>

                    {/* Submitted */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-brand-silver/50 text-xs">{fmtSubmitted(b.created_at)}</span>
                    </td>

                    {/* Requested / Time */}
                    <td className="px-4 py-3 min-w-[160px]">
                      <div className="flex flex-col gap-1.5">
                        {fmtPreferred(b.preferred_date) ? (
                          <span className="text-brand-silver/60 text-xs whitespace-nowrap">
                            {fmtPreferred(b.preferred_date)}
                            {b.scheduled_time && (
                              <span className="text-brand-electric/70"> at {fmtScheduledTime(b.scheduled_time)}</span>
                            )}
                          </span>
                        ) : b.scheduled_time ? (
                          <span className="text-brand-electric/70 text-xs whitespace-nowrap">
                            at {fmtScheduledTime(b.scheduled_time)}
                          </span>
                        ) : (
                          <span className="text-brand-silver/30 text-xs">—</span>
                        )}
                        {(b.status === 'scheduled' || b.status === 'contacted') && (
                          <input
                            type="time"
                            value={b.scheduled_time?.slice(0, 5) ?? ''}
                            onChange={e => updateScheduledTime(b.id, e.target.value)}
                            className="text-xs bg-[#0a0f2c] border border-brand-electric/30 rounded px-1.5 py-1 text-brand-electric focus:outline-none focus:border-brand-electric [color-scheme:dark] w-24"
                          />
                        )}
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {b.phone
                        ? <a href={telUri(b.phone)} className="text-brand-electric hover:underline underline-offset-2">{fmtPhone(b.phone)}</a>
                        : <span className="text-brand-silver/30">—</span>
                      }
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 whitespace-nowrap max-w-[160px]">
                      {b.email
                        ? <a href={`mailto:${b.email}`} className="text-brand-electric hover:underline underline-offset-2 block truncate max-w-[160px]">{b.email}</a>
                        : <span className="text-brand-silver/30">—</span>
                      }
                    </td>

                    {/* Service */}
                    <td className="px-4 py-3 text-brand-silver/70 whitespace-nowrap">{b.service ?? '—'}</td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="relative inline-block">
                        <select
                          value={b.status ?? 'new'}
                          onChange={e => updateStatus(b.id, e.target.value)}
                          disabled={updating === b.id}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer border-0 outline-none appearance-none pr-6 ${statusCls(b.status)} disabled:opacity-50`}
                          style={{ background: 'transparent' }}
                        >
                          {STATUSES.map(s => (
                            <option key={s.value} value={s.value} style={{ background: '#0d1435', color: '#f0f4ff' }}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 opacity-50">
                          <SmallChevron />
                        </span>
                      </div>
                    </td>

                    {/* Message (truncated) */}
                    <td className="px-4 py-3 max-w-[200px]">
                      {b.message ? (
                        <div className="text-xs text-brand-silver/60 leading-relaxed">
                          {expanded.has(b.id) ? (
                            <button onClick={() => toggleExpanded(b.id)} className="text-brand-electric/60 hover:text-brand-electric whitespace-nowrap">
                              Hide ↑
                            </button>
                          ) : b.message.length <= 55 ? (
                            b.message
                          ) : (
                            <>
                              {b.message.slice(0, 55)}…{' '}
                              <button onClick={() => toggleExpanded(b.id)} className="text-brand-electric/60 hover:text-brand-electric whitespace-nowrap">
                                View more
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-brand-silver/25">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {confirmDelete === b.id ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-red-400 whitespace-nowrap">Delete this booking?</span>
                          <div className="flex gap-2 items-center">
                            <button
                              onClick={() => deleteBooking(b.id)}
                              disabled={updating === b.id}
                              className="text-xs text-red-400 hover:text-red-300 font-semibold disabled:opacity-50"
                            >
                              {updating === b.id ? '…' : 'Confirm'}
                            </button>
                            <button onClick={() => setConfirmDelete(null)} className="text-xs text-brand-silver/40 hover:text-brand-silver">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {!b.seen && (
                            <button
                              onClick={() => markSeen(b.id)}
                              disabled={updating === b.id}
                              title="Mark as seen"
                              className="text-brand-silver/30 hover:text-brand-electric transition-colors duration-150 disabled:opacity-40"
                            >
                              {updating === b.id ? <Spinner /> : <EyeIcon />}
                            </button>
                          )}
                          <button
                            onClick={() => startEdit(b)}
                            title="Edit booking"
                            className="text-brand-silver/30 hover:text-brand-electric transition-colors duration-150"
                          >
                            <PencilIcon />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(b.id)}
                            title="Delete booking"
                            className="text-brand-silver/30 hover:text-red-400 transition-colors duration-150"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      )}
                    </td>

                  </tr>

                  {/* Expanded message sub-row */}
                  {b.message && expanded.has(b.id) && (
                    <tr>
                      <td colSpan={20} className="px-4 pb-4 pt-0">
                        <div className="text-xs text-brand-silver/70 bg-brand-electric/5 rounded-lg px-3 py-2.5 leading-relaxed border border-brand-electric/10">
                          {b.message}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── StatusSelect ──────────────────────────────────────────── */
function StatusSelect({ b, updating, onUpdate }) {
  return (
    <div className="relative inline-block shrink-0">
      <select
        value={b.status ?? 'new'}
        onChange={e => onUpdate(b.id, e.target.value)}
        disabled={updating === b.id}
        className={`text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer border-0 outline-none appearance-none pr-6 ${statusCls(b.status)} disabled:opacity-50`}
        style={{ background: 'transparent' }}
      >
        {STATUSES.map(s => (
          <option key={s.value} value={s.value} style={{ background: '#0d1435', color: '#f0f4ff' }}>
            {s.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 opacity-50">
        <SmallChevron />
      </span>
    </div>
  )
}

/* ── Icons ─────────────────────────────────────────────────── */
function SearchIcon() {
  return (
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-silver/40 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}

function CalendarIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}

function ChevronIcon({ className = '' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`transition-transform duration-200 ${className}`}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}

function SmallChevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
    </svg>
  )
}

function AllCaughtUpIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  )
}
