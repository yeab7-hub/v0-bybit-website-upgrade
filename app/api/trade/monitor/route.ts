import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { TRADING_FEE_RATE } from "@/lib/trading-fees"

/**
 * GET /api/trade/monitor
 * Scans the user's OPEN positions and auto-closes any whose live market price
 * has crossed its Take Profit or Stop Loss threshold. Closure settles at the
 * TP/SL target price (not the momentary market price) so the realized outcome
 * matches the user's configured level. Direction-aware:
 *   LONG  (side buy) : TP when price >= take_profit, SL when price <= stop_loss
 *   SHORT (side sell): TP when price <= take_profit, SL when price >= stop_loss
 *
 * Called on an interval by the trade page while positions are open.
 */

const NON_CRYPTO = new Set([
  "EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CHF",
  "XAU/USD", "XAG/USD", "WTI", "BRENT", "NG",
  "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA",
])

async function internalPrices(): Promise<any | null> {
  try {
    const { headers } = await import("next/headers")
    const headersList = await headers()
    const host = headersList.get("host") || "localhost:3000"
    const protocol = host.includes("localhost") ? "http" : "https"
    const res = await fetch(`${protocol}://${host}/api/prices`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) return await res.json()
  } catch { /* ignore */ }
  return null
}

async function getPrice(pair: string, cache: { internal?: any }): Promise<number> {
  const baseAsset = pair.split("/")[0]
  const lookup = pair.includes("/") ? pair : baseAsset

  if (NON_CRYPTO.has(lookup) || NON_CRYPTO.has(baseAsset)) {
    if (!cache.internal) cache.internal = await internalPrices()
    const data = cache.internal
    if (data) {
      const all = [...(data.forex ?? []), ...(data.commodities ?? []), ...(data.stocks ?? [])]
      const match = all.find((a: { symbol: string }) => a.symbol === lookup || a.symbol === baseAsset)
      if (match?.price > 0) return match.price
    }
    return 0
  }

  // Crypto via Binance
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${baseAsset}USDT`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const data = await res.json()
      const price = Number.parseFloat(data.price)
      if (price > 0) return price
    }
  } catch { /* fallback */ }

  if (!cache.internal) cache.internal = await internalPrices()
  const coin = cache.internal?.crypto?.find((c: { symbol: string }) => c.symbol === baseAsset)
  return coin?.price > 0 ? coin.price : 0
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const adminSupabase = await createAdminClient()

  const { data: positions, error } = await adminSupabase
    .from("trades")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "open")

  // If the TP/SL columns are missing (not migrated), or no positions, nothing to do.
  if (error || !positions || positions.length === 0) {
    return NextResponse.json({ closed: 0 })
  }

  const withThresholds = positions.filter(
    (p: any) => Number(p.take_profit) > 0 || Number(p.stop_loss) > 0,
  )
  if (withThresholds.length === 0) return NextResponse.json({ closed: 0 })

  const priceCache: { internal?: any } = {}
  let closedCount = 0

  for (const position of withThresholds) {
    const currentPrice = await getPrice(position.pair, priceCache)
    if (currentPrice <= 0) continue

    const isShort = position.side === "sell"
    const tp = Number(position.take_profit) || 0
    const sl = Number(position.stop_loss) || 0

    let triggerPrice = 0
    let reason: "take_profit" | "stop_loss" | null = null

    if (isShort) {
      if (tp > 0 && currentPrice <= tp) { triggerPrice = tp; reason = "take_profit" }
      else if (sl > 0 && currentPrice >= sl) { triggerPrice = sl; reason = "stop_loss" }
    } else {
      if (tp > 0 && currentPrice >= tp) { triggerPrice = tp; reason = "take_profit" }
      else if (sl > 0 && currentPrice <= sl) { triggerPrice = sl; reason = "stop_loss" }
    }

    if (!reason) continue

    const baseAsset = position.pair.split("/")[0]
    const quoteAsset = position.pair.split("/")[1] || "USDT"
    const entryPrice = Number(position.price)
    const qty = Number(position.amount)
    const closeTotal = triggerPrice * qty
    const fee = closeTotal * TRADING_FEE_RATE

    // Direction-aware realized PnL at the TP/SL target, net of both legs' fees.
    const priceDelta = isShort ? entryPrice - triggerPrice : triggerPrice - entryPrice
    const pnl = priceDelta * qty - fee - Number(position.fee || 0)

    // Close the position leg in place.
    await adminSupabase.from("trades").update({
      status: "closed",
      close_price: triggerPrice,
      closed_at: new Date().toISOString(),
      close_reason: reason,
      fee: Number(position.fee || 0) + fee,
      pnl,
    }).eq("id", position.id)

    // Settle balances (mirrors /api/trade/close). A LONG leg credited the base
    // asset on open, so release it; a SHORT leg held no base.
    if (!isShort) {
      const { data: bBal } = await adminSupabase
        .from("balances").select("*")
        .eq("user_id", position.user_id).eq("asset", baseAsset).single()
      if (bBal) {
        await adminSupabase.from("balances").update({
          available: Math.max(0, bBal.available - qty),
          updated_at: new Date().toISOString(),
        }).eq("user_id", position.user_id).eq("asset", baseAsset)
      }
    }

    const creditAmount = (entryPrice * qty) + pnl
    const { data: qBal } = await adminSupabase
      .from("balances").select("*")
      .eq("user_id", position.user_id).eq("asset", quoteAsset).single()
    if (qBal) {
      await adminSupabase.from("balances").update({
        available: Math.max(0, qBal.available + creditAmount),
        updated_at: new Date().toISOString(),
      }).eq("user_id", position.user_id).eq("asset", quoteAsset)
    } else {
      await adminSupabase.from("balances").insert({
        user_id: position.user_id,
        asset: quoteAsset,
        available: Math.max(0, creditAmount),
        in_order: 0,
      })
    }

    closedCount++
  }

  return NextResponse.json({ closed: closedCount })
}
