import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

// This endpoint auto-confirms a user's email via the admin API
// so Supabase doesn't send its own magic link email.
// We handle verification ourselves with numeric OTP codes.
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Find user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    })

    // Use a more targeted approach - get user by email
    const { data: userData, error: getUserError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email.toLowerCase())
      .single()

    let userId: string | null = null

    if (userData?.id) {
      userId = userData.id
    } else {
      // Try listing all recent users and finding by email
      const { data: { users: allUsers } } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 50,
      })
      const found = allUsers?.find(u => u.email?.toLowerCase() === email.toLowerCase())
      userId = found?.id || null
    }

    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Auto-confirm the user's email via admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      email_confirm: true,
    })

    if (updateError) {
      console.error("Failed to auto-confirm user:", updateError)
      return NextResponse.json({ error: "Failed to confirm email" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Confirm user error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
