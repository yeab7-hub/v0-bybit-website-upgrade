import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

/**
 * GET /api/trade/fill
 * Checks all open limit orders and fills them if current market price crosses the limit.
 * Called by the OpenOrders component every 10s to simulate a matching engine.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Get user's open orders
  const { data: openOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .in("status", ["open", "partially_filled"])

  if (!openOrders || openOrders.length === 0) {
    return NextResponse.json({ filled: 0 })
  }

  // Get current prices
  let prices: Record<string, number> = {}
  try {
    const res = await fetch(`${request.nextUrl.origin}/api/prices`)
    const data = await res.json()
    if (data.crypto) {
      for (const c of data.crypto) {
        prices[c.symbol] = c.price
      }
    }
  } catch {
    return NextResponse.json({ error: "Could not fetch prices" }, { status: 500 })
  }

  let filledCount = 0

  for (const order of openOrders) {
    const baseAsset = order.pair.split("/")[0]
    const quoteAsset = order.pair.split("/")[1] || "USDT"
    const currentPrice = prices[baseAsset]
    if (!currentPrice || currentPrice <= 0) continue

    const remaining = order.amount - order.filled
    if (remaining <= 0) continue

    // Check if this order should fill
    let shouldFill = false
    let fillPrice = currentPrice

    if (order.order_type === "limit") {
      // Buy limit fills when market drops to or below limit price
      if (order.side === "buy" && currentPrice <= order.price) shouldFill = true
      // Sell limit fills when market rises to or above limit price
      if (order.side === "sell" && currentPrice >= order.price) shouldFill = true
      fillPrice = order.price // Fill at the limit price (better for user)
    } else if (order.order_type === "stop_limit") {
      if (order.side === "buy" && currentPrice >= order.stop_price && currentPrice >= order.price) shouldFill = true
      if (order.side === "sell" && currentPrice <= order.stop_price && currentPrice <= order.price) shouldFill = true
      fillPrice = order.price
    }

    if (!shouldFill) continue

    const total = fillPrice * remaining
    const fee = total * 0.001

    // Calculate P&L for sells
    let pnl = 0
    if (order.side === "sell") {
      const { data: prevBuys } = await supabase
        .from("trades")
        .select("price, amount")
        .eq("user_id", user.id)
        .eq("pair", order.pair)
        .eq("side", "buy")
        .order("created_at", { ascending: false })
        .limit(5)

      if (prevBuys && prevBuys.length > 0) {
        const avgBuyPrice = prevBuys.reduce((s: number, b: { price: number; amount: number }) => s + Number(b.price) * Number(b.amount), 0) /
          prevBuys.reduce((s: number, b: { amount: number }) => s + Number(b.amount), 0)
        pnl = (fillPrice - avgBuyPrice) * remaining - fee
      }
    }

    // Update order to filled
    await supabase.from("orders").update({
      filled: order.amount,
      status: "filled",
      updated_at: new Date().toISOString()
    }).eq("id", order.id)

    // Create trade record
    await supabase.from("trades").insert({
      user_id: user.id,
      order_id: order.id,
      pair: order.pair,
      side: order.side,
      price: fillPrice,
      amount: remaining,
      total,
      fee,
      pnl
    })

    // Update balances
    if (order.side === "buy") {
      // Release locked quote funds + credit base asset
      const { data: qBal } = await supabase.from("balances").select("*").eq("user_id", user.id).eq("asset", quoteAsset).single()
      if (qBal) {
        const lockedAmount = order.price * remaining + (order.price * remaining * 0.001)
        await supabase.from("balances").update({
          in_order: Math.max(0, (qBal.in_order || 0) - lockedAmount),
          // If fill price is better than limit price, return the difference
          available: qBal.available + Math.max(0, (order.price - fillPrice) * remaining),
          updated_at: new Date().toISOString()
        }).eq("user_id", user.id).eq("asset", quoteAsset)
      }

      // Credit base
      const { data: bBal } = await supabase.from("balances").select("*").eq("user_id", user.id).eq("asset", baseAsset).single()
      if (bBal) {
        await supabase.from("balances").update({
          available: bBal.available + remaining,
          updated_at: new Date().toISOString()
        }).eq("user_id", user.id).eq("asset", baseAsset)
      } else {
        await supabase.from("balances").insert({ user_id: user.id, asset: baseAsset, available: remaining, in_order: 0 })
      }
    } else {
      // Sell: release locked base + credit quote
      const { data: bBal } = await supabase.from("balances").select("*").eq("user_id", user.id).eq("asset", baseAsset).single()
      if (bBal) {
        await supabase.from("balances").update({
          in_order: Math.max(0, (bBal.in_order || 0) - remaining),
          updated_at: new Date().toISOString()
        }).eq("user_id", user.id).eq("asset", baseAsset)
      }

      const { data: qBal } = await supabase.from("balances").select("*").eq("user_id", user.id).eq("asset", quoteAsset).single()
      if (qBal) {
        await supabase.from("balances").update({
          available: qBal.available + total - fee,
          updated_at: new Date().toISOString()
        }).eq("user_id", user.id).eq("asset", quoteAsset)
      }
    }

    filledCount++
  }

  return NextResponse.json({ filled: filledCount })
}
