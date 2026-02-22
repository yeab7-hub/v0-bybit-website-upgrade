import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, referralCode } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Just try to create -- handle duplicate via error message
    const { data, error: createError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true, // Pre-confirm so Supabase does NOT send any email
      user_metadata: {
        full_name: fullName || "",
        referral_code: referralCode || null,
      },
    })

    if (createError) {
      const msg = createError.message?.toLowerCase() || ""
      // Supabase returns "User already registered" for duplicates
      if (msg.includes("already") || msg.includes("duplicate") || msg.includes("exists") || msg.includes("registered")) {
        return NextResponse.json(
          { error: "This email is already registered. Please log in instead." },
          { status: 409 }
        )
      }
      console.error("Admin createUser error:", createError)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    if (!data?.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    return NextResponse.json({ success: true, userId: data.user.id })
  } catch (err: any) {
    console.error("Signup API error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
