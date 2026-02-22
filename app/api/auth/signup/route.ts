import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

/**
 * Server-side signup using admin.createUser with email_confirm: true.
 * This bypasses Supabase's automatic confirmation email entirely.
 * The user gets verified via our custom numeric OTP instead.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, referralCode } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Validate password
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    )

    if (existingUser) {
      return NextResponse.json({ error: "This email is already registered. Please log in instead." }, { status: 409 })
    }

    // Create user with email_confirm: true -- Supabase will NOT send any email
    const { data, error: createError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true, // Pre-confirm -- no Supabase confirmation email sent
      user_metadata: {
        full_name: fullName || "",
        referral_code: referralCode || null,
      },
    })

    if (createError) {
      console.error("Admin createUser error:", createError)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    if (!data?.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      userId: data.user.id,
    })
  } catch (err: any) {
    console.error("Signup API error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
