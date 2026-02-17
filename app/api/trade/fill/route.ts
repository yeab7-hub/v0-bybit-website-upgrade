import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * GET /api/trade/fill
 * Checks all open limit orders and fills them if current market price crosses the limit.
 * Called by the OpenOrders component every 8s to simulate a matching engine.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Use admin client for DB operations to bypass RLS
  const adminSupabase = await createAdminClient()

  // Get user's open orders
  const { data: openOrders } = await adminSupabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .in("status", ["open", "partially_filled"])

  if (!openOrders || openOrders.length === 0) {
    return NextResponse.json({ filled: 0 })
  }

  // Get current prices directly from Binance
  const uniquePairs = [...new Set(openOrders.map(o => o.pair.split("/")[0]))]
  const prices: Record<string, number> = {}
  try {
    const symbols = uniquePairs.map(s => `"${s}USDT"`).join(",")
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=[${symbols}]`, { cache: "no-store" })
    if (res.ok) {
      const data: { symbol: string; price: string }[] = await res.json()
      for (const d of data) {
        const base = d.symbol.replace("USDT", "")
        prices[base] = parseFloat(d.price) || 0
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

    let shouldFill = false
    let fillPrice = currentPrice

    if (order.order_type === "limit") {
      if (order.side === "buy" && currentPrice <= order.price) shouldFill = true
      if (order.side === "sell" && currentPrice >= order.price) shouldFill = true
      fillPrice = order.price
    } else if (order.order_type === "stop_limit") {
      if (order.side === "buy" && currentPrice >= order.stop_price && currentPrice >= order.price) shouldFill = true
      if (order.side === "sell" && currentPrice <= order.stop_price && currentPrice <= order.price) shouldFill = true
      fillPrice = order.price
    }

    if (!shouldFill) continue

    const total = fillPrice * remaining
    const fee = total * 0.001

    let pnl = 0
    if (order.side === "sell") {
      const { data: prevBuys } = await adminSupabase
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
    await adminSupabase.from("orders").update({
      filled: order.amount,
      status: "filled",
      updated_at: new Date().toISOString()
    }).eq("id", order.id)

    // Create trade record
    await adminSupabase.from("trades").insert({
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
      const { data: qBal } = await adminSupabase.from("balances").select("*").eq("user_id", user.id).eq("asset", quoteAsset).single()
      if (qBal) {
        const lockedAmount = order.price * remaining + (order.price * remaining * 0.001)
        await adminSupabase.from("balances").update({
          in_order: Math.max(0, (qBal.in_order || 0) - lockedAmount),
          available: qBal.available + Math.max(0, (order.price - fillPrice) * remaining),
          updated_at: new Date().toISOString()
        }).eq("user_id", user.id).eq("asset", quoteAsset)
      }

      const { data: bBal } = await adminSupabase.from("balances").select("*").eq("user_id", user.id).eq("asset", baseAsset).single()
      if (bBal) {
        await adminSupabase.from("balances").update({
          available: bBal.available + remaining,
          updated_at: new Date().toISOString()
        }).eq("user_id", user.id).eq("asset", baseAsset)
      } else {
        await adminSupabase.from("balances").insert({ user_id: user.id, asset: baseAsset, available: remaining, in_order: 0 })
      }
    } else {
      const { data: bBal } = await adminSupabase.from("balances").select("*").eq("user_id", user.id).eq("asset", baseAsset).single()
      if (bBal) {
        await adminSupabase.from("balances").update({
          in_order: Math.max(0, (bBal.in_order || 0) - remaining),
          updated_at: new Date().toISOString()
        }).eq("user_id", user.id).eq("asset", baseAsset)
      }

      const { data: qBal } = await adminSupabase.from("balances").select("*").eq("user_id", user.id).eq("asset", quoteAsset).single()
      if (qBal) {
        await adminSupabase.from("balances").update({
          available: qBal.available + total - fee,
          updated_at: new Date().toISOString()
        }).eq("user_id", user.id).eq("asset", quoteAsset)
      }
    }

    filledCount++
  }

  return NextResponse.json({ filled: filledCount })
}
