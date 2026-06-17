import { Link } from 'react-router-dom'

const SERVICES = [
  {
    title: 'Water Damage Restoration',
    route: '/services/water-damage-restoration',
    description:
      'Rapid response to flooding, leaks, and water intrusion. We extract, dry, and restore your property to pre-damage condition.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9">
        <path d="M12 2C9 7 6 11.5 6 15a6 6 0 0012 0c0-3.5-3-8-6-13z" />
        <path d="M9.5 15.5a3 3 0 004-1" />
      </svg>
    ),
  },
  {
    title: 'Water Mitigation',
    route: '/services/water-mitigation',
    description:
      'Proactive measures to minimize water damage before it spreads. Fast containment to protect your structure and belongings.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9">
        <path d="M12 2L4 6v5c0 5.25 3.5 10 8 11.5C17.5 21 21 16.25 21 11V6l-9-4z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Carpet Cleaning',
    route: '/services/carpet-cleaning',
    description:
      'Deep cleaning solutions that remove dirt, stains, and allergens — leaving your carpets fresh, sanitized, and restored.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9">
        <path d="M12 3v1M12 20v1M4.22 4.22l.7.7M19.08 19.08l.7.7M3 12h1M20 12h1M4.22 19.78l.7-.7M19.08 4.92l.7-.7" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    title: 'Insulation Removal & Restoration',
    route: '/services/insulation-removal',
    description:
      'Safe removal of damaged or contaminated insulation and full restoration to improve energy efficiency and air quality.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9">
        <rect x="2" y="4"  width="20" height="4" rx="1.5" />
        <rect x="2" y="10" width="20" height="4" rx="1.5" />
        <rect x="2" y="16" width="20" height="4" rx="1.5" />
      </svg>
    ),
  },
]

export default function Services() {
  return (
    <section id="services" className="bg-brand-navy py-16 md:py-32">
      <div className="max-w-6xl mx-auto px-6">

        {/* Section header */}
        <div className="text-center mb-10 md:mb-16">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-brand-electric mb-4">
            <span className="w-5 h-px bg-brand-electric inline-block" />
            What We Do
            <span className="w-5 h-px bg-brand-electric inline-block" />
          </p>
          <h2 className="font-display text-5xl md:text-6xl text-brand-white mb-4 tracking-wide">
            Our Services
          </h2>
          <p className="font-sans text-brand-silver text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Professional restoration and cleaning services you can count on — day or night.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SERVICES.map(({ title, route, description, icon }) => (
            <Link
              key={title}
              to={route}
              className="group relative bg-[#0d1435] rounded-xl p-5 sm:p-8 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_36px_rgba(46,127,255,0.22)]"
              style={{ border: '1px solid rgba(46,127,255,0.12)' }}
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl bg-brand-electric opacity-70 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Hover border overlay */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ border: '1px solid rgba(46,127,255,0.35)' }}
              />

              {/* Icon */}
              <div className="text-brand-electric">{icon}</div>

              {/* Title */}
              <h3 className="font-display text-2xl md:text-3xl text-brand-white tracking-wide leading-tight">
                {title}
              </h3>

              {/* Description */}
              <p className="font-sans text-brand-silver text-sm md:text-base leading-relaxed flex-1">
                {description}
              </p>

              {/* Learn More */}
              <span className="flex items-center gap-1.5 font-sans text-xs font-semibold tracking-wide text-brand-electric mt-auto">
                Learn More
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className="group-hover:translate-x-1 transition-transform duration-200"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
