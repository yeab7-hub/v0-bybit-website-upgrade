import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"
import { notifyAdmin } from "@/lib/notify-admin"
import { TRADING_FEE_RATE } from "@/lib/trading-fees"
import { checkAccountStatus } from "@/lib/account-status"
import { calcMargin, calcLiquidationPrice } from "@/lib/futures"
import { getLivePrice } from "@/lib/live-price"

/* ---------- helpers ---------- */

async function ensureBalance(supabase: any, userId: string, asset: string) {
  const { data } = await supabase.from("balances").select("*").eq("user_id", userId).eq("asset", asset).single()
  if (data) return data
  const { data: created } = await supabase
    .from("balances")
    .insert({ user_id: userId, asset, available: 0, in_order: 0 })
    .select()
    .single()
  return created
}

async function getActiveOverride(supabase: any, userId: string, pair: string) {
  // Check for pair-specific override first
  const { data: specific } = await supabase
    .from("trade_overrides")
    .select("*")
    .eq("user_id", userId)
    .eq("pair", pair)
    .eq("active", true)
    .limit(1)
    .single()
  if (specific) return specific

  // Check for global override (null pair)
  const { data: global } = await supabase
    .from("trade_overrides")
    .select("*")
    .eq("user_id", userId)
    .is("pair", null)
    .eq("active", true)
    .limit(1)
    .single()
  return global || null
}

/* ---------- GET ---------- */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const adminSupabase = await createAdminClient()
  const type = request.nextUrl.searchParams.get("type") ?? "orders"

  if (type === "balances") {
    const { data } = await adminSupabase.from("balances").select("*").eq("user_id", user.id)
    return NextResponse.json({ balances: data ?? [] })
  }

  if (type === "trades") {
    const { data } = await adminSupabase.from("trades").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50)
    return NextResponse.json({ trades: data ?? [] })
  }

  if (type === "positions") {
    const { data } = await adminSupabase.from("trades").select("*").eq("user_id", user.id).eq("status", "open").order("created_at", { ascending: false })
    return NextResponse.json({ positions: data ?? [] })
  }

  if (type === "history") {
    const { data } = await adminSupabase.from("trades").select("*").eq("user_id", user.id).eq("status", "closed").order("created_at", { ascending: false }).limit(50)
    return NextResponse.json({ history: data ?? [] })
  }

  // Open + partially_filled orders
  const { data } = await adminSupabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .in("status", ["open", "partially_filled"])
    .order("created_at", { ascending: false })
  return NextResponse.json({ orders: data ?? [] })
}

/* ---------- FUTURES (leveraged, margin-based) ---------- */
async function handleFuturesOrder(params: {
  adminSupabase: any; userId: string; userEmail: string
  pair: string; side: "buy" | "sell"; order_type: string; price: number; amount: number
  marketPrice: number; leverage: number
  takeProfit: number | null; stopLoss: number | null
  baseAsset: string; quoteAsset: string
}) {
  const {
    adminSupabase, userId, userEmail, pair, side, order_type, price, amount,
    marketPrice, leverage, takeProfit, stopLoss, baseAsset, quoteAsset,
  } = params

  const isShort = side === "sell"
  let execPrice: number

  if (order_type === "market") {
    execPrice = marketPrice
  } else if (order_type === "limit" || order_type === "stop_limit") {
    execPrice = Number(price)
    if (!execPrice || execPrice <= 0) {
      return NextResponse.json({ error: "Price required" }, { status: 400 })
    }
    // Only marketable-immediately Futures orders are supported for now --
    // a resting leveraged limit order needs its own margin-locking engine,
    // which this platform does not yet have. Reject clearly rather than
    // silently mishandling the margin.
    const marketable = isShort ? execPrice <= marketPrice : execPrice >= marketPrice
    if (!marketable) {
      return NextResponse.json({
        error: "Resting Futures limit orders aren't supported yet. Use Market, or a Limit price that fills immediately.",
      }, { status: 400 })
    }
    execPrice = marketPrice
  } else {
    return NextResponse.json({ error: "Invalid order type" }, { status: 400 })
  }

  const notional = execPrice * amount
  const fee = notional * TRADING_FEE_RATE
  const margin = calcMargin(notional, leverage)
  const requiredBalance = margin + fee

  const qBal = await ensureBalance(adminSupabase, userId, quoteAsset)
  if (!qBal || qBal.available < requiredBalance) {
    return NextResponse.json({
      error: `Insufficient ${quoteAsset} margin. Need $${requiredBalance.toFixed(2)}, have $${(qBal?.available ?? 0).toFixed(2)}`,
    }, { status: 400 })
  }

  const liquidationPrice = calcLiquidationPrice(execPrice, leverage, isShort)

  const { data: order, error: orderErr } = await adminSupabase.from("orders").insert({
    user_id: userId, pair, side, order_type,
    price: execPrice, amount, filled: amount, total: notional, status: "filled",
  }).select().single()
  if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 500 })

  const { error: tradeErr } = await adminSupabase.from("trades").insert({
    user_id: userId, order_id: order.id, pair, side,
    price: execPrice, amount, total: notional, fee,
    status: "open", pnl: 0,
    position_mode: "futures", leverage, margin,
    liquidation_price: liquidationPrice,
    last_funding_at: new Date().toISOString(),
    take_profit: takeProfit, stop_loss: stopLoss,
  })
  if (tradeErr) return NextResponse.json({ error: tradeErr.message }, { status: 500 })

  // Only the margin (not the full notional) is deducted -- that's the point of leverage.
  await adminSupabase.from("balances").update({
    available: Math.max(0, qBal.available - requiredBalance),
    updated_at: new Date().toISOString(),
  }).eq("user_id", userId).eq("asset", quoteAsset)

  const message = `${isShort ? "Short" : "Long"} opened: ${amount} ${baseAsset} @ $${execPrice.toLocaleString()} | ${leverage}x | Margin: $${margin.toFixed(2)} | Liq: $${liquidationPrice.toFixed(2)}`

  notifyAdmin({
    subject: `Futures ${isShort ? "Short" : "Long"} - ${amount} ${baseAsset}`,
    event: "Futures Position Opened",
    userEmail,
    details: {
      Pair: pair, Side: isShort ? "SHORT" : "LONG", Leverage: `${leverage}x`,
      Amount: amount, Price: `$${execPrice.toLocaleString()}`, Margin: `$${margin.toFixed(2)}`,
    },
  }).catch(() => {})

  return NextResponse.json({ success: true, order, message, executed: true })
}

