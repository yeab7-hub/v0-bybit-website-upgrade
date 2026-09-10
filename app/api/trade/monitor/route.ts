import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { TRADING_FEE_RATE } from "@/lib/trading-fees"
import { elapsedFundingIntervals, calcFundingFee } from "@/lib/futures"
import { getLivePrice } from "@/lib/live-price"

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

// Thin per-run memoization around the shared price lookup, so multiple open
// positions on the same pair within one monitor pass don't each trigger a
// separate external fetch.
async function getPrice(pair: string, cache: { internal?: any }): Promise<number> {
  if (!cache.internal) cache.internal = {}
  if (cache.internal[pair] !== undefined) return cache.internal[pair]
  const baseAsset = pair.split("/")[0]
  const price = await getLivePrice(baseAsset, pair)
  cache.internal[pair] = price
  return price
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
    (p: any) => Number(p.take_profit) > 0 || Number(p.stop_loss) > 0 || p.position_mode === "futures",
  )
  if (withThresholds.length === 0) return NextResponse.json({ closed: 0 })

  const priceCache: { internal?: any } = {}
  let closedCount = 0

  for (const position of withThresholds) {
    const currentPrice = await getPrice(position.pair, priceCache)
    if (currentPrice <= 0) continue

    const isShort = position.side === "sell"
    const isFuturesPosition = position.position_mode === "futures"

    // Lazily settle funding for open futures positions (no cron job exists,
    // so this is charged whenever the position is checked while still open).
    if (isFuturesPosition) {
      const intervals = elapsedFundingIntervals(position.last_funding_at, position.created_at)
      if (intervals > 0) {
        const notional = Number(position.price) * Number(position.amount)
        const fundingFee = calcFundingFee(notional, intervals)
        if (fundingFee > 0) {
          const quoteAsset = position.pair.split("/")[1] || "USDT"
          const { data: qBal } = await adminSupabase
            .from("balances").select("*")
            .eq("user_id", position.user_id).eq("asset", quoteAsset).single()
          if (qBal) {
            await adminSupabase.from("balances").update({
              available: Math.max(0, qBal.available - fundingFee),
              updated_at: new Date().toISOString(),
            }).eq("user_id", position.user_id).eq("asset", quoteAsset)
          }
          await adminSupabase.from("trades").update({
            last_funding_at: new Date().toISOString(),
            funding_paid: Number(position.funding_paid || 0) + fundingFee,
          }).eq("id", position.id)
        }
      }
    }

    const tp = Number(position.take_profit) || 0
    const sl = Number(position.stop_loss) || 0
    const liqPrice = Number(position.liquidation_price) || 0

    let triggerPrice = 0
    let reason: "take_profit" | "stop_loss" | "liquidation" | null = null

    // Liquidation takes priority over TP/SL -- it means the margin is gone.
    if (isFuturesPosition && liqPrice > 0) {
      if (isShort && currentPrice >= liqPrice) { triggerPrice = liqPrice; reason = "liquidation" }
      else if (!isShort && currentPrice <= liqPrice) { triggerPrice = liqPrice; reason = "liquidation" }
    }

    if (!reason) {
      if (isShort) {
        if (tp > 0 && currentPrice <= tp) { triggerPrice = tp; reason = "take_profit" }
        else if (sl > 0 && currentPrice >= sl) { triggerPrice = sl; reason = "stop_loss" }
      } else {
        if (tp > 0 && currentPrice >= tp) { triggerPrice = tp; reason = "take_profit" }
        else if (sl > 0 && currentPrice <= sl) { triggerPrice = sl; reason = "stop_loss" }
      }
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

    // Settle balances. Futures: no base asset was ever held, only margin;
    // credit back margin + pnl. Spot: a LONG leg held the base asset.
    if (isFuturesPosition) {
      const margin = Number(position.margin) || 0
      const creditAmount = margin + pnl
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
          user_id: position.user_id, asset: quoteAsset,
          available: Math.max(0, creditAmount), in_order: 0,
        })
      }
    } else {
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
    }

    closedCount++
  }

  return NextResponse.json({ closed: closedCount })
}
