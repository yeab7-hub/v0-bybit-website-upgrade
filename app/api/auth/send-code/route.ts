import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

function generateCode(): string {
  // Secure 6-digit numeric code
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return String(array[0] % 1000000).padStart(6, "0")
}

function buildEmailHTML(code: string, purpose: "login" | "signup") {
  const title = purpose === "signup" ? "Verify Your Email" : "Login Verification"
  const subtitle =
    purpose === "signup"
      ? "Thank you for signing up with Bybit. Please use the verification code below to complete your registration."
      : "We detected a login attempt to your Bybit account. Please use the verification code below to confirm it's you."

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} - Bybit</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0e11;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0e11;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#1a1d23;border-radius:16px;overflow:hidden;">

          <!-- Header with Logo -->
          <tr>
            <td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid #2a2d35;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td>
                    <span style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:1px;">BYB</span><span style="font-size:28px;font-weight:800;color:#f7a600;letter-spacing:1px;">I</span><span style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:1px;">T</span>
                  </td>
                </tr>
              </table>
              <p style="margin:8px 0 0;font-size:12px;color:#72768f;letter-spacing:0.5px;">CRYPTO EXCHANGE</p>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding:32px 40px 8px;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">${title}</h1>
            </td>
          </tr>

          <!-- Subtitle -->
          <tr>
            <td style="padding:0 40px 28px;">
              <p style="margin:0;font-size:14px;line-height:22px;color:#a0a3b1;">${subtitle}</p>
            </td>
          </tr>

          <!-- Code Box -->
          <tr>
            <td style="padding:0 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0e11;border-radius:12px;border:1px solid #2a2d35;">
                <tr>
                  <td style="padding:24px;text-align:center;">
                    <p style="margin:0 0 8px;font-size:11px;color:#72768f;text-transform:uppercase;letter-spacing:1.5px;">Verification Code</p>
                    <p style="margin:0;font-size:36px;font-weight:800;color:#f7a600;letter-spacing:12px;font-family:'Courier New',monospace;">${code}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Expiry notice -->
          <tr>
            <td style="padding:0 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(247,166,0,0.08);border-radius:8px;border-left:3px solid #f7a600;">
                <tr>
                  <td style="padding:12px 16px;">
                    <p style="margin:0;font-size:13px;color:#f7a600;font-weight:500;">This code expires in 10 minutes</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#a0a3b1;">Do not share this code with anyone. Bybit support will never ask for your verification code.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security Tips -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#ffffff;">Security Tips:</p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 0 6px;font-size:12px;color:#72768f;line-height:18px;">
                    <span style="color:#f7a600;margin-right:6px;">&#x2022;</span> Never share your verification code with anyone
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 6px;font-size:12px;color:#72768f;line-height:18px;">
                    <span style="color:#f7a600;margin-right:6px;">&#x2022;</span> Bybit will never ask for your password or 2FA codes
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 6px;font-size:12px;color:#72768f;line-height:18px;">
                    <span style="color:#f7a600;margin-right:6px;">&#x2022;</span> Enable 2FA for additional account security
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background-color:#12151a;border-top:1px solid #2a2d35;text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;color:#72768f;">
                This is an automated email from Bybit. Please do not reply directly.
              </p>
              <p style="margin:0;font-size:11px;color:#4a4d5a;">
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

export async function POST(request: NextRequest) {
  try {
    const { email, purpose } = await request.json()

    if (!email || !purpose) {
      return NextResponse.json({ error: "Email and purpose are required" }, { status: 400 })
    }

    if (!["login", "signup"].includes(purpose)) {
      return NextResponse.json({ error: "Invalid purpose" }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Rate limit: max 1 code per 30 seconds per email
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString()
    const { data: recentCodes } = await supabase
      .from("verification_codes")
      .select("id")
      .eq("email", email.toLowerCase())
      .gte("created_at", thirtySecondsAgo)
      .limit(1)

    if (recentCodes && recentCodes.length > 0) {
      return NextResponse.json({ error: "Please wait before requesting another code." }, { status: 429 })
    }

    // Invalidate any existing codes for this email
    await supabase
      .from("verification_codes")
      .update({ used: true })
      .eq("email", email.toLowerCase())
      .eq("used", false)

    // Generate code and store it
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min

    const { error: insertError } = await supabase.from("verification_codes").insert({
      email: email.toLowerCase(),
      code,
      purpose,
      expires_at: expiresAt,
      used: false,
    })

    if (insertError) {
      console.error("Failed to store code:", insertError)
      return NextResponse.json({ error: "Failed to generate code" }, { status: 500 })
    }

    // Send email via Resend
    const { error: emailError } = await resend.emails.send({
      from: "Bybit <onboarding@resend.dev>",
      to: email,
      subject: purpose === "signup" ? "Verify Your Email - Bybit" : "Login Verification Code - Bybit",
      html: buildEmailHTML(code, purpose),
    })

    if (emailError) {
      console.error("Resend error:", emailError)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Verification code sent" })
  } catch (err: any) {
    console.error("Send code error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
