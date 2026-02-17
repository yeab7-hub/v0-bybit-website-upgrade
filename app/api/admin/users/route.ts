import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized", status: 401 }

  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase.from("profiles").select("role").eq("id", user.id).single()
  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin"
  if (!isAdmin) return { error: "Forbidden", status: 403 }

  return { user, adminSupabase, role: profile.role }
}

export async function GET(request: NextRequest) {
  const auth = await verifyAdmin()
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { adminSupabase, role } = auth

  const action = request.nextUrl.searchParams.get("action")

  // Fetch user balances
  if (action === "balances") {
    const userId = request.nextUrl.searchParams.get("user_id")
    if (!userId) return NextResponse.json({ error: "user_id required" }, { status: 400 })
    const { data } = await adminSupabase
      .from("balances")
      .select("asset, available, in_order")
      .eq("user_id", userId)
      .order("asset")
    return NextResponse.json({ balances: data ?? [] })
  }

  // List users
  const page = parseInt(request.nextUrl.searchParams.get("page") ?? "0")
  const pageSize = parseInt(request.nextUrl.searchParams.get("pageSize") ?? "15")
  const kycStatus = request.nextUrl.searchParams.get("kyc_status")
  const search = request.nextUrl.searchParams.get("search")

  let query = adminSupabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1)

  if (kycStatus && kycStatus !== "all") query = query.eq("kyc_status", kycStatus)
  if (search) query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)

  const { data, count } = await query
  return NextResponse.json({ users: data ?? [], total: count ?? 0, callerRole: role })
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdmin()
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { adminSupabase, role } = auth

  const body = await request.json()
  const { action } = body

  // Update user role (super_admin only)
  if (action === "update_role") {
    if (role !== "super_admin") return NextResponse.json({ error: "Only master admin can change roles" }, { status: 403 })
    const { user_id, role: newRole } = body
    if (!user_id || !newRole) return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    const { data: target } = await adminSupabase.from("profiles").select("role").eq("id", user_id).single()
    if (target?.role === "super_admin") return NextResponse.json({ error: "Cannot modify master admin" }, { status: 403 })

    const { error } = await adminSupabase.from("profiles").update({ role: newRole }).eq("id", user_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // Toggle ban
  if (action === "toggle_ban") {
    const { user_id, is_banned } = body
    if (!user_id) return NextResponse.json({ error: "Missing user_id" }, { status: 400 })
    const { data: target } = await adminSupabase.from("profiles").select("role").eq("id", user_id).single()
    if (target?.role === "super_admin") return NextResponse.json({ error: "Cannot ban master admin" }, { status: 403 })

    const { error } = await adminSupabase.from("profiles").update({ is_banned }).eq("id", user_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // Adjust balance
  if (action === "adjust_balance") {
    const { user_id, asset, amount, adjust_action } = body
    if (!user_id || !asset || !amount) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 })

    const { data: current } = await adminSupabase
      .from("balances")
      .select("available")
      .eq("user_id", user_id)
      .eq("asset", asset)
      .single()

    const currentAvailable = current?.available ?? 0
    const newAmount = adjust_action === "add"
      ? currentAvailable + numAmount
      : Math.max(0, currentAvailable - numAmount)

    if (!current) {
      const { error } = await adminSupabase.from("balances").insert({
        user_id,
        asset,
        available: adjust_action === "add" ? numAmount : 0,
        in_order: 0,
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      const { error } = await adminSupabase
        .from("balances")
        .update({ available: newAmount, updated_at: new Date().toISOString() })
        .eq("user_id", user_id)
        .eq("asset", asset)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
