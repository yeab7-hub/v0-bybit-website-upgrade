import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"
import { getUserTakerFeeRate } from "@/lib/trading-fees"
import { getLivePrice } from "@/lib/live-price"

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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const adminSupabase = await createAdminClient()
  let body: Record<string, unknown>
  try {
    const parsed: unknown = await request.json()
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }
    body = parsed as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
  const tradeId = typeof body.tradeId === "string" ? body.tradeId.trim() : ""
  const outcome = body.outcome
  if (!tradeId) return NextResponse.json({ error: "Trade ID required" }, { status: 400 })

  let isAdmin = false
  if (typeof outcome === "string" && ["normal", "force_win", "force_loss"].includes(outcome)) {
    const { data: profile } = await adminSupabase.from("profiles").select("role").eq("id", user.id).single()
    isAdmin = profile?.role === "admin" || profile?.role === "super_admin"
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Get the open position. Admins can close any user's position; users can only close their own.
  let positionQuery = adminSupabase.from("trades").select("*").eq("id", tradeId).eq("status", "open")
  if (!isAdmin) positionQuery = positionQuery.eq("user_id", user.id)
  const { data: position } = await positionQuery.single()

  if (!position) return NextResponse.json({ error: "Open position not found" }, { status: 404 })

  const baseAsset = position.pair.split("/")[0]
  const quoteAsset = position.pair.split("/")[1] || "USDT"
  const serverPrice = await getLivePrice(baseAsset, position.pair)

  // Settlement prices must come from the server's verified provider quote.
  // Never trust a client-supplied close price, especially when the feed is down.
  const currentPrice = serverPrice

  if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
    return NextResponse.json({ error: "Could not fetch market price" }, { status: 500 })
  }

  const entryPrice = Number(position.price)
  const qty = Number(position.amount)
  const closeTotal = currentPrice * qty
  const feeRate = await getUserTakerFeeRate(adminSupabase, position.user_id)
  const fee = closeTotal * feeRate

  // Direction of the open position leg. A "buy" leg is LONG (profit when price rises),
  // a "sell" leg is SHORT (profit when price falls).
  const isShort = position.side === "sell"
  const priceDelta = isShort ? entryPrice - currentPrice : currentPrice - entryPrice

  let pnl = priceDelta * qty - fee - Number(position.fee || 0)
  let pnlPercent = entryPrice > 0 ? (priceDelta / entryPrice) * 100 : 0

  // TP/SL is a user risk instruction and takes priority over any manual
  // administrative outcome override when its threshold has already crossed.
  const tp = Number(position.take_profit) || 0
  const sl = Number(position.stop_loss) || 0
  let triggeredExitReason: "take_profit" | "stop_loss" | null = null
  if (isShort) {
    if (tp > 0 && currentPrice <= tp) triggeredExitReason = "take_profit"
    else if (sl > 0 && currentPrice >= sl) triggeredExitReason = "stop_loss"
  } else {
    if (tp > 0 && currentPrice >= tp) triggeredExitReason = "take_profit"
    else if (sl > 0 && currentPrice <= sl) triggeredExitReason = "stop_loss"
  }

  // Preserve the existing admin override controls, but never silently apply
  // them over an already-triggered TP/SL. Every adjusted close is disclosed
  // in the persisted close reason and returned message.
  const { data: overrides } = await adminSupabase
    .from("trade_overrides")
    .select("*")
    .eq("user_id", position.user_id)
    .eq("active", true)
    .order("created_at", { ascending: false })

  const override = overrides?.find((o: any) => o.pair === position.pair) ||
                   overrides?.find((o: any) => !o.pair) || null
  const explicitOutcome = outcome === "normal" ? null : outcome === "force_win" ? "win" : outcome === "force_loss" ? "loss" : null
  const forcedResult = triggeredExitReason
    ? null
    : explicitOutcome ?? override?.forced_result ?? null

  if (forcedResult === "win" || forcedResult === "loss") {
    const mult = Number(override?.multiplier) || 1
    const entryTotal = entryPrice * qty
    const forcedAmount = entryTotal * 0.05 * mult
    pnl = forcedResult === "win" ? Math.abs(forcedAmount) : -Math.abs(forcedAmount)
    pnlPercent = forcedResult === "win" ? Math.abs(5 * mult) : -Math.abs(5 * mult)
  }


  // Claim the open position with a compare-and-set update so simultaneous
  // close requests cannot settle the same position twice.
  const { data: closedPosition, error: closeError } = await adminSupabase.from("trades").update({
    status: "closed",
    close_price: currentPrice,
    closed_at: new Date().toISOString(),
    close_reason: triggeredExitReason ?? (forcedResult ? `admin_override_${forcedResult}` : "manual_close"),
    fee: Number(position.fee || 0) + fee,
    pnl,
  }).eq("id", tradeId).eq("user_id", position.user_id).eq("status", "open").select("id").maybeSingle()

  if (closeError || !closedPosition) {
    return NextResponse.json({ error: "This position was already closed or could not be claimed. Refresh and try again." }, { status: 409 })
  }

  // Consume an override only after this request has successfully claimed the position.
  if ((forcedResult === "win" || forcedResult === "loss") && override?.id) {
    await adminSupabase.from("trade_overrides").update({ active: false, used_at: new Date().toISOString() }).eq("id", override.id).eq("active", true)
  }

  const isFuturesPosition = position.position_mode === "futures"

  // Settle balances with compare-and-set updates so concurrent wallet activity
  // cannot be overwritten by a close request.
  if (isFuturesPosition) {
    // The opening fee was already debited when margin was reserved. Add it
    // back because P&L is net of both opening and closing fees.
    const margin = Number(position.margin) || 0
    const creditAmount = margin + pnl + Number(position.fee || 0)
    const credited = await adjustAvailable(adminSupabase, position.user_id, quoteAsset, creditAmount)
    if (!credited) {
      await adminSupabase.from("trades").update({
        status: "open", close_price: null, closed_at: null, close_reason: null,
        fee: Number(position.fee || 0), pnl: 0,
      }).eq("id", tradeId).eq("status", "closed")
      return NextResponse.json({ error: "Could not safely settle the Futures balance. The position was reopened; refresh and retry." }, { status: 409 })
    }
  } else {
    // Spot longs must still own the base asset. If another sell/withdrawal
    // already consumed it, do not create quote funds from a duplicate close.
    if (!isShort) {
      const debited = await adjustAvailable(adminSupabase, position.user_id, baseAsset, -qty)
      if (!debited) {
        await adminSupabase.from("trades").update({
          close_price: null, close_reason: "position_balance_unavailable", pnl: 0,
        }).eq("id", tradeId).eq("status", "closed")
        return NextResponse.json({ error: "The Spot asset is no longer available to settle this position. No additional funds were credited; refresh your balances and review trade history." }, { status: 409 })
      }
    }

    // Return entry notional plus realized P&L and the entry fee previously
    // debited, so only the closing fee is deducted from proceeds.
    const creditAmount = (entryPrice * qty) + pnl + Number(position.fee || 0)
    const credited = await adjustAvailable(adminSupabase, position.user_id, quoteAsset, creditAmount)
    if (!credited) {
      if (!isShort) await adjustAvailable(adminSupabase, position.user_id, baseAsset, qty)
      await adminSupabase.from("trades").update({
        status: "open", close_price: null, closed_at: null, close_reason: null,
        fee: Number(position.fee || 0), pnl: 0,
      }).eq("id", tradeId).eq("status", "closed")
      return NextResponse.json({ error: "Could not safely settle the Spot balance. The position was reopened; refresh and retry." }, { status: 409 })
    }
  }

  const overrideNotice = forcedResult
    ? ` | ADMIN OVERRIDE APPLIED (${forcedResult.toUpperCase()}); adjusted settlement disclosed`
    : ""
  const exitNotice = triggeredExitReason ? ` | ${triggeredExitReason.replace("_", " ").toUpperCase()} triggered` : ""

  return NextResponse.json({
    success: true,
    message: `Closed ${qty} ${baseAsset} @ ${currentPrice.toLocaleString()} | P&L: ${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} (${pnlPercent >= 0 ? "+" : ""}${pnlPercent.toFixed(2)}%)${exitNotice}${overrideNotice}`,
    pnl,
    closePrice: currentPrice,
    closeReason: triggeredExitReason ?? (forcedResult ? `admin_override_${forcedResult}` : "manual_close"),
    adminOverrideApplied: Boolean(forcedResult),
  })
}
