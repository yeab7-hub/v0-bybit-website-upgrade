import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

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

  const body = await request.json()
  const { from_asset, to_asset, amount } = body

  if (!from_asset || !to_asset || !amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
  if (from_asset === to_asset) {
    return NextResponse.json({ error: "Cannot convert an asset to itself" }, { status: 400 })
  }

  // Fetch authoritative live prices server-side -- never trust a rate
  // sent from the client, since it could be tampered with.
  const origin = request.nextUrl.origin
  let fromPrice = STABLE.has(from_asset) ? 1 : null
  let toPrice = STABLE.has(to_asset) ? 1 : null

  if (fromPrice === null || toPrice === null) {
    try {
      const priceRes = await fetch(`${origin}/api/prices`, { cache: "no-store" })
      const priceData = await priceRes.json()
      const all = [...(priceData.crypto ?? [])]
      if (fromPrice === null) fromPrice = all.find((c: any) => c.symbol === from_asset)?.price ?? null
      if (toPrice === null) toPrice = all.find((c: any) => c.symbol === to_asset)?.price ?? null
    } catch {
      return NextResponse.json({ error: "Could not fetch live prices, try again" }, { status: 502 })
    }
  }

  if (!fromPrice || !toPrice) {
    return NextResponse.json({ error: "Price unavailable for one of the selected assets" }, { status: 400 })
  }

  const rate = fromPrice / toPrice
  const toAmount = Number(amount) * rate

  const { error } = await supabase.rpc("perform_conversion", {
    p_user_id: user.id,
    p_from_asset: from_asset,
    p_to_asset: to_asset,
    p_from_amount: Number(amount),
    p_to_amount: toAmount,
    p_rate: rate,
  })

  if (error) {
    const msg = error.message.includes("Insufficient balance") ? "Insufficient balance" : error.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  return NextResponse.json({ success: true, to_amount: toAmount, rate })
}
