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

const EMPTY_FORM = {
  name: '',
  phone: '',
  email: '',
  service: '',
  date: '',
  message: '',
}

export default function Contact() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [waLink, setWaLink] = useState(buildWaLink(null))

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
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setSubmitError(null)

    const { error } = await supabase.from('bookings').insert([{
      full_name:      form.name,
      phone:          form.phone,
      email:          form.email,
      service:        form.service,
      preferred_date: form.date || null,
      message:        form.message,
    }])

    setLoading(false)

    if (error) {
      console.error('Booking insert error:', error)
      setSubmitError('Something went wrong. Please try again or call us directly.')
      return
    }

    setSubmitted(true)
    setForm(EMPTY_FORM)
  }

  const inputBase =
    'w-full rounded-lg px-4 py-3 bg-[#0d1435] text-brand-white text-sm placeholder:text-brand-silver/40 border border-brand-electric/30 focus:outline-none focus:ring-2 focus:ring-brand-electric/60 focus:border-brand-electric transition-colors duration-200'

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
                  <span className="font-sans font-semibold text-sm text-brand-white tracking-wide">
                    {label}
                  </span>
                  <span className="font-sans text-sm text-brand-silver leading-relaxed">
                    {value}
                  </span>
                </div>
              </div>
            ))}

            {/* WhatsApp card */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 group"
            >
              <div
                className="mt-0.5 shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(37,211,102,0.12)', color: '#25D366' }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-sans font-semibold text-sm text-brand-white tracking-wide">
                  WhatsApp
                </span>
                <span
                  className="font-sans text-sm leading-relaxed group-hover:underline underline-offset-2"
                  style={{ color: '#25D366' }}
                >
                  Message us directly
                </span>
              </div>
            </a>

            <p className="font-sans text-xs text-brand-silver/60 italic mt-2">
              Business hours and exact address coming soon.
            </p>
          </div>

          {/* Right — booking form */}
          <div>
            {submitted ? (
              <div className="flex flex-col items-center justify-center gap-4 py-20 text-center rounded-xl border border-brand-electric/20 bg-[#0d1435]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-brand-electric">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <p className="font-display text-3xl text-brand-electric tracking-wide">
                  Message Received
                </p>
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

                {/* Name + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="font-sans text-xs font-semibold text-brand-silver tracking-wide uppercase">
                      Full Name <span className="text-brand-electric">*</span>
                    </label>
                    <input
                      id="name"
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
                    <label htmlFor="phone" className="font-sans text-xs font-semibold text-brand-silver tracking-wide uppercase">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="(XXX) XXX-XXXX"
                      value={form.phone}
                      onChange={handleChange}
                      className={inputBase}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="font-sans text-xs font-semibold text-brand-silver tracking-wide uppercase">
                    Email Address <span className="text-brand-electric">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className={inputBase}
                  />
                </div>

                {/* Service + Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="service" className="font-sans text-xs font-semibold text-brand-silver tracking-wide uppercase">
                      Service Needed
                    </label>
                    <select
                      id="service"
                      name="service"
                      value={form.service}
                      onChange={handleChange}
                      className={inputBase + ' cursor-pointer'}
                    >
                      <option value="" disabled>Select a service…</option>
                      {SERVICE_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="date" className="font-sans text-xs font-semibold text-brand-silver tracking-wide uppercase">
                      Preferred Date
                    </label>
                    <input
                      id="date"
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={handleChange}
                      className={inputBase + ' [color-scheme:dark]'}
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message" className="font-sans text-xs font-semibold text-brand-silver tracking-wide uppercase">
                    Message / Details
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Describe the damage or service needed…"
                    value={form.message}
                    onChange={handleChange}
                    className={inputBase + ' resize-none'}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="animate-glow-pulse w-full mt-2 py-4 rounded-lg bg-brand-electric text-white font-display text-2xl tracking-widest hover:bg-[#2570e8] active:bg-[#1f60d0] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? 'SENDING...' : 'SEND REQUEST'}
                </button>

                {/* Error message */}
                {submitError && (
                  <p className="font-sans text-sm text-red-400 text-center leading-relaxed">
                    {submitError}
                  </p>
                )}

              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
