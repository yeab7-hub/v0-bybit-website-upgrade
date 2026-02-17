import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET: return all active deposit addresses grouped by coin
export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("deposit_addresses")
    .select("*")
    .eq("active", true)
    .order("symbol")
    .order("network")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Group by symbol
  const grouped: Record<string, { symbol: string; name: string; minDeposit: number; confirmations: number; networks: { network: string; address: string; memo?: string }[] }> = {}
  for (const row of data ?? []) {
    if (!grouped[row.symbol]) {
      grouped[row.symbol] = {
        symbol: row.symbol,
        name: row.name,
        minDeposit: row.min_deposit,
        confirmations: row.confirmations,
        networks: [],
      }
    }
    grouped[row.symbol].networks.push({
      network: row.network,
      address: row.address,
      ...(row.memo ? { memo: row.memo } : {}),
    })
  }

  return NextResponse.json({ addresses: Object.values(grouped) })
}

// PUT: admin updates an address
export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin" && profile?.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await request.json()
  const { id, address, memo, network, min_deposit, confirmations, active } = body

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

  const updates: Record<string, unknown> = {}
  if (address !== undefined) updates.address = address
  if (memo !== undefined) updates.memo = memo
  if (network !== undefined) updates.network = network
  if (min_deposit !== undefined) updates.min_deposit = min_deposit
  if (confirmations !== undefined) updates.confirmations = confirmations
  if (active !== undefined) updates.active = active
  updates.updated_at = new Date().toISOString()

  const { error } = await supabase.from("deposit_addresses").update(updates).eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

// POST: admin adds a new address
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin" && profile?.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await request.json()
  const { symbol, name, network, address, memo, min_deposit, confirmations } = body

  if (!symbol || !network || !address) return NextResponse.json({ error: "Symbol, network, and address required" }, { status: 400 })

  const { data, error } = await supabase.from("deposit_addresses").insert({
    symbol, name: name || symbol, network, address, memo: memo || null,
    min_deposit: min_deposit || 0.01, confirmations: confirmations || 12, active: true,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, address: data })
}
