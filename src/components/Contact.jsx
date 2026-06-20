import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const WA_TEXT = encodeURIComponent("Hi, I'd like to get a quote for restoration services.")

function buildWaLink(phone) {
  const digits = phone ? phone.replace(/\D/g, '') : ''
  const number = digits.length >= 10
    ? (digits.startsWith('1') ? digits : '1' + digits)
    : '1XXXXXXXXXX'
  return `https://wa.me/${number}?text=${WA_TEXT}`
}

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

/* ── Static data ───────────────────────────────────────────── */
const INFO_ITEMS = [
  {
    label: 'Phone',
    value: '(XXX) XXX-XXXX',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v2.92z" />
      </svg>
    ),
  },
  {
    label: 'Email',
    value: 'info@northcoreservices.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    label: 'Location',
    value: 'Minneapolis, MN',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  },
  {
    label: 'Hours',
    value: 'Available 24/7 for Emergencies',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
]

const SERVICE_OPTIONS = [
  'Water Damage Restoration',
  'Water Mitigation',
  'Carpet Cleaning',
  'Insulation Removal & Restoration',
  'Other',
]

const EMPTY_FORM = { name: '', phone: '', email: '', service: '', date: '', message: '' }

export default function Contact() {
  // form.phone stores raw digits only, e.g. "6122493134"
  const [form, setForm]           = useState(EMPTY_FORM)
  const [step, setStep]           = useState('form') // 'form' | 'confirm' | 'success'
  const [loading, setLoading]     = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [errors, setErrors]       = useState({})
  const [touched, setTouched]     = useState({})
  const [waLink, setWaLink]       = useState(buildWaLink(null))

  useEffect(() => {
    supabase
      .from('settings')
      .select('phone')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.phone) setWaLink(buildWaLink(data.phone))
      })
  }, [])

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
    setForm(EMPTY_FORM)
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

  const inputBase =
    'w-full rounded-lg px-4 py-3 bg-[#0d1435] text-brand-white text-sm placeholder:text-brand-silver/40 border border-brand-electric/30 focus:outline-none focus:ring-2 focus:ring-brand-electric/60 focus:border-brand-electric transition-colors duration-200'

  function FieldError({ name }) {
    return touched[name] && errors[name]
      ? <p className="text-xs text-red-400 mt-1">{errors[name]}</p>
      : null
  }

  return (
    <section
      id="contact"
      className="bg-brand-navy py-16 md:py-32"
      style={{ borderTop: '1px solid rgba(46,127,255,0.2)' }}
    >
      <div className="max-w-6xl mx-auto px-6">

        {/* Section header */}
        <div className="text-center mb-10 md:mb-16">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-brand-electric mb-4">
            <span className="w-5 h-px bg-brand-electric inline-block" />
            Get in Touch
            <span className="w-5 h-px bg-brand-electric inline-block" />
          </p>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-brand-white mb-4 tracking-wide">
            Request a Free Assessment
          </h2>
          <p className="font-sans text-brand-silver text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Fill out the form below and our team will get back to you as soon as possible — usually within the hour.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left — contact info */}
          <div className="flex flex-col gap-6">
            {INFO_ITEMS.map(({ label, value, icon }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="mt-0.5 shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-brand-electric/10 text-brand-electric">
                  {icon}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-sans font-semibold text-sm text-brand-white tracking-wide">{label}</span>
                  <span className="font-sans text-sm text-brand-silver leading-relaxed">{value}</span>
                </div>
              </div>
            ))}

            {/* WhatsApp card */}
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
              <div
                className="mt-0.5 shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(37,211,102,0.12)', color: '#25D366' }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-sans font-semibold text-sm text-brand-white tracking-wide">WhatsApp</span>
                <span className="font-sans text-sm leading-relaxed group-hover:underline underline-offset-2" style={{ color: '#25D366' }}>
                  Message us directly
                </span>
              </div>
            </a>

            <p className="font-sans text-xs text-brand-silver/60 italic mt-2">
              Business hours and exact address coming soon.
            </p>
          </div>

          {/* Right — form / confirm / success */}
          <div>

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
                    <label htmlFor="c-name" className="font-sans text-xs font-semibold text-brand-silver tracking-wide uppercase">
                      Full Name <span className="text-brand-electric">*</span>
                    </label>
                    <input
                      id="c-name"
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
                    <label htmlFor="c-phone" className="font-sans text-xs font-semibold text-brand-silver tracking-wide uppercase">
                      Phone Number <span className="text-brand-electric">*</span>
                    </label>
                    <div className={`flex items-center rounded-lg bg-[#0d1435] border ${touched.phone && errors.phone ? 'border-red-400/60' : 'border-brand-electric/30'} focus-within:ring-2 focus-within:ring-brand-electric/60 focus-within:border-brand-electric transition-colors duration-200`}>
                      <span className="pl-3 pr-2.5 py-3 text-sm font-medium text-brand-silver/50 border-r border-brand-electric/20 select-none shrink-0">
                        +1
                      </span>
                      <input
                        id="c-phone"
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
                  <label htmlFor="c-email" className="font-sans text-xs font-semibold text-brand-silver tracking-wide uppercase">
                    Email Address <span className="text-brand-electric">*</span>
                  </label>
                  <input
                    id="c-email"
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
                    <label htmlFor="c-service" className="font-sans text-xs font-semibold text-brand-silver tracking-wide uppercase">
                      Service Needed <span className="text-brand-electric">*</span>
                    </label>
                    <select
                      id="c-service"
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
                    <label htmlFor="c-date" className="font-sans text-xs font-semibold text-brand-silver tracking-wide uppercase">
                      Preferred Date
                    </label>
                    <input
                      id="c-date"
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
                    <label htmlFor="c-message" className="font-sans text-xs font-semibold text-brand-silver tracking-wide uppercase">
                      Message / Details
                    </label>
                    <span className={`text-xs tabular-nums ${form.message.length > 500 ? 'text-red-400 font-semibold' : 'text-brand-silver/40'}`}>
                      {form.message.length} / 500
                    </span>
                  </div>
                  <textarea
                    id="c-message"
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

                {/* Submit */}
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
        </div>
      </div>
    </section>
  )
}