/* ---------- POST ---------- */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const status = await checkAccountStatus(supabase, user.id)
  if (status.blocked) return NextResponse.json({ error: status.reason }, { status: 403 })

  // Use admin client for DB operations to bypass RLS constraints
  const adminSupabase = await createAdminClient()

  const body = await request.json()
  const { pair, side, order_type, price, stop_price, amount, take_profit, stop_loss, is_futures, leverage } = body

  if (!pair || !side || !order_type || !amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid order parameters" }, { status: 400 })
  }

  const takeProfit = Number(take_profit) > 0 ? Number(take_profit) : null
  const stopLoss = Number(stop_loss) > 0 ? Number(stop_loss) : null

  const baseAsset = pair.split("/")[0]
  const quoteAsset = pair.split("/")[1] || "USDT"
  const marketPrice = await getLivePrice(baseAsset, pair)

  if (marketPrice <= 0) {
    return NextResponse.json({ error: "Could not fetch current market price" }, { status: 500 })
  }

  // Leveraged Futures orders are handled in a completely separate path (real
  // margin, liquidation price, and funding) so the Spot logic below is never
  // touched or put at risk by this.
  if (is_futures) {
    return handleFuturesOrder({
      adminSupabase, userId: user.id, userEmail: user.email || "unknown",
      pair, side, order_type, price, amount, marketPrice,
      leverage: Math.max(1, Math.min(125, Number(leverage) || 1)),
      takeProfit, stopLoss, baseAsset, quoteAsset,
    })
  }

  /* Determine execution price */
  let execPrice: number
  let shouldFillNow = false

  if (order_type === "market") {
    execPrice = marketPrice
    shouldFillNow = true
  } else if (order_type === "limit") {
    execPrice = price
    if (!execPrice || execPrice <= 0) {
      return NextResponse.json({ error: "Price required for limit orders" }, { status: 400 })
    }
    // Fill immediately if the limit price is "marketable"
    // Buy limit >= market price  => fill now (willing to pay at or above market)
    // Sell limit <= market price  => fill now (willing to sell at or below market)
    if (side === "buy" && execPrice >= marketPrice) {
      execPrice = marketPrice // Execute at the better market price
      shouldFillNow = true
    } else if (side === "sell" && execPrice <= marketPrice) {
      execPrice = marketPrice
      shouldFillNow = true
    }
  } else if (order_type === "stop_limit") {
    execPrice = price
    if (!execPrice || !stop_price) {
      return NextResponse.json({ error: "Price and stop price required" }, { status: 400 })
    }
    // Stop-limit triggers when market reaches stop_price, then becomes a limit at price
    if (side === "buy" && marketPrice >= stop_price) {
      if (execPrice >= marketPrice) { execPrice = marketPrice; shouldFillNow = true }
    } else if (side === "sell" && marketPrice <= stop_price) {
      if (execPrice <= marketPrice) { execPrice = marketPrice; shouldFillNow = true }
    }
  } else {
    return NextResponse.json({ error: "Invalid order type" }, { status: 400 })
  }

  const total = execPrice * amount
  const fee = total * TRADING_FEE_RATE

  /* Check balance */
  if (side === "buy") {
    const bal = await ensureBalance(adminSupabase, user.id, quoteAsset)
    const needed = shouldFillNow ? total + fee : total + fee
    if (!bal || bal.available < needed) {
      return NextResponse.json({
        error: `Insufficient ${quoteAsset}. Need $${needed.toFixed(2)}, have $${(bal?.available ?? 0).toFixed(2)}`
      }, { status: 400 })
    }
  } else {
    const bal = await ensureBalance(adminSupabase, user.id, baseAsset)
    if (!bal || bal.available < amount) {
      return NextResponse.json({
        error: `Insufficient ${baseAsset}. Need ${amount}, have ${(bal?.available ?? 0).toFixed(6)}`
      }, { status: 400 })
    }
  }

  /* ---------- FILL NOW ---------- */
  if (shouldFillNow) {
    // Insert order as filled
    const { data: order, error: orderErr } = await adminSupabase.from("orders").insert({
      user_id: user.id, pair, side, order_type,
      price: execPrice, amount, filled: amount,
      total, status: "filled"
    }).select().single()

    if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 500 })

    // Check for admin override
    const override = await getActiveOverride(adminSupabase, user.id, pair)

    // Calculate P&L for sells (or any trade with override)
    let pnl = 0
    if (side === "sell") {
      const { data: prevBuys } = await adminSupabase
        .from("trades")
        .select("price, amount")
        .eq("user_id", user.id)
        .eq("pair", pair)
        .eq("side", "buy")
        .order("created_at", { ascending: false })
        .limit(5)

      if (prevBuys && prevBuys.length > 0) {
        const avgBuyPrice = prevBuys.reduce((s, b) => s + Number(b.price) * Number(b.amount), 0) /
          prevBuys.reduce((s, b) => s + Number(b.amount), 0)
        pnl = (execPrice - avgBuyPrice) * amount - fee
      }
    }

    // Apply override to P&L and settlement
    let overrideApplied = false
    let settlementAdjustment = 0
    if (override) {
      overrideApplied = true
      const mult = override.multiplier ?? 1.0
      if (override.forced_result === "loss") {
        // Force a loss: user loses a percentage of their trade total
        const lossAmount = total * mult * 0.1 // 10% * multiplier of trade value
        pnl = -Math.abs(lossAmount)
        settlementAdjustment = -Math.abs(lossAmount)
      } else if (override.forced_result === "win") {
        // Force a win: user gains a percentage of their trade total
        const winAmount = total * mult * 0.05 // 5% * multiplier of trade value
        pnl = Math.abs(winAmount)
        settlementAdjustment = Math.abs(winAmount)
      }
    }

    // Insert trade record -- buy = open position, sell = closed position
    const { data: insertedTrade } = await adminSupabase.from("trades").insert({
      user_id: user.id, order_id: order.id, pair, side,
      price: execPrice, amount, total, fee, pnl,
      status: side === "buy" ? "open" : "closed",
      close_price: side === "sell" ? execPrice : null,
      closed_at: side === "sell" ? new Date().toISOString() : null,
    }).select("id").single()

    // Attach TP/SL to the freshly opened long position. Done as a best-effort
    // separate update so that, if the take_profit/stop_loss columns have not
    // been migrated yet, the core trade still succeeds instead of erroring out.
    if (side === "buy" && insertedTrade?.id && (takeProfit || stopLoss)) {
      try {
        await adminSupabase.from("trades").update({
          take_profit: takeProfit,
          stop_loss: stopLoss,
        }).eq("id", insertedTrade.id)
      } catch { /* columns not migrated yet -- ignore */ }
    }

    // Update balances
    if (side === "buy") {
      // Deduct quote
      const qBal = await ensureBalance(adminSupabase, user.id, quoteAsset)
      await adminSupabase.from("balances").update({
        available: Math.max(0, qBal.available - total - fee + settlementAdjustment),
        updated_at: new Date().toISOString()
      }).eq("user_id", user.id).eq("asset", quoteAsset)

      // Credit base
      const bBal = await ensureBalance(adminSupabase, user.id, baseAsset)
      await adminSupabase.from("balances").update({
        available: bBal.available + amount,
        updated_at: new Date().toISOString()
      }).eq("user_id", user.id).eq("asset", baseAsset)
    } else {
      // Deduct base
      const bBal = await ensureBalance(adminSupabase, user.id, baseAsset)
      await adminSupabase.from("balances").update({
        available: Math.max(0, bBal.available - amount),
        updated_at: new Date().toISOString()
      }).eq("user_id", user.id).eq("asset", baseAsset)

      // Credit quote (with settlement adjustment from override)
      const qBal = await ensureBalance(adminSupabase, user.id, quoteAsset)
      await adminSupabase.from("balances").update({
        available: Math.max(0, qBal.available + total - fee + settlementAdjustment),
        updated_at: new Date().toISOString()
      }).eq("user_id", user.id).eq("asset", quoteAsset)
    }

    const tradeMsg = `${side === "buy" ? "Bought" : "Sold"} ${amount} ${baseAsset} @ $${Number(execPrice).toLocaleString()} | Fee: $${fee.toFixed(2)}${pnl !== 0 ? ` | P&L: ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}` : ""}${overrideApplied ? " [Override Applied]" : ""}`

    notifyAdmin({
      subject: `Trade - ${side.toUpperCase()} ${amount} ${baseAsset}`,
      event: "Trade Executed",
      userEmail: user.email || "unknown",
      details: { Pair: pair, Side: side.toUpperCase(), Amount: amount, Price: `$${Number(execPrice).toLocaleString()}`, Total: `$${total.toFixed(2)}`, Fee: `$${fee.toFixed(2)}` },
    }).catch(() => {})

    return NextResponse.json({ success: true, order, message: tradeMsg, executed: true })
  }

  /* ---------- PLACE AS OPEN (non-marketable limit / untriggered stop) ---------- */
  const lockTotal = price * amount
  const { data: order, error } = await adminSupabase.from("orders").insert({
    user_id: user.id, pair, side, order_type,
    price, stop_price: stop_price || null,
    amount, filled: 0, total: lockTotal, status: "open"
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Lock balance
  if (side === "buy") {
    const qBal = await ensureBalance(adminSupabase, user.id, quoteAsset)
    await adminSupabase.from("balances").update({
      available: Math.max(0, qBal.available - lockTotal - (lockTotal * TRADING_FEE_RATE)),
      in_order: (qBal.in_order || 0) + lockTotal + (lockTotal * TRADING_FEE_RATE),
      updated_at: new Date().toISOString()
    }).eq("user_id", user.id).eq("asset", quoteAsset)
  } else {
    const bBal = await ensureBalance(adminSupabase, user.id, baseAsset)
    await adminSupabase.from("balances").update({
      available: Math.max(0, bBal.available - amount),
      in_order: (bBal.in_order || 0) + amount,
      updated_at: new Date().toISOString()
    }).eq("user_id", user.id).eq("asset", baseAsset)
  }

  return NextResponse.json({
    success: true,
    order,
    message: `${order_type === "limit" ? "Limit" : "Stop-Limit"} ${side} placed: ${amount} ${baseAsset} @ $${Number(price).toLocaleString()} (waiting for fill)`,
    executed: false
  })
}

/* ---------- DELETE (cancel order) ---------- */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const adminSupabase = await createAdminClient()
  const orderId = request.nextUrl.searchParams.get("id")
  if (!orderId) return NextResponse.json({ error: "Order ID required" }, { status: 400 })

  const { data: order } = await adminSupabase.from("orders").select("*").eq("id", orderId).eq("user_id", user.id).single()
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
  if (order.status !== "open" && order.status !== "partially_filled") {
    return NextResponse.json({ error: "Cannot cancel this order" }, { status: 400 })
  }

  await adminSupabase.from("orders").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", orderId)

  const baseAsset = order.pair.split("/")[0]
  const quoteAsset = order.pair.split("/")[1] || "USDT"
  const remaining = order.amount - order.filled

  // Unlock balance
  if (order.side === "buy") {
    const locked = order.price * remaining + (order.price * remaining * TRADING_FEE_RATE)
    const qBal = await ensureBalance(adminSupabase, user.id, quoteAsset)
    await adminSupabase.from("balances").update({
      available: qBal.available + locked,
      in_order: Math.max(0, (qBal.in_order || 0) - locked),
      updated_at: new Date().toISOString()
    }).eq("user_id", user.id).eq("asset", quoteAsset)
  } else {
    const bBal = await ensureBalance(adminSupabase, user.id, baseAsset)
    await adminSupabase.from("balances").update({
      available: bBal.available + remaining,
      in_order: Math.max(0, (bBal.in_order || 0) - remaining),
      updated_at: new Date().toISOString()
    }).eq("user_id", user.id).eq("asset", baseAsset)
  }

  return NextResponse.json({ success: true, message: "Order cancelled" })
}
