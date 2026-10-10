import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { checkAccountStatus } from "@/lib/account-status"
import { getLivePrice } from "@/lib/live-price"

const STABLE = new Set(["USDT", "USDC"])

// GET: return the user's recent conversion history
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("conversions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ conversions: data ?? [] })
}

// POST: execute a conversion from one asset to another
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const status = await checkAccountStatus(supabase, user.id)
  if (status.blocked) return NextResponse.json({ error: status.reason }, { status: 403 })

  let body: { from_asset?: unknown; to_asset?: unknown; amount?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
  const from_asset = typeof body.from_asset === "string" ? body.from_asset.trim().toUpperCase() : ""
  const to_asset = typeof body.to_asset === "string" ? body.to_asset.trim().toUpperCase() : ""
  const amount = Number(body.amount)

  if (!/^[A-Z0-9]{2,12}$/.test(from_asset) || !/^[A-Z0-9]{2,12}$/.test(to_asset) || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Enter valid assets and a positive conversion amount" }, { status: 400 })
  }
  if (from_asset === to_asset) {
    return NextResponse.json({ error: "Cannot convert an asset to itself" }, { status: 400 })
  }

  // Resolve current prices directly from external market sources. The dashboard
  // endpoint may display cached/demo fallback values and must not be used to
  // settle a conversion.
  const fromPrice = STABLE.has(from_asset) ? 1 : await getLivePrice(from_asset, `${from_asset}/USDT`)
  const toPrice = STABLE.has(to_asset) ? 1 : await getLivePrice(to_asset, `${to_asset}/USDT`)

  if (!Number.isFinite(fromPrice) || !Number.isFinite(toPrice) || Number(fromPrice) <= 0 || Number(toPrice) <= 0) {
    return NextResponse.json({ error: "A valid live price is unavailable for one of the selected assets" }, { status: 400 })
  }

  const rate = Number(fromPrice) / Number(toPrice)
  const toAmount = amount * rate
  if (!Number.isFinite(toAmount) || toAmount <= 0) {
    return NextResponse.json({ error: "Could not calculate a valid conversion amount" }, { status: 400 })
  }

  const { error } = await supabase.rpc("perform_conversion", {
    p_user_id: user.id,
    p_from_asset: from_asset,
    p_to_asset: to_asset,
    p_from_amount: amount,
    p_to_amount: toAmount,
    p_rate: rate,
  })

  if (error) {
    const msg = error.message.includes("Insufficient balance") ? "Insufficient balance" : error.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  return NextResponse.json({ success: true, to_amount: toAmount, rate })
}
