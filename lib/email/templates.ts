import { Resend } from "resend"

/**
 * Centralized, reusable Bybit-branded transactional email system.
 *
 * All emails share one branded layout (logo header, dark/yellow theme, footer)
 * so registration OTP, login OTP, deposit, and withdrawal notifications stay
 * visually consistent. Server-side only — never import into client components.
 */

// ---- Brand tokens ---------------------------------------------------------

const BRAND = {
  bg: "#0b0e11",
  card: "#1a1d23",
  inset: "#0b0e11",
  footer: "#12151a",
  border: "#2a2d35",
  yellow: "#f7a600",
  text: "#ffffff",
  muted: "#a0a3b1",
  faint: "#72768f",
  faintest: "#4a4d5a",
  green: "#20d3af",
  red: "#f04866",
} as const

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif"

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "https://v0-bybit-website-upgrade.vercel.app"
}

const FROM_ADDRESS = "Bybit <onboarding@resend.dev>"

// ---- Shared layout --------------------------------------------------------

interface LayoutOptions {
  title: string
  /** Inner HTML rows (each a full <tr>...</tr>) rendered inside the card body. */
  body: string
}

function brandedLayout({ title, body }: LayoutOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} - Bybit</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:${FONT};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.bg};padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:${BRAND.card};border-radius:16px;overflow:hidden;">

          <!-- Header with Bybit logo -->
          <tr>
            <td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid ${BRAND.border};">
              <img src="${appUrl()}/images/bybit-email-logo.jpg" alt="Bybit" width="180" height="45" style="display:block;margin:0 auto;max-width:180px;height:auto;" />
              <p style="margin:8px 0 0;font-size:12px;color:${BRAND.faint};letter-spacing:0.5px;">CRYPTO EXCHANGE</p>
            </td>
          </tr>

          ${body}

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background-color:${BRAND.footer};border-top:1px solid ${BRAND.border};text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;color:${BRAND.faint};">
                This is an automated email from Bybit. Please do not reply directly.
              </p>
              <p style="margin:0 0 8px;font-size:11px;color:${BRAND.faint};">
                If you have questions, please contact our <a href="${appUrl()}/support" style="color:${BRAND.yellow};text-decoration:none;">24/7 Support Team</a>.
              </p>
              <p style="margin:0;font-size:11px;color:${BRAND.faintest};">
                &copy; 2018-2026 Bybit. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function titleRow(title: string): string {
  return `<tr><td style="padding:32px 40px 8px;"><h1 style="margin:0;font-size:22px;font-weight:700;color:${BRAND.text};">${title}</h1></td></tr>`
}

function paragraphRow(text: string): string {
  return `<tr><td style="padding:0 40px 28px;"><p style="margin:0;font-size:14px;line-height:22px;color:${BRAND.muted};">${text}</p></td></tr>`
}

function ctaRow(label: string, href: string): string {
  return `<tr><td style="padding:0 40px 32px;text-align:center;"><a href="${href}" style="display:inline-block;background-color:${BRAND.yellow};color:${BRAND.bg};font-size:14px;font-weight:700;padding:14px 40px;border-radius:8px;text-decoration:none;">${label}</a></td></tr>`
}

/** Escape values that come from user or admin input before embedding in HTML. */
function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

// ---- Sender ---------------------------------------------------------------

export interface SendResult {
  sent: boolean
  skipped?: boolean
  error?: string
}

/**
 * Sends a branded email through Resend. If RESEND_API_KEY is not configured the
 * call is skipped gracefully (returns { sent: false, skipped: true }) so callers
 * never fail their primary operation because email is unavailable.
 */
export async function sendBrandedEmail(params: {
  to: string
  subject: string
  html: string
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log(`[email] RESEND_API_KEY missing — skipped "${params.subject}" to ${params.to}`)
    return { sent: false, skipped: true }
  }
  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.to,
      subject: params.subject,
      html: params.html,
    })
    if (error) {
      console.error("[email] Resend error:", error)
      return { sent: false, error: String(error) }
    }
    return { sent: true }
  } catch (err: any) {
    console.error("[email] send failed:", err)
    return { sent: false, error: err?.message || "send failed" }
  }
}

