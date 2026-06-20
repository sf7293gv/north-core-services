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

/* ── Phone helpers ─────────────────────────────────────────── */
function formatPhoneDisplay(digits) {
  const d = (digits ?? '').replace(/\D/g, '').slice(0, 10)
  if (d.length === 0) return ''
  if (d.length <= 3) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

function displayPhone(digits) {
  if (!digits || digits.length !== 10) return digits || ''
  return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

/* ── Date helper ───────────────────────────────────────────── */
function fmtDateDisplay(dateStr) {
  if (!dateStr) return 'Not specified'
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

/* ── Validation ────────────────────────────────────────────── */
const NAME_RE  = /^[A-Za-z\s\-']+$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateName(v) {
  const s = v.trim()
  if (!s) return 'Full name is required'
  if (s.length < 2) return 'Name must be at least 2 characters'
  if (!NAME_RE.test(s)) return 'Letters, spaces, hyphens, and apostrophes only'
  return null
}

function validatePhone(digits) {
  if (!digits || digits.length === 0) return 'Phone number is required'
  if (digits.replace(/\D/g, '').length !== 10) return 'Enter a valid 10-digit US phone number'
  return null
}

function validateEmail(v) {
  if (!v.trim()) return 'Email address is required'
  if (!EMAIL_RE.test(v.trim())) return 'Enter a valid email address'
  return null
}

function validateService(v) {
  if (!v) return 'Please select a service'
  return null
}

function validateDate(v) {
  if (!v) return null
  const [year, month, day] = v.split('-').map(Number)
  const selected = new Date(year, month - 1, day)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  if (selected < today) return 'Preferred date cannot be in the past'
  return null
}

function validateMessage(v) {
  if (v.length > 500) return 'Message cannot exceed 500 characters'
  return null
}

export default function ServicePage({ serviceName, serviceKey, description, whatWeDoItems }) {
  const [photos, setPhotos]               = useState([])
  const [photosLoading, setPhotosLoading] = useState(true)

  // form.phone stores raw digits only, e.g. "6122493134"
  const emptyForm = { name: '', phone: '', email: '', service: serviceName, date: '', message: '' }
  const [form, setForm]           = useState(emptyForm)
  const [step, setStep]           = useState('form') // 'form' | 'confirm' | 'success'
  const [loading, setLoading]     = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [errors, setErrors]       = useState({})
  const [touched, setTouched]     = useState({})

  const navigate = useNavigate()
  const mounted  = useRef(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  useEffect(() => {
    async function fetchPhotos() {
      console.log('[ServicePage] fetching photos for serviceKey:', serviceKey)
      const { data, error } = await supabase
        .from('photos')
        .select('id, url, category, size, display_order')
        .eq('category', serviceKey)
        .eq('visible', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
      console.log('[ServicePage] photos result:', { serviceKey, count: data?.length ?? 0, data, error })
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
    if (touched[name]) {
      const err = name === 'phone' ? validatePhone(value) : validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: err }))
    }
  }

  function handlePhoneChange(e) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
    setForm(prev => ({ ...prev, phone: digits }))
    if (submitError) setSubmitError(null)
    if (touched.phone) {
      setErrors(prev => ({ ...prev, phone: validatePhone(digits) }))
    }
  }

  function handleBlur(e) {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    const value = name === 'phone' ? form.phone : e.target.value
    const err = name === 'phone' ? validatePhone(value) : validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: err }))
  }

  function validateField(name, value) {
    switch (name) {
      case 'name':    return validateName(value)
      case 'email':   return validateEmail(value)
      case 'service': return validateService(value)
      case 'date':    return validateDate(value)
      case 'message': return validateMessage(value)
      default:        return null
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const allErrors = {
      name:    validateName(form.name),
      phone:   validatePhone(form.phone),
      email:   validateEmail(form.email),
      service: validateService(form.service),
      date:    validateDate(form.date),
      message: validateMessage(form.message),
    }
    setErrors(allErrors)
    setTouched({ name: true, phone: true, email: true, service: true, date: true, message: true })
    if (Object.values(allErrors).some(err => err !== null)) return
    setStep('confirm')
  }

  async function handleConfirm() {
    setLoading(true)
    setSubmitError(null)

    const payload = {
      full_name:      form.name,
      phone:          form.phone ? `+1${form.phone}` : '',
      email:          form.email,
      service:        form.service,
      preferred_date: form.date || null,
      message:        form.message,
    }

    const { error } = await supabase.from('bookings').insert([payload])

    setLoading(false)

    if (error) {
      console.error('Booking insert error:', error)
      setSubmitError('Something went wrong. Please try again or call us directly.')
      return
    }

    // Fire-and-forget — don't block success UI if email fails
    supabase.functions
      .invoke('send-booking-email', { body: payload })
      .then(({ error: fnErr }) => {
        if (fnErr) console.error('send-booking-email error:', fnErr)
      })

    setStep('success')
    setForm(emptyForm)
    setErrors({})
    setTouched({})
  }

  const isValid = (
    !validateName(form.name) &&
    !validatePhone(form.phone) &&
    !validateEmail(form.email) &&
    !validateService(form.service) &&
    !validateDate(form.date) &&
    !validateMessage(form.message)
  )

  const todayStr = new Date().toISOString().slice(0, 10)

  function goToServices() {
    navigate('/')
    setTimeout(() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }), 80)
  }

  const inputBase =
    'w-full rounded-lg px-4 py-3 bg-[#0d1435] text-brand-white text-sm placeholder:text-brand-silver/40 border border-brand-electric/30 focus:outline-none focus:ring-2 focus:ring-brand-electric/60 focus:border-brand-electric transition-colors duration-200'

  function FieldError({ name }) {
    return touched[name] && errors[name]
      ? <p className="text-xs text-red-400 mt-1">{errors[name]}</p>
      : null
  }

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
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-electric/60 to-transparent" />

        <div className="max-w-6xl mx-auto w-full">
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
      <section className="py-16 md:py-24" style={{ borderTop: '1px solid rgba(46,127,255,0.1)' }}>
        <div className="max-w-6xl mx-auto px-6">
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
            <p className="text-center font-sans text-brand-silver/50 py-16 text-sm">Photos coming soon.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {photos.map((photo) => {
                const size    = photo.size ?? 'medium'
                const isLarge = size === 'large'
                const imgH    = size === 'small' ? 'h-44' : size === 'large' ? 'h-72' : 'h-56'
                return (
                  <div
                    key={photo.id}
                    className={`group overflow-hidden rounded-xl border border-brand-electric/20 hover:border-brand-electric/60 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(46,127,255,0.18)] ${isLarge ? 'sm:col-span-2' : ''}`}
                  >
                    <img
                      src={photo.url}
                      alt=""
                      loading="lazy"
                      className={`w-full ${imgH} object-cover group-hover:scale-105 transition-transform duration-500`}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Booking form ────────────────────────────────────────── */}
      <section className="py-16 md:py-24" style={{ borderTop: '1px solid rgba(46,127,255,0.15)' }}>
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

          {/* ── Success ── */}
          {step === 'success' && (
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
                onClick={() => setStep('form')}
                className="mt-2 text-xs text-brand-electric/70 hover:text-brand-electric underline underline-offset-2 transition-colors duration-200"
              >
                Send another message
              </button>
            </div>
          )}

          {/* ── Confirm ── */}
          {step === 'confirm' && (
            <div className="rounded-xl border border-brand-electric/20 bg-[#0d1435] p-6 flex flex-col gap-5">
              <div>
                <p className="font-display text-xl tracking-widest text-brand-electric mb-1">REVIEW YOUR REQUEST</p>
                <p className="font-sans text-xs text-brand-silver/50">Please confirm your information before submitting.</p>
              </div>

              <dl className="flex flex-col gap-3.5">
                {[
                  { label: 'Name',           value: form.name },
                  { label: 'Phone',          value: displayPhone(form.phone) },
                  { label: 'Email',          value: form.email },
                  { label: 'Service',        value: form.service },
                  { label: 'Preferred Date', value: fmtDateDisplay(form.date) },
                  { label: 'Message',        value: form.message || 'None' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                    <dt className="font-sans text-[11px] font-semibold text-brand-silver/40 uppercase tracking-wider sm:w-28 shrink-0 mt-0.5">
                      {label}
                    </dt>
                    <dd className={`font-sans text-sm leading-relaxed break-words ${label === 'Message' ? 'text-brand-silver/70 whitespace-pre-wrap' : 'text-brand-white'}`}>
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setStep('form')}
                  className="flex-1 py-3 rounded-lg border border-brand-electric/25 text-brand-silver hover:text-brand-white hover:border-brand-electric/50 text-sm font-semibold transition-colors duration-200"
                >
                  ← Edit
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-[2] py-3 rounded-lg bg-brand-electric text-white font-display text-xl tracking-widest hover:bg-[#2570e8] active:bg-[#1f60d0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? 'SUBMITTING…' : 'CONFIRM & SUBMIT'}
                </button>
              </div>

              {submitError && (
                <p className="font-sans text-sm text-red-400 text-center leading-relaxed">{submitError}</p>
              )}
            </div>
          )}

          {/* ── Form ── */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

              {/* Name + Phone */}
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
                    onBlur={handleBlur}
                    className={inputBase}
                  />
                  <FieldError name="name" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="sp-phone" className="font-sans text-xs font-semibold text-brand-silver tracking-wide uppercase">
                    Phone Number <span className="text-brand-electric">*</span>
                  </label>
                  <div className={`flex items-center rounded-lg bg-[#0d1435] border ${touched.phone && errors.phone ? 'border-red-400/60' : 'border-brand-electric/30'} focus-within:ring-2 focus-within:ring-brand-electric/60 focus-within:border-brand-electric transition-colors duration-200`}>
                    <span className="pl-3 pr-2.5 py-3 text-sm font-medium text-brand-silver/50 border-r border-brand-electric/20 select-none shrink-0">
                      +1
                    </span>
                    <input
                      id="sp-phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      placeholder="(612) 249-3134"
                      value={formatPhoneDisplay(form.phone)}
                      onChange={handlePhoneChange}
                      onBlur={handleBlur}
                      className="flex-1 px-3 py-3 bg-transparent text-brand-white text-sm placeholder:text-brand-silver/40 focus:outline-none"
                    />
                  </div>
                  <FieldError name="phone" />
                </div>
              </div>

              {/* Email */}
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
                  onBlur={handleBlur}
                  className={inputBase}
                />
                <FieldError name="email" />
              </div>

              {/* Service + Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="sp-service" className="font-sans text-xs font-semibold text-brand-silver tracking-wide uppercase">
                    Service Needed <span className="text-brand-electric">*</span>
                  </label>
                  <select
                    id="sp-service"
                    name="service"
                    value={form.service}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputBase + ' cursor-pointer'}
                  >
                    <option value="" disabled>Select a service…</option>
                    {SERVICE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <FieldError name="service" />
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
                    min={todayStr}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputBase + ' [color-scheme:dark]'}
                  />
                  <FieldError name="date" />
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="sp-message" className="font-sans text-xs font-semibold text-brand-silver tracking-wide uppercase">
                    Message / Details
                  </label>
                  <span className={`text-xs tabular-nums ${form.message.length > 500 ? 'text-red-400 font-semibold' : 'text-brand-silver/40'}`}>
                    {form.message.length} / 500
                  </span>
                </div>
                <textarea
                  id="sp-message"
                  name="message"
                  rows={4}
                  placeholder="Describe the damage or service needed…"
                  value={form.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputBase + ' resize-none'}
                />
                <FieldError name="message" />
              </div>

              <button
                type="submit"
                disabled={!isValid}
                className="animate-glow-pulse w-full mt-2 py-4 rounded-lg bg-brand-electric text-white font-display text-2xl tracking-widest hover:bg-[#2570e8] active:bg-[#1f60d0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                SEND REQUEST
              </button>

            </form>
          )}

        </div>
      </section>

    </div>
  )
}
