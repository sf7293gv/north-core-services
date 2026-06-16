import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const STATUSES = [
  { value: 'new',       label: 'New',       cls: 'text-blue-400 bg-blue-400/10' },
  { value: 'contacted', label: 'Contacted', cls: 'text-yellow-400 bg-yellow-400/10' },
  { value: 'scheduled', label: 'Scheduled', cls: 'text-purple-400 bg-purple-400/10' },
  { value: 'completed', label: 'Completed', cls: 'text-green-400 bg-green-400/10' },
  { value: 'cancelled', label: 'Cancelled', cls: 'text-red-400 bg-red-400/10' },
]

function statusCls(status) {
  return STATUSES.find(s => s.value === status)?.cls ?? 'text-brand-silver/60 bg-brand-silver/10'
}

function fmtDate(d) {
  if (!d) return '—'
  const [y, mo, day] = d.split('-').map(Number)
  return new Date(y, mo - 1, day).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function fmtTimestamp(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function BookingsManager() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [updating, setUpdating] = useState(null)

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

  const filtered = bookings.filter(b => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      b.full_name?.toLowerCase().includes(q) ||
      b.email?.toLowerCase().includes(q) ||
      b.service?.toLowerCase().includes(q) ||
      b.phone?.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-4xl tracking-widest text-brand-white mb-1">BOOKINGS</h1>
          <p className="text-brand-silver/60 text-sm">
            {loading ? 'Loading…' : `${bookings.length} total booking${bookings.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search name, email, service…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-lg bg-[#0d1435] border border-brand-electric/20 text-brand-white text-sm placeholder:text-brand-silver/30 focus:outline-none focus:ring-2 focus:ring-brand-electric/40 focus:border-brand-electric transition-colors duration-200 w-64"
          />
        </div>
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-brand-electric/15 overflow-hidden" style={{ background: '#0d1435' }}>
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-brand-silver/50 text-sm">
            <Spinner />
            Loading bookings…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-brand-silver/40">
            <CalendarIcon size={28} />
            <span className="text-sm">{search ? 'No bookings match your search' : 'No bookings yet'}</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-electric/10">
                  {['Name', 'Phone', 'Email', 'Service', 'Pref. Date', 'Status', 'Submitted'].map(h => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase text-brand-silver/50"
                      style={{ background: 'rgba(46,127,255,0.04)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-electric/8">
                {filtered.map(b => (
                  <tr key={b.id} className="hover:bg-brand-electric/5 transition-colors duration-150">
                    <td className="px-4 py-3 font-medium text-brand-white whitespace-nowrap">{b.full_name}</td>
                    <td className="px-4 py-3 text-brand-silver/80 whitespace-nowrap">{b.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-brand-silver/80 whitespace-nowrap max-w-[180px] truncate">{b.email}</td>
                    <td className="px-4 py-3 text-brand-silver/80 whitespace-nowrap">{b.service ?? '—'}</td>
                    <td className="px-4 py-3 text-brand-silver/80 whitespace-nowrap">{fmtDate(b.preferred_date)}</td>
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
                            <option
                              key={s.value}
                              value={s.value}
                              style={{ background: '#0d1435', color: '#f0f4ff' }}
                            >
                              {s.label}
                            </option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 opacity-50">
                          <ChevronIcon />
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-brand-silver/50 whitespace-nowrap text-xs">{fmtTimestamp(b.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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

function ChevronIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  )
}