// ---- OTP email ------------------------------------------------------------

export function renderOtpEmail(code: string, purpose: "login" | "signup"): string {
  const title = purpose === "signup" ? "Verify Your Email" : "Login Verification"
  const subtitle =
    purpose === "signup"
      ? "Thank you for signing up with Bybit. Please use the verification code below to complete your registration."
      : "We detected a login attempt to your Bybit account. Please use the verification code below to confirm it&#39;s you."

  const body = `
    ${titleRow(title)}
    ${paragraphRow(subtitle)}

    <!-- Code Box -->
    <tr>
      <td style="padding:0 40px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.inset};border-radius:12px;border:1px solid ${BRAND.border};">
          <tr>
            <td style="padding:24px;text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;color:${BRAND.faint};text-transform:uppercase;letter-spacing:1.5px;">Verification Code</p>
              <p style="margin:0;font-size:36px;font-weight:800;color:${BRAND.yellow};letter-spacing:12px;font-family:'Courier New',monospace;">${escapeHtml(code)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Expiry notice -->
    <tr>
      <td style="padding:0 40px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(247,166,0,0.08);border-radius:8px;border-left:3px solid ${BRAND.yellow};">
          <tr>
            <td style="padding:12px 16px;">
              <p style="margin:0;font-size:13px;color:${BRAND.yellow};font-weight:500;">This code expires in 10 minutes</p>
              <p style="margin:4px 0 0;font-size:12px;color:${BRAND.muted};">Do not share this code with anyone. Bybit support will never ask for your verification code.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Security tips -->
    <tr>
      <td style="padding:0 40px 32px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:${BRAND.text};">Security Tips:</p>
        <table cellpadding="0" cellspacing="0">
          <tr><td style="padding:0 0 6px;font-size:12px;color:${BRAND.faint};line-height:18px;"><span style="color:${BRAND.yellow};margin-right:6px;">&#x2022;</span> Never share your verification code with anyone</td></tr>
          <tr><td style="padding:0 0 6px;font-size:12px;color:${BRAND.faint};line-height:18px;"><span style="color:${BRAND.yellow};margin-right:6px;">&#x2022;</span> Bybit will never ask for your password or 2FA codes</td></tr>
          <tr><td style="padding:0 0 6px;font-size:12px;color:${BRAND.faint};line-height:18px;"><span style="color:${BRAND.yellow};margin-right:6px;">&#x2022;</span> Enable 2FA for additional account security</td></tr>
        </table>
      </td>
    </tr>`

  return brandedLayout({ title, body })
}

// ---- Transaction status emails -------------------------------------------

type TxStatus = "pending" | "approved" | "rejected"

const STATUS_META: Record<TxStatus, { label: string; color: string }> = {
  pending: { label: "PENDING", color: BRAND.yellow },
  approved: { label: "APPROVED", color: BRAND.green },
  rejected: { label: "REJECTED", color: BRAND.red },
}

