import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const SERVICE_OPTIONS = [
  'Water Damage Restoration',
  'Water Mitigation',
  'Carpet Cleaning',
  'Insulation Removal & Restoration',
  'Other',
]

export default function ServicePage({ serviceName, serviceKey, description, whatWeDoItems }) {
  const [photos, setPhotos]               = useState([])
  const [photosLoading, setPhotosLoading] = useState(true)

  const [form, setForm]           = useState({ name: '', phone: '', email: '', service: serviceName, date: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const navigate = useNavigate()
  const mounted  = useRef(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  useEffect(() => {
    async function fetchPhotos() {
      const { data } = await supabase
        .from('photos')
        .select('id, url, category')
        .eq('category', serviceKey)
        .order('created_at', { ascending: false })
      if (mounted.current) {
        setPhotos(data || [])
        setPhotosLoading(false)
      }
    }
    fetchPhotos()
  }, [serviceKey])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (submitError) setSubmitError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormLoading(true)
    setSubmitError(null)

    const { error } = await supabase.from('bookings').insert([{
      full_name:      form.name,
      phone:          form.phone,
      email:          form.email,
      service:        form.service,
      preferred_date: form.date || null,
      message:        form.message,
    }])

    setFormLoading(false)

    if (error) {
      console.error('Booking insert error:', error)
      setSubmitError('Something went wrong. Please try again or call us directly.')
      return
    }

    setSubmitted(true)
    setForm({ name: '', phone: '', email: '', service: serviceName, date: '', message: '' })
  }

  function goToServices() {
    navigate('/')
    setTimeout(() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }), 80)
  }

  const inputBase =
    'w-full rounded-lg px-4 py-3 bg-[#0d1435] text-brand-white text-sm placeholder:text-brand-silver/40 border border-brand-electric/30 focus:outline-none focus:ring-2 focus:ring-brand-electric/60 focus:border-brand-electric transition-colors duration-200'

  return (
    <div className="min-h-screen bg-brand-navy">

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col justify-end px-6 pt-28 pb-14"
        style={{
          minHeight: '40vh',
          background: 'radial-gradient(ellipse at 50% -10%, #1a3a8f 0%, #0a0f2c 68%)',
          borderBottom: '1px solid rgba(46,127,255,0.15)',
        }}
      >
        {/* Electric glow line top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-electric/60 to-transparent" />

        <div className="max-w-6xl mx-auto w-full">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-brand-silver/60 font-sans mb-7">
            <Link to="/" className="hover:text-brand-electric transition-colors duration-200">Home</Link>
            <span>/</span>
            <button onClick={goToServices} className="hover:text-brand-electric transition-colors duration-200">
              Services
            </button>
            <span>/</span>
            <span className="text-brand-silver/90 truncate">{serviceName}</span>
          </nav>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-brand-white tracking-widest leading-none mb-5">
            {serviceName.toUpperCase()}
          </h1>
          <p className="font-sans text-brand-silver text-base md:text-lg max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>
      </section>

      {/* ── What We Do ──────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* Left — copy */}
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-brand-electric mb-5">
                <span className="w-5 h-px bg-brand-electric inline-block" />
                What We Do
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-brand-white tracking-wide mb-5 leading-tight">
                {serviceName}
              </h2>
              <p className="font-sans text-brand-silver text-base leading-relaxed">
                {description}
              </p>
            </div>

            {/* Right — checklist */}
            <ul className="flex flex-col gap-3.5 pt-2">
              {whatWeDoItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 w-[22px] h-[22px] flex items-center justify-center rounded-full bg-brand-electric/10 text-brand-electric">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span className="font-sans text-brand-silver text-sm md:text-base leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

          </div>
        </div>
      </section>

      {/* ── Our Work ────────────────────────────────────────────── */}
      <section
        className="py-16 md:py-24"
        style={{ borderTop: '1px solid rgba(46,127,255,0.1)' }}
      >
        <div className="max-w-6xl mx-auto px-6">

          {/* Header */}
          <div className="text-center mb-12">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-brand-electric mb-4">
              <span className="w-5 h-px bg-brand-electric inline-block" />
              Gallery
              <span className="w-5 h-px bg-brand-electric inline-block" />
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-brand-white tracking-wide">
              Our Work
            </h2>
          </div>

          {photosLoading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-brand-silver/60 font-sans text-sm">
              <svg className="animate-spin w-5 h-5 text-brand-electric" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Loading photos…
            </div>
          ) : photos.length === 0 ? (
            <p className="text-center font-sans text-brand-silver/50 py-16 text-sm">
              Photos coming soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group overflow-hidden rounded-xl border border-brand-electric/20 hover:border-brand-electric/60 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(46,127,255,0.18)]"
                >
                  <img
                    src={photo.url}
                    alt=""
                    loading="lazy"
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ── Booking form ────────────────────────────────────────── */}
      <section
        className="py-16 md:py-24"
        style={{ borderTop: '1px solid rgba(46,127,255,0.15)' }}
      >
        <div className="max-w-3xl mx-auto px-6">

          <div className="text-center mb-10">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-brand-electric mb-4">
              <span className="w-5 h-px bg-brand-electric inline-block" />
              Get Started
              <span className="w-5 h-px bg-brand-electric inline-block" />
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-brand-white tracking-wide mb-4 leading-tight">
              Book a {serviceName} Assessment
            </h2>
            <p className="font-sans text-brand-silver text-base leading-relaxed">
              Fill out the form below and our team will get back to you as soon as possible — usually within the hour.
            </p>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center rounded-xl border border-brand-electric/20 bg-[#0d1435]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-brand-electric">
                <circle cx="12" cy="12" r="10" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <p className="font-display text-3xl text-brand-electric tracking-wide">Message Received</p>
              <p className="font-sans text-brand-silver text-sm max-w-xs leading-relaxed">
                Thank you! We'll be in touch shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 text-xs text-brand-electric/70 hover:text-brand-electric underline underline-offset-2 transition-colors duration-200"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="sp-name" className="font-sans text-xs font-semibold text-brand-silver tracking-wide uppercase">
                    Full Name <span className="text-brand-electric">*</span>
                  </label>
                  <input
                    id="sp-name"
                    name="name"
                    type="text"
                    required
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={handleChange}
                    className={inputBase}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="sp-phone" className="font-sans text-xs font-semibold text-brand-silver tracking-wide uppercase">
                    Phone Number
                  </label>
                  <input
                    id="sp-phone"
                    name="phone"
                    type="tel"
                    placeholder="(XXX) XXX-XXXX"
                    value={form.phone}
                    onChange={handleChange}
                    className={inputBase}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="sp-email" className="font-sans text-xs font-semibold text-brand-silver tracking-wide uppercase">
                  Email Address <span className="text-brand-electric">*</span>
                </label>
                <input
                  id="sp-email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className={inputBase}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="sp-service" className="font-sans text-xs font-semibold text-brand-silver tracking-wide uppercase">
                    Service Needed
                  </label>
                  <select
                    id="sp-service"
                    name="service"
                    value={form.service}
                    onChange={handleChange}
                    className={inputBase + ' cursor-pointer'}
                  >
                    {SERVICE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="sp-date" className="font-sans text-xs font-semibold text-brand-silver tracking-wide uppercase">
                    Preferred Date
                  </label>
                  <input
                    id="sp-date"
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    className={inputBase + ' [color-scheme:dark]'}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="sp-message" className="font-sans text-xs font-semibold text-brand-silver tracking-wide uppercase">
                  Message / Details
                </label>
                <textarea
                  id="sp-message"
                  name="message"
                  rows={4}
                  placeholder="Describe the damage or service needed…"
                  value={form.message}
                  onChange={handleChange}
                  className={inputBase + ' resize-none'}
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="animate-glow-pulse w-full mt-2 py-4 rounded-lg bg-brand-electric text-white font-display text-2xl tracking-widest hover:bg-[#2570e8] active:bg-[#1f60d0] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {formLoading ? 'SENDING...' : 'SEND REQUEST'}
              </button>

              {submitError && (
                <p className="font-sans text-sm text-red-400 text-center leading-relaxed">
                  {submitError}
                </p>
              )}

            </form>
          )}
        </div>
      </section>

    </div>
  )
}
