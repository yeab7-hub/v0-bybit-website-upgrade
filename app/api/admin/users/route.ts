import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const adminSupabase = await createAdminClient()

  const { data: profile } = await adminSupabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // Fetch all users with their profiles
  const { data: profiles, error } = await adminSupabase
    .from("profiles")
    .select("id, full_name, email, role, kyc_status, created_at")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get emails from auth.users via service-role
  const { createClient: createServiceClient } = await import("@supabase/supabase-js")
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: authUsers } = await serviceClient.auth.admin.listUsers({ perPage: 1000 })
  const emailMap: Record<string, string> = {}
  authUsers?.users?.forEach(u => { emailMap[u.id] = u.email || "" })

  const users = (profiles || []).map(p => ({
    ...p,
    email: emailMap[p.id] || p.email || "unknown",
  }))

  return NextResponse.json({ users })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const adminSupabase = await createAdminClient()

  const { data: profile } = await adminSupabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await request.json()
  const { action } = body

  // ---- Toggle Ban ----
  if (action === "toggle_ban") {
    const { userId, banned } = body
    const updateData: Record<string, unknown> = banned
      ? { is_banned: true, ban_reason: body.reason || "Banned by admin" }
      : { is_banned: false, ban_reason: null }
    const { error } = await adminSupabase.from("profiles").update(updateData).eq("id", userId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // ---- Promote / Demote Admin ----
  if (action === "set_role") {
    const { userId, role } = body
    const { error } = await adminSupabase.from("profiles").update({ role }).eq("id", userId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // ---- Get User Balances ----
  if (action === "get_balances") {
    const { userId } = body
    const { data, error } = await adminSupabase
      .from("balances")
      .select("asset, available, in_order")
      .eq("user_id", userId)
      .order("asset")
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ balances: data || [] })
  }

  // ---- Adjust Balance ----
  if (action === "adjust_balance") {
    const { userId, asset, amount, adjustAction } = body
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const { data: existing } = await adminSupabase
      .from("balances")
      .select("available")
      .eq("user_id", userId)
      .eq("asset", asset)
      .single()

    if (!existing) {
      if (adjustAction === "subtract") {
        return NextResponse.json({ error: "Cannot subtract from zero balance" }, { status: 400 })
      }
      const { error } = await adminSupabase.from("balances").insert({
        user_id: userId,
        asset,
        available: numAmount,
        in_order: 0,
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, newBalance: numAmount })
    }

    const currentBalance = Number(existing.available)
    let newBalance: number

    if (adjustAction === "add") {
      newBalance = currentBalance + numAmount
    } else {
      newBalance = currentBalance - numAmount
      if (newBalance < 0) {
        return NextResponse.json({ error: `Insufficient balance. Current: ${currentBalance} ${asset}` }, { status: 400 })
      }
    }

    const { error } = await adminSupabase
      .from("balances")
      .update({ available: newBalance, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("asset", asset)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, newBalance })
  }

  // ---- Update KYC Status ----
  if (action === "update_kyc") {
    const { userId, kycStatus } = body
    const { error } = await adminSupabase
      .from("profiles")
      .update({ kyc_status: kycStatus, updated_at: new Date().toISOString() })
      .eq("id", userId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
