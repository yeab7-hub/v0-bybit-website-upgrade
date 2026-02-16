import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

/**
 * Admin Management API
 * - GET: list all admins
 * - POST: promote user to admin / demote admin / update admin password / change admin email
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { data: admins } = await adminSupabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .eq("role", "admin")
    .order("created_at", { ascending: true })

  const { data: allUsers } = await adminSupabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false })

  return NextResponse.json({ admins: admins ?? [], users: allUsers ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await request.json()
  const { action } = body

  // ---- PROMOTE USER TO ADMIN ----
  if (action === "promote") {
    const { email } = body
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 })

    const { data: target, error } = await adminSupabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("email", email)
      .select()
      .single()

    if (error || !target) {
      return NextResponse.json({ error: "User not found. Make sure they registered on the site first." }, { status: 400 })
    }
    return NextResponse.json({ success: true, message: `${email} promoted to admin` })
  }

  // ---- DEMOTE ADMIN TO USER ----
  if (action === "demote") {
    const { target_id } = body
    if (!target_id) return NextResponse.json({ error: "Target ID required" }, { status: 400 })
    if (target_id === user.id) return NextResponse.json({ error: "You cannot demote yourself" }, { status: 400 })

    const { error } = await adminSupabase
      .from("profiles")
      .update({ role: "user" })
      .eq("id", target_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, message: "Admin demoted to user" })
  }

  // ---- UPDATE ADMIN PASSWORD ----
  if (action === "update_password") {
    const { new_password } = body
    if (!new_password || new_password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const { error } = await supabase.auth.updateUser({ password: new_password })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, message: "Password updated successfully" })
  }

  // ---- UPDATE ADMIN EMAIL ----
  if (action === "update_email") {
    const { new_email } = body
    if (!new_email) return NextResponse.json({ error: "Email is required" }, { status: 400 })

    // Update in Supabase Auth
    const { error: authError } = await supabase.auth.updateUser({ email: new_email })
    if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

    // Also update in profiles table
    await adminSupabase.from("profiles").update({ email: new_email }).eq("id", user.id)

    return NextResponse.json({ success: true, message: `Email change requested. Check ${new_email} for confirmation.` })
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