function amountDetailBox(kind: string, status: TxStatus, amount: string, asset: string): string {
  const meta = STATUS_META[status]
  return `
    <tr>
      <td style="padding:0 40px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.inset};border-radius:12px;border:1px solid ${BRAND.border};">
          <tr>
            <td style="padding:20px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 0 14px;">
                    <p style="margin:0;font-size:11px;color:${BRAND.faint};text-transform:uppercase;letter-spacing:1px;">Transaction Type</p>
                    <p style="margin:4px 0 0;font-size:15px;color:${BRAND.text};font-weight:600;">${escapeHtml(kind)}</p>
                  </td>
                  <td style="padding:0 0 14px;text-align:right;">
                    <p style="margin:0;font-size:11px;color:${BRAND.faint};text-transform:uppercase;letter-spacing:1px;">Status</p>
                    <p style="margin:4px 0 0;font-size:15px;color:${meta.color};font-weight:700;">${meta.label}</p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:14px 0 0;border-top:1px solid ${BRAND.border};">
                    <p style="margin:0;font-size:11px;color:${BRAND.faint};text-transform:uppercase;letter-spacing:1px;">Amount</p>
                    <p style="margin:4px 0 0;font-size:24px;color:${BRAND.text};font-weight:800;">${escapeHtml(amount)} <span style="font-size:14px;color:${BRAND.faint};font-weight:400;">${escapeHtml(asset)}</span></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
}

function reasonBox(reason: string): string {
  return `
    <tr>
      <td style="padding:0 40px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(240,72,102,0.08);border-radius:8px;border-left:3px solid ${BRAND.red};">
          <tr>
            <td style="padding:16px 20px;">
              <p style="margin:0 0 6px;font-size:12px;color:${BRAND.red};font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Reason for Rejection</p>
              <p style="margin:0;font-size:14px;line-height:22px;color:#e0e0e0;">${escapeHtml(reason)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
}

function fundsReturnedBox(amount: string, asset: string): string {
  return `
    <tr>
      <td style="padding:0 40px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(32,211,175,0.08);border-radius:8px;border-left:3px solid ${BRAND.green};">
          <tr>
            <td style="padding:12px 16px;">
              <p style="margin:0;font-size:13px;color:${BRAND.green};font-weight:500;">Funds Returned</p>
              <p style="margin:4px 0 0;font-size:12px;color:${BRAND.muted};">${escapeHtml(amount)} ${escapeHtml(asset)} has been returned to your available balance.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
}

export interface DepositEmailParams {
  status: TxStatus
  amount: string
  asset: string
  network?: string
}

export function renderDepositEmail({ status, amount, asset }: DepositEmailParams): string {
  const copy: Record<TxStatus, { title: string; subtitle: string }> = {
    pending: {
      title: "Deposit Received",
      subtitle:
        "We&#39;ve received your deposit request and it is now pending review. You&#39;ll be notified once it has been processed.",
    },
    approved: {
      title: "Deposit Approved",
      subtitle:
        "Good news — your deposit has been approved and the funds are now available in your Bybit account.",
    },
    rejected: {
      title: "Deposit Rejected",
      subtitle:
        "Your deposit request could not be approved. Please review the details below or contact our support team.",
    },
  }
  const { title, subtitle } = copy[status]
  const body = `
    ${titleRow(title)}
    ${paragraphRow(subtitle)}
    ${amountDetailBox("Deposit", status, amount, asset)}
    ${ctaRow("View My Wallet", `${appUrl()}/wallet`)}`
  return brandedLayout({ title, body })
}

export interface WithdrawalEmailParams {
  status: TxStatus
  amount: string
  asset: string
  address?: string
  /** Only rendered for rejected withdrawals. */
  reason?: string
}

export function renderWithdrawalEmail({
  status,
  amount,
  asset,
  reason,
}: WithdrawalEmailParams): string {
  const copy: Record<TxStatus, { title: string; subtitle: string }> = {
    pending: {
      title: "Withdrawal Request Received",
      subtitle:
        "We&#39;ve received your withdrawal request and it is now pending admin review. You&#39;ll be notified once it has been processed.",
    },
    approved: {
      title: "Withdrawal Approved",
      subtitle:
        "Your withdrawal request has been approved and is being processed to your destination address.",
    },
    rejected: {
      title: "Withdrawal Request Rejected",
      subtitle:
        "Your recent withdrawal request has been reviewed and was not approved. Please review the details below.",
    },
  }
  const { title, subtitle } = copy[status]
  const rejected = status === "rejected"
  const body = `
    ${titleRow(rejected ? "&#x26A0; " + title : title)}
    ${paragraphRow(subtitle)}
    ${amountDetailBox("Withdrawal", status, amount, asset)}
    ${rejected && reason ? reasonBox(reason) : ""}
    ${rejected ? fundsReturnedBox(amount, asset) : ""}
    ${ctaRow("View My Wallet", `${appUrl()}/wallet`)}`
  return brandedLayout({ title, body })
}
