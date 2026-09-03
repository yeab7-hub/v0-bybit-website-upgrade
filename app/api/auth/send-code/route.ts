import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { renderOtpEmail, sendBrandedEmail } from "@/lib/email/templates"

function generateCode(): string {
  // Secure 6-digit numeric code
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return String(array[0] % 1000000).padStart(6, "0")
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
      type: purpose,
      expires_at: expiresAt,
      used: false,
      attempts: 0,
    })

    if (insertError) {
      console.error("Failed to store code:", insertError)
      return NextResponse.json({ error: "Failed to generate code" }, { status: 500 })
    }

    // Send branded OTP email (skips gracefully if RESEND_API_KEY is not set;
    // the code is stored either way and can still be verified).
    const result = await sendBrandedEmail({
      to: email,
      subject: purpose === "signup" ? "Verify Your Email - Bybit" : "Login Verification Code - Bybit",
      html: renderOtpEmail(code, purpose),
    })
    if (result.skipped) {
      console.log(`[OTP] Email delivery skipped for ${email} (purpose: ${purpose})`)
    }

    return NextResponse.json({ success: true, message: "Verification code sent" })
  } catch (err: any) {
    console.error("Send code error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
