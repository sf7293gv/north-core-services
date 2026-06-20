import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const STAT_COLORS = {
  total:     { ring: 'border-brand-electric/30',  icon: 'text-brand-electric bg-brand-electric/10' },
  new:       { ring: 'border-blue-400/30',         icon: 'text-blue-400 bg-blue-400/10' },
  scheduled: { ring: 'border-purple-400/30',       icon: 'text-purple-400 bg-purple-400/10' },
  completed: { ring: 'border-green-400/30',         icon: 'text-green-400 bg-green-400/10' },
  unseen:    { ring: 'border-brand-electric/50',   icon: 'text-brand-electric bg-brand-electric/15' },
}

export default function Dashboard() {
  const [counts, setCounts] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { count: total },
        { count: newCount },
        { count: scheduled },
        { count: completed },
        { count: unseenCount },
        { data: recentRows },
      ] = await Promise.all([
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('seen', false),
        supabase.from('bookings')
          .select('id, full_name, service, status, created_at')
          .eq('seen', false)
          .order('created_at', { ascending: false })
          .limit(8),
      ])
      setCounts({
        total:     total        ?? 0,
        new:       newCount     ?? 0,
        scheduled: scheduled    ?? 0,
        completed: completed    ?? 0,
        unseen:    unseenCount  ?? 0,
      })
      setRecent(recentRows ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const v = key => loading ? '—' : (counts?.[key] ?? 0)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-widest text-brand-white mb-1">DASHBOARD</h1>
        <p className="text-brand-silver text-sm">Welcome back, Admin. Here's what's happening.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { key: 'total',     label: 'Total',     icon: <CalendarIcon /> },
          { key: 'new',       label: 'New',       icon: <InboxIcon /> },
          { key: 'scheduled', label: 'Scheduled', icon: <ClockIcon /> },
          { key: 'completed', label: 'Completed', icon: <CheckIcon /> },
          { key: 'unseen',    label: 'Unseen',    icon: <EyeOffIcon /> },
        ].map(({ key, label, icon }) => (
          <div
            key={key}
            className={`rounded-xl p-5 border flex items-center gap-4 ${STAT_COLORS[key].ring}`}
            style={{ background: '#0d1435' }}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${STAT_COLORS[key].icon}`}>
              {icon}
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-bold text-brand-white leading-none mb-0.5">{v(key)}</div>
              <div className="text-xs font-semibold tracking-wide uppercase text-brand-silver/60 truncate">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* New / unseen bookings */}
      <div className="rounded-xl border border-brand-electric/15 overflow-hidden" style={{ background: '#0d1435' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-electric/10">
          <span className="font-display tracking-widest text-brand-white text-sm">NEW BOOKINGS</span>
          <Link
            to="/admin/bookings"
            className="text-xs text-brand-electric/70 hover:text-brand-electric transition-colors duration-200"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-12 text-brand-silver/50 text-sm">
            <Spinner />
            Loading…
          </div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-brand-silver/40">
            <AllCaughtUpIcon />
            <span className="text-sm font-medium text-center px-6">
              No new bookings — you're all caught up!
            </span>
          </div>
        ) : (
          <div className="divide-y divide-brand-electric/8">
            {recent.map(b => (
              <div
                key={b.id}
                className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5 border-l-[3px] border-l-brand-electric"
              >
                <div className="min-w-0 mr-3">
                  <div className="text-sm font-semibold text-brand-white truncate">{b.full_name}</div>
                  <div className="text-xs text-brand-silver/60 truncate mt-0.5">{b.service ?? '—'}</div>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    new:       'text-blue-400 bg-blue-400/10',
    contacted: 'text-yellow-400 bg-yellow-400/10',
    scheduled: 'text-purple-400 bg-purple-400/10',
    completed: 'text-green-400 bg-green-400/10',
    cancelled: 'text-red-400 bg-red-400/10',
  }
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize shrink-0 ${map[status] ?? 'text-brand-silver/60 bg-brand-silver/10'}`}>
      {status ?? 'new'}
    </span>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
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

function InboxIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

function AllCaughtUpIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  )
}
