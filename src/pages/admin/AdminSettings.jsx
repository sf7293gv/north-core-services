// Settings table uses a single row (id = 1) with typed columns.
// If the table doesn't exist yet, run this SQL in Supabase → SQL Editor:
//
// create table public.settings (
//   id             integer primary key default 1,
//   phone          text,
//   email          text,
//   facebook_url   text,
//   instagram_url  text,
//   google_url     text,
//   created_at     timestamptz default now(),
//   updated_at     timestamptz default now()
// );
// alter table public.settings enable row level security;
// create policy "Allow public reads"  on public.settings for select using (true);
// create policy "Allow auth updates"  on public.settings for update using (auth.uid() is not null);
// create policy "Allow auth inserts"  on public.settings for insert with check (auth.uid() is not null);
// insert into public.settings (id) values (1) on conflict do nothing;

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Toast from './Toast'

export default function AdminSettings() {
  const [session,      setSession]      = useState(null)
  const [phone,        setPhone]        = useState('')
  const [email,        setEmail]        = useState('')
  const [fbUrl,        setFbUrl]        = useState('')
  const [igUrl,        setIgUrl]        = useState('')
  const [googleUrl,    setGoogleUrl]    = useState('')
  const [savingContact, setSavingContact] = useState(false)
  const [savingSocial,  setSavingSocial]  = useState(false)
  const [toast,        setToast]        = useState(null)
  const navigate = useNavigate()

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3200)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      console.log('[Settings] auth session:', session
        ? `uid=${session.user.id} role=${session.user.role}`
        : 'null — NOT authenticated')
    })
    console.log('[Settings] supabase URL:', import.meta.env.VITE_SUPABASE_URL)
  }, [])

  const fetchSettings = useCallback(async () => {
    console.log('[Settings] fetching row id=1 …')
    const result = await supabase
      .from('settings')
      .select('phone, email, facebook_url, instagram_url, google_url')
      .eq('id', 1)
      .maybeSingle()
    console.log('[Settings] fetch response:', JSON.stringify(result, null, 2))
    const { data, error } = result
    if (error) { console.error('[Settings] fetch error:', error); return }
    if (data) {
      setPhone(data.phone        ?? '')
      setEmail(data.email        ?? '')
      setFbUrl(data.facebook_url ?? '')
      setIgUrl(data.instagram_url ?? '')
      setGoogleUrl(data.google_url ?? '')
      console.log('[Settings] loaded values:', data)
    } else {
      console.warn('[Settings] no row found with id=1 — table may be empty')
    }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  async function handleSaveContact(e) {
    e.preventDefault()
    setSavingContact(true)
    const payload = { id: 1, phone: phone.trim(), email: email.trim() }
    console.log('[Settings] handleSaveContact — payload:', payload)
    const result = await supabase
      .from('settings')
      .upsert(payload, { onConflict: 'id' })
      .select()
    console.log('[Settings] handleSaveContact — response:', JSON.stringify(result, null, 2))
    setSavingContact(false)
    if (result.error) {
      console.error('[Settings] upsert error:', result.error)
      showToast('Failed to save settings', 'error')
      return
    }
    showToast('Settings saved')
  }

  async function handleSaveSocial(e) {
    e.preventDefault()
    setSavingSocial(true)
    const payload = { id: 1, facebook_url: fbUrl.trim(), instagram_url: igUrl.trim(), google_url: googleUrl.trim() }
    console.log('[Settings] handleSaveSocial — payload:', payload)
    const result = await supabase
      .from('settings')
      .upsert(payload, { onConflict: 'id' })
      .select()
    console.log('[Settings] handleSaveSocial — response:', JSON.stringify(result, null, 2))
    setSavingSocial(false)
    if (result.error) {
      console.error('[Settings] upsert error:', result.error)
      showToast('Failed to save settings', 'error')
      return
    }
    showToast('Settings saved')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin/login', { replace: true })
  }

  const accountEmail = session?.user?.email ?? '—'
  const created = session?.user?.created_at
    ? new Date(session.user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  return (
    <div className="admin-settings">
      <div className="adm-page-header">
        <h1>Settings</h1>
        <p>Manage contact info, social links, and your account.</p>
      </div>

      {/* Contact information */}
      <div className="adm-settings-section">
        <h2>Contact Information</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--adm-text-muted)', marginBottom: 20, lineHeight: 1.55 }}>
          Phone and email shown in the public footer and contact section.
        </p>
        <form className="adm-form" onSubmit={handleSaveContact}>
          <div className="adm-form-row">
            <div className="adm-field">
              <label>
                Business Phone
                <span style={{ fontSize: '0.68rem', fontWeight: 400, color: 'var(--adm-text-muted)', textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>
                  displayed in footer Call Now button
                </span>
              </label>
              <input
                type="tel"
                className="adm-input text-gray-900 bg-white placeholder-gray-400"
                placeholder="(XXX) XXX-XXXX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
            <div className="adm-field">
              <label>Business Email</label>
              <input
                type="email"
                className="adm-input text-gray-900 bg-white placeholder-gray-400"
                placeholder="info@northcoreservices.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <button type="submit" className="adm-btn adm-btn-primary" disabled={savingContact}>
              {savingContact ? 'Saving…' : 'Save Contact Info'}
            </button>
          </div>
        </form>
      </div>

      {/* Social media links */}
      <div className="adm-settings-section">
        <h2>Social Media Links</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--adm-text-muted)', marginBottom: 20, lineHeight: 1.55 }}>
          These appear as icons in the site footer. Leave a field blank to hide that icon.
        </p>
        <form className="adm-form" onSubmit={handleSaveSocial}>
          <div className="adm-field">
            <label htmlFor="s-fb">Facebook URL</label>
            <input
              id="s-fb"
              type="url"
              className="adm-input text-gray-900 bg-white placeholder-gray-400"
              placeholder="https://facebook.com/your-page"
              value={fbUrl}
              onChange={e => setFbUrl(e.target.value)}
            />
          </div>
          <div className="adm-field">
            <label htmlFor="s-ig">Instagram URL</label>
            <input
              id="s-ig"
              type="url"
              className="adm-input text-gray-900 bg-white placeholder-gray-400"
              placeholder="https://instagram.com/your-handle"
              value={igUrl}
              onChange={e => setIgUrl(e.target.value)}
            />
          </div>
          <div className="adm-field">
            <label htmlFor="s-google">Google Review URL</label>
            <input
              id="s-google"
              type="url"
              className="adm-input text-gray-900 bg-white placeholder-gray-400"
              placeholder="https://g.page/r/your-review-link"
              value={googleUrl}
              onChange={e => setGoogleUrl(e.target.value)}
            />
          </div>
          <div>
            <button type="submit" className="adm-btn adm-btn-primary" disabled={savingSocial}>
              {savingSocial ? 'Saving…' : 'Save Social Links'}
            </button>
          </div>
        </form>
      </div>

      {/* Account */}
      <div className="adm-settings-section">
        <h2>Account</h2>
        <div className="adm-info-row">
          <span className="lbl">Email</span>
          <span className="val">{accountEmail}</span>
        </div>
        <div className="adm-info-row">
          <span className="lbl">Account created</span>
          <span className="val">{created}</span>
        </div>
        <div className="adm-info-row">
          <span className="lbl">Role</span>
          <span className="val">Administrator</span>
        </div>
      </div>

      {/* Business info */}
      <div className="adm-settings-section">
        <h2>Business Info</h2>
        <div className="adm-info-row">
          <span className="lbl">Company name</span>
          <span className="val">North Core Services</span>
        </div>
        <div className="adm-info-row">
          <span className="lbl">Service area</span>
          <span className="val">Minneapolis, MN</span>
        </div>
        <div className="adm-info-row">
          <span className="lbl">Availability</span>
          <span className="val">24 / 7 Emergency Response</span>
        </div>
      </div>

      {/* Danger zone */}
      <div className="adm-settings-section danger">
        <h2>Danger Zone</h2>
        <div className="adm-danger-row">
          <div>
            <h3>Sign out of admin panel</h3>
            <p>You will be returned to the login page.</p>
          </div>
          <button className="adm-btn adm-btn-secondary" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
