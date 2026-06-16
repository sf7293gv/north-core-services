/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-navy':    '#0a0f2c',
        'brand-blue':    '#1a3a8f',
        'brand-electric':'#2e7fff',
        'brand-silver':  '#c0c8d8',
        'brand-white':   '#f0f4ff',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Bebas Neue"', 'sans-serif'],
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px 0px rgba(46,127,255,0.45)' },
          '50%':       { boxShadow: '0 0 22px 6px rgba(46,127,255,0.75), 0 0 44px 10px rgba(46,127,255,0.2)' },
        },
      },
      animation: {
        'glow-pulse': 'glow-pulse 2.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
