import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"
import { getUserTakerFeeRate } from "@/lib/trading-fees"
import { elapsedFundingIntervals, calcFundingFee } from "@/lib/futures"
import { getLivePrice } from "@/lib/live-price"

/**
 * POST /api/trade/monitor
 * Scans the user's OPEN positions and auto-closes any whose live market price
 * has crossed its Take Profit or Stop Loss threshold. Closure settles at the
 * observed market quote; a fast market can gap through a trigger. Direction-aware:
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

async function adjustAvailable(supabase: any, userId: string, asset: string, delta: number): Promise<boolean> {
  for (let attempt = 0; attempt < 4; attempt++) {
    let { data: balance } = await supabase.from("balances").select("*")
      .eq("user_id", userId).eq("asset", asset).maybeSingle()
    if (!balance) {
      const { data: created, error } = await supabase.from("balances")
        .insert({ user_id: userId, asset, available: 0, in_order: 0 }).select().single()
      if (error || !created) return false
      balance = created
    }
    const available = Number(balance.available) || 0
    const next = available + delta
    if (next < -1e-8) return false
    const { data, error } = await supabase.from("balances").update({
      available: Math.max(0, next), updated_at: new Date().toISOString(),
    }).eq("user_id", userId).eq("asset", asset).eq("available", balance.available)
      .select("asset").maybeSingle()
    if (!error && data) return true
  }
  return false
}

export async function POST(request: NextRequest) {
  // The route can be called by the signed-in user's trade page, or by a
  // trusted scheduler using CRON_SECRET. The scheduler mode is needed so
  // protection orders can be checked even when the trader is offline.
  const cronSecret = process.env.CRON_SECRET
  const isCron = Boolean(cronSecret && request.headers.get("authorization") === `Bearer ${cronSecret}`)
  let userId: string | null = null

  if (!isCron) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    userId = user.id
  }

  const adminSupabase = await createAdminClient()

  let positionsQuery = adminSupabase
    .from("trades")
    .select("*")
    .eq("status", "open")
  if (!isCron && userId) positionsQuery = positionsQuery.eq("user_id", userId)
  const { data: positions, error } = await positionsQuery

  // If the TP/SL columns are missing (not migrated), or no positions, nothing to do.
  if (error || !positions || positions.length === 0) {
    return NextResponse.json({ closed: 0 })
  }

  const withThresholds = positions.filter(
    (p: any) => Number(p.take_profit) > 0 || Number(p.stop_loss) > 0 || p.position_mode === "futures" || p.auto_close_at,
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
    let reason: "take_profit" | "stop_loss" | "liquidation" | "time_expired" | null = null

    // Liquidation takes priority over TP/SL -- it means the margin is gone.
    if (isFuturesPosition && liqPrice > 0) {
      if (isShort && currentPrice >= liqPrice) { triggerPrice = currentPrice; reason = "liquidation" }
      else if (!isShort && currentPrice <= liqPrice) { triggerPrice = currentPrice; reason = "liquidation" }
    }

    if (!reason) {
      if (isShort) {
        if (tp > 0 && currentPrice <= tp) { triggerPrice = currentPrice; reason = "take_profit" }
        else if (sl > 0 && currentPrice >= sl) { triggerPrice = currentPrice; reason = "stop_loss" }
      } else {
        if (tp > 0 && currentPrice >= tp) { triggerPrice = currentPrice; reason = "take_profit" }
        else if (sl > 0 && currentPrice <= sl) { triggerPrice = currentPrice; reason = "stop_loss" }
      }
    }

    // A timed trade's deadline settles at whatever the REAL market price
    // happens to be at that moment -- win, loss, or breakeven, with no
    // preset amount. This only fires if nothing above already triggered.
    if (!reason && position.auto_close_at && new Date(position.auto_close_at).getTime() <= Date.now()) {
      triggerPrice = currentPrice
      reason = "time_expired"
    }

    if (!reason) continue

    const baseAsset = position.pair.split("/")[0]
    const quoteAsset = position.pair.split("/")[1] || "USDT"
    const entryPrice = Number(position.price)
    const qty = Number(position.amount)
    const closeTotal = triggerPrice * qty
    const feeRate = await getUserTakerFeeRate(adminSupabase, position.user_id)
    const fee = closeTotal * feeRate

    // Direction-aware realized PnL at the TP/SL target, net of both legs' fees.
    const priceDelta = isShort ? entryPrice - triggerPrice : triggerPrice - entryPrice
    const pnl = priceDelta * qty - fee - Number(position.fee || 0)

    // Claim the open position before settling. Multiple tabs may run the
    // monitor concurrently; only the request that changes open -> closed pays out.
    const { data: closedPosition, error: closeError } = await adminSupabase.from("trades").update({
      status: "closed",
      close_price: triggerPrice,
      closed_at: new Date().toISOString(),
      close_reason: reason,
      fee: Number(position.fee || 0) + fee,
      pnl,
    }).eq("id", position.id).eq("user_id", position.user_id).eq("status", "open").select("id").maybeSingle()
    if (closeError || !closedPosition) continue

    // Settle balances. Futures: no base asset was ever held, only margin;
    // credit back margin + pnl. Spot: a LONG leg held the base asset.
    if (isFuturesPosition) {
      const margin = Number(position.margin) || 0
      // The opening fee was already debited when margin was reserved. Add it
    // back here because pnl is net of both opening and closing fees.
    const creditAmount = margin + pnl + Number(position.fee || 0)
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
      // A Spot long must still own the base asset before its position can be
      // settled. This prevents a prior manual sell from being auto-closed a
      // second time and crediting quote funds twice.
      if (!isShort) {
        const baseDebited = await adjustAvailable(adminSupabase, position.user_id, baseAsset, -qty)
        if (!baseDebited) {
          await adminSupabase.from("trades").update({
            close_price: null,
            close_reason: "position_balance_unavailable",
            pnl: 0,
          }).eq("id", position.id).eq("status", "closed")
          closedCount++
          continue
        }
      }

      // Opening fee was charged at entry and is included in P&L reporting, so
      // add it back to the returned entry notional to avoid charging twice.
      const creditAmount = (entryPrice * qty) + pnl + Number(position.fee || 0)
      const quoteCredited = await adjustAvailable(adminSupabase, position.user_id, quoteAsset, creditAmount)
      if (!quoteCredited) {
        if (!isShort) await adjustAvailable(adminSupabase, position.user_id, baseAsset, qty)
        await adminSupabase.from("trades").update({
          status: "open",
          close_price: null,
          closed_at: null,
          close_reason: null,
          fee: Number(position.fee || 0),
          pnl: 0,
        }).eq("id", position.id).eq("status", "closed")
        continue
      }
    }

    closedCount++
  }

  return NextResponse.json({ closed: closedCount })
}
