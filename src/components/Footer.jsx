import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const QUICK_LINKS = [
  { label: 'Services', id: 'services' },
  { label: 'About',    id: 'about'    },
  { label: 'Contact',  id: 'contact'  },
]

export default function Footer() {
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    supabase
      .from('settings')
      .select('phone, facebook_url, instagram_url, google_url')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => { if (data) setSettings(data) })
  }, [])

  const phone     = settings?.phone     || null
  const fbUrl     = settings?.facebook_url  || null
  const igUrl     = settings?.instagram_url || null
  const googleUrl = settings?.google_url    || null
  const hasSocial = fbUrl || igUrl || googleUrl

  const telHref = phone
    ? `tel:+${phone.replace(/\D/g, '')}`
    : 'tel:+10000000000'

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

            {/* Social icons — only rendered when URLs are set in admin settings */}
            {hasSocial && (
              <div className="flex items-center gap-3 mt-1">
                {fbUrl && (
                  <a
                    href={fbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-electric/10 text-brand-silver/60 hover:bg-brand-electric/20 hover:text-brand-electric transition-colors duration-200"
                  >
                    <FacebookIcon />
                  </a>
                )}
                {igUrl && (
                  <a
                    href={igUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-electric/10 text-brand-silver/60 hover:bg-brand-electric/20 hover:text-brand-electric transition-colors duration-200"
                  >
                    <InstagramIcon />
                  </a>
                )}
                {googleUrl && (
                  <a
                    href={googleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Google Reviews"
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-electric/10 text-brand-silver/60 hover:bg-brand-electric/20 hover:text-brand-electric transition-colors duration-200"
                  >
                    <GoogleIcon />
                  </a>
                )}
              </div>
            )}
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
              href={telHref}
              className="mt-1 w-full sm:w-auto md:w-full py-3 px-6 rounded-lg bg-brand-electric text-white font-display text-xl tracking-widest text-center hover:bg-[#2570e8] active:bg-[#1f60d0] transition-colors duration-200"
            >
              CALL NOW
            </a>
            <p className="font-sans text-sm text-brand-electric text-center md:text-left">
              {phone || '(XXX) XXX-XXXX'}
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

/* ── Social icons ──────────────────────────────────────────── */
function FacebookIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}
