const SERVICES = [
  {
    label: 'Water Damage',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M12 2C9 7 6 11.5 6 15a6 6 0 0012 0c0-3.5-3-8-6-13z" />
      </svg>
    ),
  },
  {
    label: 'Fire Damage',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M12 2c-1.5 3.5-4.5 6.5-4.5 10a6.5 6.5 0 0013 0c0-2-1-3.5-2-4.5-.5 1.5-1.5 2.5-3 2.5C14 8 14 4.5 12 2z" />
        <path d="M12 18a2.5 2.5 0 01-2.5-2.5C9.5 14 11 13 12 12c1 1 2.5 2 2.5 3.5A2.5 2.5 0 0112 18z" />
      </svg>
    ),
  },
  {
    label: 'Mold Removal',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <circle cx="12" cy="12" r="2.5" />
        <path d="M12 9.5C12 6.5 9.5 4 7 5" />
        <path d="M14.5 12C17.5 12 20 9.5 19 7" />
        <path d="M12 14.5C12 17.5 14.5 20 17 19" />
        <path d="M9.5 12C6.5 12 4 14.5 5 17" />
      </svg>
    ),
  },
  {
    label: 'Storm Damage',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M13 3L5 13h7l-2 8 9-11h-7l3-7z" />
      </svg>
    ),
  },
]

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
      style={{ background: 'radial-gradient(ellipse 90% 80% at 50% 40%, #1a3a8f 0%, #0a0f2c 65%)' }}
    >

      {/* Subtle grid overlay for texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(#2e7fff 1px, transparent 1px), linear-gradient(90deg, #2e7fff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">

        {/* Eyebrow */}
        <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-brand-electric mb-6">
          <span className="w-6 h-px bg-brand-electric inline-block" />
          24 / 7 Emergency Response
          <span className="w-6 h-px bg-brand-electric inline-block" />
        </p>

        {/* Headline */}
        <h1 className="font-display text-3xl sm:text-4xl md:text-6xl text-brand-white leading-[1.05] mb-5 tracking-wide">
          When Disaster Strikes,<br />
          <span className="text-brand-electric">We Respond.</span>
        </h1>

        {/* Subheadline */}
        <p className="font-sans text-base md:text-lg font-medium text-brand-silver max-w-xl mx-auto mb-10 leading-relaxed">
          24/7 Emergency Restoration Services — Water, Fire, Mold &amp; Storm Damage
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="animate-glow-pulse w-full sm:w-auto px-8 py-3.5 rounded-lg bg-brand-electric text-white font-bold text-sm tracking-wide hover:bg-[#2570e8] hover:scale-105 active:scale-100 transition-all duration-200"
          >
            Get Emergency Help
          </button>
          <button
            onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg border-2 border-brand-electric text-brand-electric font-bold text-sm tracking-wide hover:bg-brand-electric/10 hover:scale-105 active:scale-100 transition-all duration-200"
          >
            Our Services
          </button>
        </div>

        {/* Service badges — 2×2 grid on mobile, single row on sm+ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-6 sm:gap-10 place-items-center">
          {SERVICES.map(({ label, icon }) => (
            <div key={label} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-brand-navy/60 border border-brand-electric/25 text-brand-electric group-hover:border-brand-electric/60 group-hover:bg-brand-electric/10 transition-all duration-300">
                {icon}
              </div>
              <span className="text-xs font-medium text-brand-silver tracking-wide whitespace-nowrap">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade into page */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-brand-navy to-transparent pointer-events-none" />
    </section>
  )
}
