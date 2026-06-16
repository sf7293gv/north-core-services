import { Link } from 'react-router-dom'

const QUICK_LINKS = [
  { label: 'Services', id: 'services' },
  { label: 'About',    id: 'about'    },
  { label: 'Contact',  id: 'contact'  },
]

export default function Footer() {
  return (
    <footer
      className="py-16"
      style={{
        background: '#070b1f',
        borderTop: '1px solid rgba(46,127,255,0.15)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6">

        {/* Three-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 pb-12">

          {/* Col 1 — Brand */}
          <div className="flex flex-col gap-3">
            <Link to="/" className="font-display text-3xl text-brand-white tracking-widest leading-none">
              NORTH CORE SERVICES
            </Link>
            <p className="font-sans text-xs tracking-wider text-brand-silver/70">
              Water · Fire · Mold · Storm
            </p>
            <p className="font-sans text-sm text-brand-silver/70 leading-relaxed mt-1">
              Professional restoration services serving the Minneapolis area — available 24/7.
            </p>
          </div>

          {/* Col 2 — Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="font-sans font-bold text-xs tracking-[0.18em] uppercase text-brand-white">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-3">
              {QUICK_LINKS.map(({ label, id }) => (
                <li key={label}>
                  <button
                    onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
                    className="py-2 font-sans text-sm text-brand-silver/70 hover:text-brand-electric transition-colors duration-200"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Emergency CTA */}
          <div className="flex flex-col gap-4">
            <h3 className="font-sans font-bold text-sm text-brand-white">
              Need Emergency Help?
            </h3>
            <p className="font-sans text-sm text-brand-silver/70 leading-relaxed">
              We're available around the clock for urgent restoration needs.
            </p>
            <a
              href="tel:+10000000000"
              className="mt-1 w-full sm:w-auto md:w-full py-3 px-6 rounded-lg bg-brand-electric text-white font-display text-xl tracking-widest text-center hover:bg-[#2570e8] active:bg-[#1f60d0] transition-colors duration-200"
            >
              CALL NOW
            </a>
            <p className="font-sans text-sm text-brand-electric text-center md:text-left">
              (XXX) XXX-XXXX
            </p>
          </div>

        </div>

        {/* Divider */}
        <div className="h-px bg-brand-electric/10 mb-6" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-xs text-brand-silver/50">
            © 2025 North Core Services. All rights reserved.
          </p>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-brand-electric bg-brand-electric/10 tracking-wide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
              <path d="M12 2L4 6v5c0 5.25 3.5 10 8 11.5C17.5 21 21 16.25 21 11V6l-9-4z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            Licensed &amp; Insured
          </span>
        </div>

      </div>
    </footer>
  )
}
