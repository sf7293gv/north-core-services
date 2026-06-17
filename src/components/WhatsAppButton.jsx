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

export default function WhatsAppButton() {
  const [waLink, setWaLink]           = useState(buildWaLink(null))
  const [tooltipVisible, setTooltip]  = useState(false)

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

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Tooltip — desktop only, tied to button hover */}
      <div
        className={`absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden md:block pointer-events-none whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow-lg transition-opacity duration-200 ${
          tooltipVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ background: 'rgba(17,24,39,0.95)' }}
      >
        Chat on WhatsApp
        {/* Arrow pointing right */}
        <span
          className="absolute left-full top-1/2 -translate-y-1/2"
          style={{
            width: 0,
            height: 0,
            borderTop: '5px solid transparent',
            borderBottom: '5px solid transparent',
            borderLeft: '6px solid rgba(17,24,39,0.95)',
          }}
        />
      </div>

      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        className="animate-whatsapp-glow flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-transform duration-200"
        style={{ backgroundColor: '#25D366' }}
      >
        <WhatsAppIcon />
      </a>
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="white"
      className="w-7 h-7 md:w-8 md:h-8"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}
