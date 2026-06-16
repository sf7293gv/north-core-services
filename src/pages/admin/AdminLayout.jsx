import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import '../../styles/admin.css'

const NAV = [
  {
    label: 'Overview',
    links: [
      { to: '/admin/dashboard', label: 'Dashboard', end: true, icon: <DashIcon /> },
    ],
  },
  {
    label: 'Operations',
    links: [
      { to: '/admin/bookings', label: 'Bookings',  icon: <CalendarIcon /> },
      { to: '/admin/photos',   label: 'Photos',    icon: <PhotoIcon /> },
    ],
  },
  {
    label: 'Account',
    links: [
      { to: '/admin/settings', label: 'Settings', icon: <GearIcon /> },
    ],
  },
]

const PAGE_TITLES = {
  '/admin/dashboard': 'Dashboard',
  '/admin/bookings':  'Bookings',
  '/admin/photos':    'Photos',
  '/admin/settings':  'Settings',
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [session, setSession] = useState(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin/login', { replace: true })
  }

  const userEmail = session?.user?.email ?? ''
  const initials  = userEmail ? userEmail.slice(0, 2).toUpperCase() : 'NC'
  const pageTitle = PAGE_TITLES[pathname] ?? 'Admin'

  return (
    <div className="admin-shell">

      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>

        {/* Brand */}
        <div className="adm-brand" style={{ borderBottom: '1px solid rgba(46,127,255,0.1)' }}>
          <div
            className="adm-brand-icon font-display text-xs tracking-widest"
            style={{ background: '#2e7fff', fontSize: '10px' }}
          >
            NC
          </div>
          <div className="adm-brand-text">
            <div className="adm-brand-name font-display tracking-widest" style={{ fontSize: '13px' }}>
              NORTH CORE
            </div>
            <div className="adm-brand-sub">Admin Panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="adm-nav" aria-label="Admin navigation">
          {NAV.map(section => (
            <div key={section.label}>
              <div className="adm-nav-section-label">{section.label}</div>
              {section.links.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => `adm-nav-link${isActive ? ' active' : ''}`}
                >
                  {link.icon}
                  {link.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <button className="adm-logout-btn" onClick={handleLogout}>
            <LogoutIcon />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="adm-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      {/* Main */}
      <div className="admin-main">
        <header className="adm-topbar">
          <button
            className="adm-topbar-menu"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Toggle navigation"
          >
            <MenuIcon />
          </button>

          <span className="adm-page-title font-display tracking-widest" style={{ fontSize: '16px' }}>
            {pageTitle.toUpperCase()}
          </span>
          <div className="adm-topbar-spacer" />

          <div className="adm-topbar-user">
            <span className="adm-user-email">{userEmail}</span>
            <div
              className="adm-user-avatar font-display"
              style={{ background: '#2e7fff', fontSize: '11px', letterSpacing: '0.05em' }}
              aria-hidden="true"
            >
              {initials}
            </div>
          </div>
        </header>

        <div className="adm-content">
          <Outlet />
        </div>
      </div>

    </div>
  )
}

/* ── Icons ─────────────────────────────────────────────────── */
function DashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}

function PhotoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  )
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  )
}
