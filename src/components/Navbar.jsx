import { useState, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

const SERVICE_LINKS = [
  { label: 'Water Damage Restoration', route: '/services/water-damage-restoration' },
  { label: 'Water Mitigation',          route: '/services/water-mitigation' },
  { label: 'Carpet Cleaning',           route: '/services/carpet-cleaning' },
  { label: 'Insulation Removal',        route: '/services/insulation-removal' },
]

const SECTION_LINKS = [
  { label: 'About',   id: 'about'   },
  { label: 'Contact', id: 'contact' },
]

function ChevronDown({ className = '' }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export default function Navbar() {
  const [menuOpen, setMenuOpen]               = useState(false)
  const [servicesOpen, setServicesOpen]       = useState(false)
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)
  const servicesTimer = useRef(null)

  const navigate = useNavigate()
  const location = useLocation()

  function handleSectionClick(id) {
    setMenuOpen(false)
    setServicesOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 80)
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  function closeAll() {
    setMenuOpen(false)
    setServicesOpen(false)
    setMobileServicesOpen(false)
  }

  function onServicesEnter() {
    clearTimeout(servicesTimer.current)
    setServicesOpen(true)
  }

  function onServicesLeave() {
    servicesTimer.current = setTimeout(() => setServicesOpen(false), 120)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-navy border-b border-brand-electric/20">

      {/* Main bar */}
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Wordmark */}
        <Link to="/" className="flex flex-col leading-none min-w-0">
          <span className="font-display text-[1.3rem] sm:text-[1.6rem] tracking-widest text-brand-white truncate">
            NORTH CORE SERVICES
          </span>
          <span className="hidden sm:block text-[0.65rem] font-sans tracking-wider text-brand-silver/70 mt-0.5">
            Water · Fire · Mold · Storm
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">

          {/* Services dropdown */}
          <div
            className="relative"
            onMouseEnter={onServicesEnter}
            onMouseLeave={onServicesLeave}
          >
            <button
              className="flex items-center gap-1 text-sm font-medium text-brand-silver hover:text-brand-electric transition-colors duration-200"
              aria-expanded={servicesOpen}
              aria-haspopup="true"
            >
              Services
              <ChevronDown className={`transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown panel — pt-3 bridges the gap between button and panel */}
            {servicesOpen && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50 min-w-[220px]"
                onMouseEnter={onServicesEnter}
                onMouseLeave={onServicesLeave}
              >
                <div
                  className="bg-[#0d1435] rounded-xl border border-brand-electric/20 py-1.5"
                  style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(46,127,255,0.12)' }}
                >
                  {SERVICE_LINKS.map(({ label, route }) => (
                    <Link
                      key={route}
                      to={route}
                      onClick={closeAll}
                      className="block px-4 py-2.5 text-sm font-medium text-brand-silver/80 hover:text-brand-electric hover:bg-brand-electric/5 border-l-2 border-transparent hover:border-brand-electric transition-all duration-150"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {SECTION_LINKS.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => handleSectionClick(id)}
              className="text-sm font-medium text-brand-silver hover:text-brand-electric transition-colors duration-200"
            >
              {label}
            </button>
          ))}

          <button
            onClick={() => handleSectionClick('contact')}
            className="ml-1 px-5 py-2.5 rounded-md bg-brand-electric text-white text-sm font-semibold hover:bg-[#2570e8] active:bg-[#1f60d0] transition-colors duration-200 whitespace-nowrap"
          >
            Get Emergency Help
          </button>
        </div>

        {/* Hamburger — 44×44px tap target */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          className="md:hidden flex items-center justify-center w-11 h-11 -mr-1 text-brand-silver hover:text-brand-electric transition-colors duration-200"
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6"  x2="6"  y2="18" />
              <line x1="6"  y1="6"  x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="3" y1="6"  x2="21" y2="6"  />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-brand-electric/20 bg-brand-navy px-6 py-3 flex flex-col gap-1">

          {/* Services — expandable group */}
          <button
            onClick={() => setMobileServicesOpen(v => !v)}
            className="flex items-center justify-between py-3 w-full text-left text-sm font-medium text-brand-silver hover:text-brand-electric transition-colors duration-200"
          >
            Services
            <ChevronDown className={`transition-transform duration-200 ${mobileServicesOpen ? 'rotate-180' : ''}`} />
          </button>

          {mobileServicesOpen && (
            <div className="flex flex-col pl-2 mb-1">
              {SERVICE_LINKS.map(({ label, route }) => (
                <Link
                  key={route}
                  to={route}
                  onClick={closeAll}
                  className="block py-2.5 pl-3 text-sm text-brand-silver/70 hover:text-brand-electric border-l-2 border-brand-electric/20 hover:border-brand-electric transition-all duration-150"
                >
                  {label}
                </Link>
              ))}
            </div>
          )}

          {SECTION_LINKS.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => handleSectionClick(id)}
              className="py-3 w-full text-left text-sm font-medium text-brand-silver hover:text-brand-electric transition-colors duration-200"
            >
              {label}
            </button>
          ))}

          <button
            onClick={() => handleSectionClick('contact')}
            className="mt-2 mb-2 w-full px-5 py-3 rounded-md bg-brand-electric text-white text-sm font-semibold text-center hover:bg-[#2570e8] active:bg-[#1f60d0] transition-colors duration-200"
          >
            Get Emergency Help
          </button>
        </div>
      )}
    </nav>
  )
}
