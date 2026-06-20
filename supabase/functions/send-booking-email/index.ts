// Deploy:    supabase functions deploy send-booking-email
// Set secret: supabase secrets set RESEND_API_KEY=your_key_here

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FROM = 'North Core Services <bookings@northcoreservicesmn.com>'
const FALLBACK_ADMIN = 'northcoreservices.mn@gmail.com'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const { full_name, phone, email, service, preferred_date, message } = await req.json()

    // ── Fetch admin email from settings (id = 1, email column) ──
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: settings, error: settingsErr } = await supabase
      .from('settings')
      .select('email')
      .eq('id', 1)
      .maybeSingle()

    if (settingsErr) {
      console.warn('[send-booking-email] Could not read settings.email:', settingsErr.message)
    }

    const adminEmail = settings?.email?.trim() || FALLBACK_ADMIN
    console.log('[send-booking-email] Admin email resolved to:', adminEmail)

    // ── Verify Resend key ────────────────────────────────────────
    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) {
      console.error('[send-booking-email] RESEND_API_KEY secret is not set')
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    const phoneDisplay  = fmtPhone(phone)
    const dateDisplay   = preferred_date ? fmtDate(preferred_date) : 'Not specified'

    // ── Send both emails concurrently ────────────────────────────
    const [adminResult, customerResult] = await Promise.all([
      sendEmail(resendKey, {
        from:    FROM,
        to:      [adminEmail],
        subject: `New Booking Request — ${service}`,
        html:    adminEmailHtml({ full_name, phone: phoneDisplay, email, service, dateDisplay, message }),
      }),
      sendEmail(resendKey, {
        from:    FROM,
        to:      [email],
        subject: 'We received your request — North Core Services',
        html:    customerEmailHtml({ full_name, service, dateDisplay }),
      }),
    ])

    console.log('[send-booking-email] Admin email — status:', adminResult.status, '| body:', JSON.stringify(adminResult.body))
    console.log('[send-booking-email] Customer email — status:', customerResult.status, '| body:', JSON.stringify(customerResult.body))

    if (!adminResult.ok || !customerResult.ok) {
      return new Response(
        JSON.stringify({
          error:    'One or more emails failed to send',
          admin:    { ok: adminResult.ok,    status: adminResult.status,    body: adminResult.body },
          customer: { ok: customerResult.ok, status: customerResult.status, body: customerResult.body },
        }),
        { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('[send-booking-email] Unhandled error:', err)
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }
})

// ── Resend helper ─────────────────────────────────────────────

async function sendEmail(key: string, payload: {
  from: string; to: string[]; subject: string; html: string
}): Promise<{ ok: boolean; status: number; body: unknown }> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  let body: unknown
  try { body = await res.json() } catch { body = await res.text() }
  return { ok: res.ok, status: res.status, body }
}

// ── Formatting helpers ────────────────────────────────────────

