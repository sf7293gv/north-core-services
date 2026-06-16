const STATS = [
  { value: '24/7', label: 'Emergency Response' },
  { value: '100%', label: 'Licensed & Insured' },
  { value: '5★',   label: 'Rated on Google'   },
]

const PILLARS = [
  {
    title: 'Fast Response',
    body: "We're on site quickly because every minute of water or fire damage counts.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    title: 'Certified Technicians',
    body: 'Our team is trained and certified in the latest restoration techniques and safety standards.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
      </svg>
    ),
  },
  {
    title: 'Insurance Friendly',
    body: 'We work directly with your insurance company to make the claims process smooth and stress-free.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 2L4 6v5c0 5.25 3.5 10 8 11.5C17.5 21 21 16.25 21 11V6l-9-4z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Advanced Equipment',
    body: 'Industrial-grade drying, extraction, and detection equipment for thorough, lasting results.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <path d="M7 8h4m2 0h4" />
        <path d="M7 12h2m2 0h6" />
      </svg>
    ),
  },
  {
    title: 'Transparent Pricing',
    body: 'No hidden fees. You get a clear, honest estimate before any work begins.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" />
        <circle cx="12" cy="12" r="5" />
        <path d="M12 9v3l2 2" />
      </svg>
    ),
  },
  {
    title: 'Local & Trusted',
    body: "Proudly serving the Minneapolis area. We're your neighbors, and we treat your property like our own.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  },
]

export default function WhyUs() {
  return (
    <section
      id="about"
      className="py-16 md:py-32"
      style={{ background: 'linear-gradient(180deg, #0d1435 0%, #0a0f2c 100%)' }}
    >
      <div className="max-w-6xl mx-auto px-6">

        {/* Section header */}
        <div className="text-center mb-10 md:mb-14">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-brand-electric mb-4">
            <span className="w-5 h-px bg-brand-electric inline-block" />
            Why Choose Us
            <span className="w-5 h-px bg-brand-electric inline-block" />
          </p>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-brand-white mb-4 tracking-wide">
            Built for the Moments<br className="hidden sm:block" /> That Matter Most
          </h2>
          <p className="font-sans text-brand-silver text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            When your home or business is damaged, you need a team that moves fast, works clean, and stands behind their work.
          </p>
        </div>

        {/* Stats row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-0 mb-12 md:mb-20 rounded-xl overflow-hidden border border-brand-electric/10 bg-[#0d1435]">
          {STATS.map(({ value, label }, i) => (
            <div key={label} className="relative flex-1 w-full flex flex-col items-center py-8 px-6">
              {/* Vertical divider — hidden on mobile, shown between items on sm+ */}
              {i > 0 && (
                <div className="hidden sm:block absolute left-0 top-1/4 bottom-1/4 w-px bg-brand-electric/15" />
              )}
              {/* Horizontal divider on mobile */}
              {i > 0 && (
                <div className="sm:hidden absolute top-0 left-4 right-4 h-px bg-brand-electric/20" />
              )}
              <span className="font-display text-5xl text-brand-electric mb-1 leading-none">
                {value}
              </span>
              <span className="font-sans text-sm text-brand-silver tracking-wide">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Trust pillars grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PILLARS.map(({ title, body, icon }) => (
            <div
              key={title}
              className="group relative flex gap-4 rounded-lg px-5 py-6 transition-all duration-200 hover:bg-brand-electric/[0.05]"
              style={{ borderLeft: '3px solid #2e7fff' }}
            >
              {/* Icon */}
              <div className="mt-0.5 shrink-0 text-brand-electric">
                {icon}
              </div>

              {/* Text */}
              <div className="flex flex-col gap-1.5">
                <h3 className="font-sans font-bold text-brand-white text-sm tracking-wide">
                  {title}
                </h3>
                <p className="font-sans text-brand-silver text-sm leading-relaxed">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
