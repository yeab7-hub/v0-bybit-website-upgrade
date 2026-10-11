import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getUserTakerFeeRate } from "@/lib/trading-fees"
import { getLivePrice } from "@/lib/live-price"

async function ensureBalance(supabase: any, userId: string, asset: string) {
  const { data } = await supabase.from("balances").select("*").eq("user_id", userId).eq("asset", asset).maybeSingle()
  if (data) return data
  const { data: created } = await supabase.from("balances")
    .insert({ user_id: userId, asset, available: 0, in_order: 0 }).select().single()
  return created
}

async function changeBalance(supabase: any, userId: string, asset: string, availableDelta: number, inOrderDelta = 0) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const balance = await ensureBalance(supabase, userId, asset)
    if (!balance) return false
    const available = Number(balance.available) || 0
    const inOrder = Number(balance.in_order) || 0
    const nextAvailable = available + availableDelta
    const nextInOrder = inOrder + inOrderDelta
    if (nextAvailable < -1e-8 || nextInOrder < -1e-8) return false
    let query = supabase.from("balances").update({
      available: Math.max(0, nextAvailable),
      in_order: Math.max(0, nextInOrder),
      updated_at: new Date().toISOString(),
    }).eq("user_id", userId).eq("asset", asset).eq("available", balance.available)
    query = balance.in_order == null ? query.is("in_order", null) : query.eq("in_order", balance.in_order)
    const { data, error } = await query.select("asset").maybeSingle()
    if (!error && data) return true
  }
  return false
}

/**
 * POST /api/trade/fill
 * Checks all open limit orders and fills them if current market price crosses the limit.
 * Called by the OpenOrders component every 8s to simulate a matching engine.
 */
export async function POST() {
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

  // Fast, direct, fallback-safe per-pair lookups (shared with every other
  // trade route) -- never silently returns empty the way the old batched
  // Binance-then-self-fetch approach could.
  const uniquePairFulls = [...new Set(openOrders.map((o) => o.pair as string))]
  const prices: Record<string, number> = {}
  for (const fullPair of uniquePairFulls) {
    const base = fullPair.split("/")[0]
    prices[fullPair] = await getLivePrice(base, fullPair)
  }

  let filledCount = 0

  for (const order of openOrders) {
    const baseAsset = order.pair.split("/")[0]
    const quoteAsset = order.pair.split("/")[1] || "USDT"
    const currentPrice = prices[order.pair]
    if (!currentPrice || currentPrice <= 0) continue

    const remaining = order.amount - order.filled
    if (remaining <= 0) continue

    let shouldFill = false
    let fillPrice = currentPrice

    if (order.order_type === "limit") {
      if (order.side === "buy" && currentPrice <= Number(order.price)) shouldFill = true
      if (order.side === "sell" && currentPrice >= Number(order.price)) shouldFill = true
      // Settle at the observed quote when the limit is marketable, not at a worse limit price.
      fillPrice = currentPrice
    } else if (order.order_type === "stop_limit") {
      // Once triggered, the limit portion must also be marketable:
      // buy fills at/below its limit; sell fills at/above its limit.
      if (order.side === "buy" && currentPrice >= Number(order.stop_price) && currentPrice <= Number(order.price)) shouldFill = true
      if (order.side === "sell" && currentPrice <= Number(order.stop_price) && currentPrice >= Number(order.price)) shouldFill = true
      fillPrice = currentPrice
    }

    if (!shouldFill) continue

    const total = fillPrice * remaining
    const feeRate = await getUserTakerFeeRate(adminSupabase, user.id)
    const fee = total * feeRate

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

    // Claim the order with a compare-and-set update. Multiple open browser tabs
    // may poll this endpoint concurrently; only one request may settle an order.
    const { data: claimedOrder, error: claimError } = await adminSupabase
      .from("orders")
      .update({
        filled: order.amount,
        status: "filled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .eq("user_id", user.id)
      .in("status", ["open", "partially_filled"])
      .select("id")
      .maybeSingle()
    if (claimError || !claimedOrder) continue

    // Create trade record -- buy = open position, sell = closed. If this insert
    // fails, reopen the order so the reserved funds can still be released later.
    const { error: tradeInsertError } = await adminSupabase.from("trades").insert({
      user_id: user.id,
      order_id: order.id,
      pair: order.pair,
      side: order.side,
      price: fillPrice,
      amount: remaining,
      total,
      fee,
      pnl,
      status: order.side === "buy" ? "open" : "closed",
      close_price: order.side === "sell" ? fillPrice : null,
      closed_at: order.side === "sell" ? new Date().toISOString() : null,
    })
    if (tradeInsertError) {
      await adminSupabase.from("orders").update({
        status: order.status,
        filled: order.filled,
        updated_at: new Date().toISOString(),
      }).eq("id", order.id).eq("user_id", user.id).eq("status", "filled")
      continue
    }

    // Settle both sides with compare-and-set updates so concurrent fills or
    // wallet actions cannot overwrite newer balances.
    if (order.side === "buy") {
      const lockedAmount = Number(order.price) * remaining * (1 + feeRate)
      const quoteRefund = Math.max(0, (Number(order.price) - fillPrice) * remaining * (1 + feeRate))
      const quoteUpdated = await changeBalance(adminSupabase, user.id, quoteAsset, quoteRefund, -lockedAmount)
      if (!quoteUpdated) {
        await adminSupabase.from("trades").delete().eq("order_id", order.id).eq("user_id", user.id).eq("price", fillPrice)
        await adminSupabase.from("orders").update({
          status: order.status, filled: order.filled, updated_at: new Date().toISOString(),
        }).eq("id", order.id).eq("user_id", user.id).eq("status", "filled")
        continue
      }

      const baseUpdated = await changeBalance(adminSupabase, user.id, baseAsset, remaining)
      if (!baseUpdated) {
        await changeBalance(adminSupabase, user.id, quoteAsset, -quoteRefund, lockedAmount)
        await adminSupabase.from("trades").delete().eq("order_id", order.id).eq("user_id", user.id).eq("price", fillPrice)
        await adminSupabase.from("orders").update({
          status: order.status, filled: order.filled, updated_at: new Date().toISOString(),
        }).eq("id", order.id).eq("user_id", user.id).eq("status", "filled")
        continue
      }
    } else {
      const baseUpdated = await changeBalance(adminSupabase, user.id, baseAsset, 0, -remaining)
      if (!baseUpdated) {
        await adminSupabase.from("trades").delete().eq("order_id", order.id).eq("user_id", user.id).eq("price", fillPrice)
        await adminSupabase.from("orders").update({
          status: order.status, filled: order.filled, updated_at: new Date().toISOString(),
        }).eq("id", order.id).eq("user_id", user.id).eq("status", "filled")
        continue
      }

      const quoteUpdated = await changeBalance(adminSupabase, user.id, quoteAsset, total - fee)
      if (!quoteUpdated) {
        await changeBalance(adminSupabase, user.id, baseAsset, 0, remaining)
        await adminSupabase.from("trades").delete().eq("order_id", order.id).eq("user_id", user.id).eq("price", fillPrice)
        await adminSupabase.from("orders").update({
          status: order.status, filled: order.filled, updated_at: new Date().toISOString(),
        }).eq("id", order.id).eq("user_id", user.id).eq("status", "filled")
        continue
      }
    }

    filledCount++
  }

  return NextResponse.json({ filled: filledCount })
}
