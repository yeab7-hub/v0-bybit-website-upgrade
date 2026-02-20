import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email, code, purpose } = await request.json()

    if (!email || !code || !purpose) {
      return NextResponse.json({ error: "Email, code, and purpose are required" }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Look up the code
    const { data: codeRecord, error: lookupError } = await supabase
      .from("verification_codes")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("code", code)
      .eq("purpose", purpose)
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (lookupError || !codeRecord) {
      // Check if code was already used
      const { data: usedCode } = await supabase
        .from("verification_codes")
        .select("used")
        .eq("email", email.toLowerCase())
        .eq("code", code)
        .eq("used", true)
        .limit(1)
        .single()

      if (usedCode) {
        return NextResponse.json({ error: "This code has already been used." }, { status: 400 })
      }

      // Check attempts for brute force protection
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      const { data: recent } = await supabase
        .from("verification_codes")
        .select("attempts")
        .eq("email", email.toLowerCase())
        .eq("used", false)
        .gte("created_at", fiveMinAgo)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (recent && recent.attempts >= 5) {
        return NextResponse.json({ error: "Too many attempts. Please request a new code." }, { status: 429 })
      }

      // Increment attempts on the latest active code
      if (recent) {
        await supabase
          .from("verification_codes")
          .update({ attempts: (recent.attempts || 0) + 1 })
          .eq("email", email.toLowerCase())
          .eq("used", false)
      }

      return NextResponse.json({ error: "Invalid verification code." }, { status: 400 })
    }

    // Check expiry
    if (new Date(codeRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: "This code has expired. Please request a new one." }, { status: 400 })
    }

    // Mark code as used
    await supabase
      .from("verification_codes")
      .update({ used: true })
      .eq("id", codeRecord.id)

    return NextResponse.json({ success: true, verified: true })
  } catch (err: any) {
    console.error("Verify code error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
