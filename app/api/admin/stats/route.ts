import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

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

  return { user, adminSupabase }
}

export async function GET() {
  const auth = await verifyAdmin()
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { adminSupabase } = auth

  // Fetch aggregate stats
  const [usersRes, tradesRes, overridesRes, balancesRes] = await Promise.all([
    adminSupabase.from("profiles").select("id", { count: "exact", head: true }),
    adminSupabase.from("trades").select("id, total, fee, pnl"),
    adminSupabase
      .from("trade_overrides")
      .select("id", { count: "exact", head: true })
      .eq("active", true),
    adminSupabase.from("balances").select("asset, available").eq("asset", "USDT"),
  ])

  const totalUsers = usersRes.count ?? 0
  const trades = tradesRes.data ?? []
  const totalTrades = trades.length
  const totalVolume = trades.reduce(
    (s, t) => s + (Number(t.total) || 0),
    0
  )
  const totalFees = trades.reduce(
    (s, t) => s + (Number(t.fee) || 0),
    0
  )
  const activeOverrides = overridesRes.count ?? 0

  const usdtBalances = balancesRes.data ?? []
  const totalUsdtHeld = usdtBalances.reduce(
    (s, b) => s + (Number(b.available) || 0),
    0
  )

  return NextResponse.json({
    totalUsers,
    totalTrades,
    totalVolume,
    totalFees,
    activeOverrides,
    totalUsdtHeld,
  })
}