function fmtDate(d: string): string {
  const [y, mo, day] = d.split('-').map(Number)
  return new Date(y, mo - 1, day).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

function fmtPhone(p: string | null | undefined): string {
  if (!p) return '—'
  const digits = p.replace(/\D/g, '')
  const local = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits.slice(0, 10)
  if (local.length !== 10) return p
  return `+1 (${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`
}

// ── Admin email template ──────────────────────────────────────

interface AdminEmailData {
  full_name: string
  phone: string
  email: string
  service: string
  dateDisplay: string
  message?: string | null
}

function adminEmailHtml(d: AdminEmailData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>New Booking Request</title>
</head>
<body style="margin:0;padding:0;background:#0a0f2c;font-family:'Inter',system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f2c;padding:48px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:540px;background:#0d1435;border-radius:16px;overflow:hidden;border:1px solid rgba(46,127,255,0.2);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0a0f2c 0%,#1a3a8f 100%);padding:32px 40px;text-align:center;border-bottom:2px solid #2e7fff;">
            <div style="font-size:24px;font-weight:900;color:#f0f4ff;text-transform:uppercase;letter-spacing:4px;line-height:1;">
              NORTH CORE
            </div>
            <div style="color:rgba(240,244,255,0.5);font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-top:6px;">
              Services
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 28px;">
            <p style="margin:0 0 6px;font-size:20px;font-weight:800;color:#f0f4ff;letter-spacing:-0.3px;">
              New Booking Request
            </p>
            <p style="margin:0 0 28px;font-size:14px;color:#c0c8d8;line-height:1.6;">
              A customer submitted a booking through the website. Review the details below.
            </p>

            <!-- Details table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(46,127,255,0.2);border-radius:10px;overflow:hidden;margin-bottom:28px;">
              ${adminRow('Name',    d.full_name)}
              ${adminRow('Phone',   `<a href="tel:${d.phone.replace(/[^\d+]/g, '')}" style="color:#2e7fff;font-weight:600;text-decoration:none;">${d.phone}</a>`)}
              ${adminRow('Email',   `<a href="mailto:${d.email}" style="color:#2e7fff;text-decoration:none;">${d.email}</a>`)}
              ${adminRow('Service', d.service, true)}
              ${adminRow('Date',    d.dateDisplay)}
              ${d.message ? adminRow('Message', d.message.replace(/\n/g, '<br>')) : ''}
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="https://northcoreservicesmn.com/admin/bookings"
                     style="display:inline-block;background:#2e7fff;color:#ffffff;padding:14px 36px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;letter-spacing:1px;text-transform:uppercase;">
                    View All Bookings →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:rgba(46,127,255,0.05);padding:20px 40px;border-top:1px solid rgba(46,127,255,0.15);text-align:center;">
            <p style="margin:0;font-size:12px;color:rgba(192,200,216,0.5);line-height:1.7;">
              North Core Services &nbsp;·&nbsp; Minneapolis, MN<br>
              This is an automated notification.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function adminRow(label: string, value: string, highlight = false): string {
  return `<tr style="border-bottom:1px solid rgba(46,127,255,0.1);">
    <td style="padding:13px 18px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:rgba(192,200,216,0.5);width:72px;vertical-align:top;white-space:nowrap;background:rgba(46,127,255,0.04);">
      ${label}
    </td>
    <td style="padding:13px 18px;font-size:14px;color:${highlight ? '#2e7fff' : '#f0f4ff'};font-weight:${highlight ? '700' : '500'};line-height:1.6;">
      ${value ?? '—'}
    </td>
  </tr>`
}

// ── Customer confirmation email template ──────────────────────

interface CustomerEmailData {
  full_name: string
  service: string
  dateDisplay: string
}

function customerEmailHtml(d: CustomerEmailData): string {
  const firstName = d.full_name.trim().split(' ')[0]
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>We received your request</title>
</head>
<body style="margin:0;padding:0;background:#f0f4ff;font-family:'Inter',system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;padding:48px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:540px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(10,15,44,0.10);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0a0f2c 0%,#1a3a8f 100%);padding:32px 40px;text-align:center;border-bottom:2px solid #2e7fff;">
            <div style="font-size:24px;font-weight:900;color:#f0f4ff;text-transform:uppercase;letter-spacing:4px;line-height:1;">
              NORTH CORE
            </div>
            <div style="color:rgba(240,244,255,0.5);font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-top:6px;">
              Services
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0a0f2c;letter-spacing:-0.4px;">
              Hi ${firstName}, we've got your request!
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.7;">
              Thank you for reaching out to North Core Services. We've received your booking request and our team will be in touch shortly — usually within the hour during business hours.
            </p>

            <!-- Request summary -->
            <div style="background:#f8faff;border:1px solid #dce4f5;border-radius:10px;padding:20px 24px;margin-bottom:28px;">
              <p style="margin:0 0 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#6b7280;">
                Your Request Summary
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#6b7280;width:100px;">Service</td>
                  <td style="padding:4px 0;font-size:13px;color:#0a0f2c;font-weight:600;">${d.service}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#6b7280;">Preferred Date</td>
                  <td style="padding:4px 0;font-size:13px;color:#0a0f2c;font-weight:600;">${d.dateDisplay}</td>
                </tr>
              </table>
            </div>

            <p style="margin:0 0 8px;font-size:14px;color:#4b5563;line-height:1.7;">
              In the meantime, if you have any urgent questions or this is an emergency, please don't hesitate to reach out to us directly.
            </p>
            <p style="margin:0 0 32px;font-size:14px;color:#4b5563;line-height:1.7;">
              We look forward to helping you.
            </p>

            <p style="margin:0;font-size:14px;color:#0a0f2c;font-weight:700;">The North Core Services Team</p>
            <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Minneapolis, MN</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.7;">
              You're receiving this because you submitted a booking request at northcoreservicesmn.com.<br>
              If you didn't request this, you can safely ignore this email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
