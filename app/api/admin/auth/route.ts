import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

/**
 * POST /api/admin/auth
 * Verifies if a user is admin using the service role key (bypasses RLS).
 * This is a fallback for when RLS policies block the client-side profile check.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    // Use service role client - bypasses RLS completely
    const supabase = await createAdminClient()

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", userId)
      .single()

    if (error || !profile) {
      return NextResponse.json({ isAdmin: false, error: error?.message || "Profile not found" })
    }

    return NextResponse.json({
      isAdmin: profile.role === "admin",
      role: profile.role,
      name: profile.full_name,
    })
  } catch (e: any) {
    return NextResponse.json({ isAdmin: false, error: e.message }, { status: 500 })
  }
}
