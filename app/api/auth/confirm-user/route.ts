import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Find user by email using admin API
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    })

    // The admin listUsers doesn't support email filter in all versions,
    // so we get all users in a small batch and find by email
    // For better performance, try to look up in our profiles table first
    let userId: string | null = null

    // Method 1: Look up via profiles table (fastest)
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email.toLowerCase())
      .single()

    if (profile?.id) {
      userId = profile.id
    }

    // Method 2: Try admin API to list and find
    if (!userId) {
      const { data: { users: allUsers } } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 100,
      })
      const found = allUsers?.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      )
      userId = found?.id || null
    }

    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Confirm the user's email
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { email_confirm: true }
    )

    if (updateError) {
      console.error("Failed to confirm user:", updateError)
      return NextResponse.json({ error: "Failed to confirm" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Confirm user error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
