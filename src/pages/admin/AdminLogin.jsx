import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/admin/dashboard', { replace: true })
    })
  }, [navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
    } else {
      navigate('/admin/dashboard', { replace: true })
    }
  }

  const inputCls =
    'w-full px-4 py-3 rounded-lg bg-brand-navy border border-brand-electric/30 text-brand-white text-sm placeholder:text-brand-silver/30 focus:outline-none focus:ring-2 focus:ring-brand-electric/60 focus:border-brand-electric transition-colors duration-200'

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center p-6">
      <div
        className="w-full max-w-md rounded-2xl p-10 border border-brand-electric/15"
        style={{ background: '#0d1435', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
      >
        <div className="text-center mb-8">
          <div className="font-display text-3xl tracking-widest text-brand-white mb-2">
            NORTH CORE SERVICES
          </div>
          <div className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-brand-silver/50 bg-brand-electric/10 px-3 py-1 rounded-full">
            Admin Panel
          </div>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-email" className="text-xs font-semibold tracking-wider uppercase text-brand-silver">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@northcoreservices.com"
              autoComplete="email"
              required
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-password" className="text-xs font-semibold tracking-wider uppercase text-brand-silver">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className={inputCls}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="mt-2 w-full py-3.5 rounded-lg bg-brand-electric text-white font-display text-xl tracking-widest hover:bg-[#2570e8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? 'SIGNING IN…' : 'SIGN IN'}
          </button>
        </form>

        <p className="text-center mt-6 text-xs text-brand-silver/40">
          <Link to="/" className="text-brand-electric/60 hover:text-brand-electric transition-colors duration-200">
            ← Back to website
          </Link>
        </p>
      </div>
    </div>
  )
}
