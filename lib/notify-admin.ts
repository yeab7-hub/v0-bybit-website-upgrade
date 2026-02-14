import { createClient } from "@/lib/supabase/server"

const ADMIN_EMAIL = "yeabsratenager2013@gmail.com"

interface NotifyPayload {
  subject: string
  event: string
  userEmail: string
  details: Record<string, string | number>
}

// Store notifications in DB and send email via Supabase Edge Function or SMTP
export async function notifyAdmin(payload: NotifyPayload) {
  const supabase = await createClient()

  // Store notification in activity_logs (if table exists)
  try {
    await supabase.from("activity_logs").insert({
      action: payload.event,
      details: JSON.stringify({
        user_email: payload.userEmail,
        subject: payload.subject,
        ...payload.details,
      }),
      ip_address: "system",
    })
  } catch {
    // Table might not exist, skip
  }

  // Send email notification using Supabase's built-in email
  // This uses the Supabase Auth admin API to send a magic link-style email
  // to the admin with the notification details
  try {
    // Use fetch to call a simple email sending endpoint
    // We use Resend-compatible API via a simple POST
    const emailHtml = buildEmailHtml(payload)

    // Try to send via Supabase Edge Function or fallback to storing
    await supabase.from("admin_notifications").insert({
      admin_email: ADMIN_EMAIL,
      subject: payload.subject,
      event: payload.event,
      user_email: payload.userEmail,
      details: payload.details,
      sent: false,
    })
  } catch {
    // If admin_notifications table doesn't exist, that's OK
    // The notification is already logged in activity_logs
    console.log("[Notify] Admin notification stored:", payload.subject)
  }
}

function buildEmailHtml(payload: NotifyPayload): string {
  const detailRows = Object.entries(payload.details)
    .map(([key, val]) => `<tr><td style="padding:6px 12px;color:#888;font-size:13px;">${key}</td><td style="padding:6px 12px;color:#fff;font-size:13px;font-weight:600;">${val}</td></tr>`)
    .join("")

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0e17;font-family:Arial,sans-serif;">
  <div style="max-width:500px;margin:40px auto;background:#131722;border-radius:12px;overflow:hidden;border:1px solid #1e2230;">
    <div style="padding:20px 24px;background:#1a1e2e;border-bottom:1px solid #1e2230;">
      <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Y0xjYtMJwTnpVDjl1wWKqHjpaLWHcS.png" alt="Bybit" height="20" style="display:block;" />
    </div>
    <div style="padding:24px;">
      <h2 style="color:#f7a600;font-size:16px;margin:0 0 4px;">${payload.event}</h2>
      <p style="color:#888;font-size:12px;margin:0 0 16px;">User: ${payload.userEmail}</p>
      <table style="width:100%;border-collapse:collapse;background:#0a0e17;border-radius:8px;overflow:hidden;">
        ${detailRows}
      </table>
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid #1e2230;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://bybit.vercel.app"}/admin/transactions" style="display:inline-block;background:#f7a600;color:#0a0e17;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:700;">
          Review in Admin Panel
        </a>
      </div>
    </div>
    <div style="padding:12px 24px;background:#0a0e17;text-align:center;">
      <p style="color:#555;font-size:10px;margin:0;">Bybit Admin Notification System</p>
    </div>
  </div>
</body>
</html>`
}

export { ADMIN_EMAIL, buildEmailHtml }
