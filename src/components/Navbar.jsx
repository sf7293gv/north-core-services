import { useState } from 'react'
import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Services', id: 'services' },
  { label: 'About',    id: 'about'    },
  { label: 'Contact',  id: 'contact'  },
]

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function Navbar() {
  const [open, setOpen] = useState(false)

  function handleNavClick(id) {
    scrollTo(id)
    setOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-navy border-b border-brand-electric/20">

      {/* Main bar */}
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Wordmark — smaller on xs to avoid overflow */}
        <Link to="/" className="flex flex-col leading-none group min-w-0">
          <span className="font-display text-[1.3rem] sm:text-[1.6rem] tracking-widest text-brand-white truncate">
            NORTH CORE SERVICES
          </span>
          <span className="hidden sm:block text-[0.65rem] font-sans tracking-wider text-brand-silver/70 mt-0.5">
            Water · Fire · Mold · Storm
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => handleNavClick(id)}
              className="text-sm font-medium text-brand-silver hover:text-brand-electric transition-colors duration-200"
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => handleNavClick('contact')}
            className="ml-1 px-5 py-2.5 rounded-md bg-brand-electric text-white text-sm font-semibold hover:bg-[#2570e8] active:bg-[#1f60d0] transition-colors duration-200 whitespace-nowrap"
          >
            Get Emergency Help
          </button>
        </div>

        {/* Hamburger — 44×44px tap target */}
        <button
          onClick={() => setOpen(v => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          className="md:hidden flex items-center justify-center w-11 h-11 -mr-1 text-brand-silver hover:text-brand-electric transition-colors duration-200"
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6"  y1="6" x2="18" y2="18" />
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

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-brand-electric/20 bg-brand-navy px-6 py-3 flex flex-col gap-1">
          {NAV_LINKS.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => handleNavClick(id)}
              className="py-3 w-full text-left text-sm font-medium text-brand-silver hover:text-brand-electric transition-colors duration-200"
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => handleNavClick('contact')}
            className="mt-2 mb-2 w-full px-5 py-3 rounded-md bg-brand-electric text-white text-sm font-semibold text-center hover:bg-[#2570e8] active:bg-[#1f60d0] transition-colors duration-200"
          >
            Get Emergency Help
          </button>
        </div>
      )}
    </nav>
  )
}
