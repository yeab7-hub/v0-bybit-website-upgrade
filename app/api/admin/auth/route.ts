import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * POST /api/admin/auth
 * Verify the currently authenticated session against the server-side profile.
 * The caller cannot choose a user ID to impersonate.
 */
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ isAdmin: false, error: "Unauthorized" }, { status: 401 })
    }

    const adminSupabase = await createAdminClient()
    const { data: profile, error } = await adminSupabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single()

    if (error || !profile) {
      return NextResponse.json({ isAdmin: false, error: "Could not verify admin profile" }, { status: 503 })
    }

    const isAdmin = profile.role === "admin" || profile.role === "super_admin"

    return NextResponse.json({
      isAdmin,
      isSuperAdmin: profile.role === "super_admin",
      role: profile.role,
      name: profile.full_name,
    }, { status: isAdmin ? 200 : 403 })
  } catch {
    return NextResponse.json({ isAdmin: false, error: "Admin authentication is temporarily unavailable" }, { status: 503 })
  }
}
