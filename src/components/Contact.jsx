import { useState } from 'react'
import { supabase } from '../lib/supabase'

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
