import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"
import { notifyAdmin } from "@/lib/notify-admin"
import { getUserTakerFeeRate } from "@/lib/trading-fees"
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

/* ---------- GET ---------- */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const adminSupabase = await createAdminClient()
  const type = request.nextUrl.searchParams.get("type") ?? "orders"

  if (type === "order_history") {
    const { data, error } = await adminSupabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200)
    if (error) return NextResponse.json({ error: "Could not load order history" }, { status: 500 })
    return NextResponse.json({ orders: data ?? [] })
  }

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
  baseAsset: string; quoteAsset: string; durationSeconds: number | null
}) {
  const {
    adminSupabase, userId, userEmail, pair, side, order_type, price, amount,
    marketPrice, leverage, takeProfit, stopLoss, baseAsset, quoteAsset, durationSeconds,
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
  const feeRate = await getUserTakerFeeRate(adminSupabase, userId)
  const fee = notional * feeRate
  const margin = calcMargin(notional, leverage)
  const requiredBalance = margin + fee

  const qBal = await ensureBalance(adminSupabase, userId, quoteAsset)
  if (!qBal || qBal.available < requiredBalance) {
    return NextResponse.json({
      error: `Insufficient ${quoteAsset} margin. Need $${requiredBalance.toFixed(2)}, have $${(qBal?.available ?? 0).toFixed(2)}`,
    }, { status: 400 })
  }

  const liquidationPrice = calcLiquidationPrice(execPrice, leverage, isShort)
  const autoCloseAt = durationSeconds ? new Date(Date.now() + durationSeconds * 1000).toISOString() : null

  const { data: order, error: orderErr } = await adminSupabase.from("orders").insert({
    user_id: userId, pair, side, order_type,
    price: execPrice, amount, filled: amount, total: notional, status: "filled",
  }).select().single()
  if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 500 })

  const { data: insertedTrade, error: tradeErr } = await adminSupabase.from("trades").insert({
    user_id: userId, order_id: order.id, pair, side,
    price: execPrice, amount, total: notional, fee,
    status: "open", pnl: 0,
    position_mode: "futures", leverage, margin,
    liquidation_price: liquidationPrice,
    last_funding_at: new Date().toISOString(),
    take_profit: takeProfit, stop_loss: stopLoss,
    auto_close_at: autoCloseAt,
  }).select("id").single()
  if (tradeErr || !insertedTrade) {
    await adminSupabase.from("orders").delete().eq("id", order.id).eq("user_id", userId)
    return NextResponse.json({ error: "Could not create the position; no funds were reserved." }, { status: 500 })
  }

  // Compare-and-set the balance so simultaneous orders cannot both spend the
  // same observed balance. Roll back the uncommitted order/trade if it changed.
  const { data: debitedBalance, error: balanceError } = await adminSupabase.from("balances").update({
    available: Math.max(0, Number(qBal.available) - requiredBalance),
    updated_at: new Date().toISOString(),
  }).eq("user_id", userId).eq("asset", quoteAsset).eq("available", qBal.available).select("asset").maybeSingle()

  if (balanceError || !debitedBalance) {
    await adminSupabase.from("trades").delete().eq("id", insertedTrade.id).eq("user_id", userId)
    await adminSupabase.from("orders").delete().eq("id", order.id).eq("user_id", userId)
    return NextResponse.json({ error: "Your balance changed while placing this order. Refresh your balance and try again." }, { status: 409 })
  }

  const message = `${isShort ? "Short" : "Long"} opened: ${amount} ${baseAsset} @ $${execPrice.toLocaleString()} | ${leverage}x | Margin: $${margin.toFixed(2)} | Liq: $${liquidationPrice.toFixed(2)}${durationSeconds ? ` | Auto-closes in ${durationSeconds}s at real market price` : ""}`

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

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const pair = typeof body.pair === "string" ? body.pair.trim().toUpperCase() : ""
  const side = typeof body.side === "string" ? body.side.trim().toLowerCase() : ""
  const order_type = typeof body.order_type === "string" ? body.order_type.trim().toLowerCase() : ""
  const amount = Number(body.amount)
  const price = body.price == null || body.price === "" ? 0 : Number(body.price)
  const stop_price = body.stop_price == null || body.stop_price === "" ? 0 : Number(body.stop_price)
  const take_profit = body.take_profit
  const stop_loss = body.stop_loss
  const is_futures = body.is_futures === true
  const leverage = body.leverage
  const duration_seconds = body.duration_seconds

  if (!/^[A-Z0-9]{2,12}\/[A-Z0-9]{2,12}$/.test(pair) ||
      (side !== "buy" && side !== "sell") ||
      !["market", "limit", "stop_limit"].includes(order_type) ||
      !Number.isFinite(amount) || amount <= 0 ||
      (body.price != null && body.price !== "" && (!Number.isFinite(price) || price < 0)) ||
      (body.stop_price != null && body.stop_price !== "" && (!Number.isFinite(stop_price) || stop_price < 0))) {
    return NextResponse.json({ error: "Invalid order parameters" }, { status: 400 })
  }

  const takeProfit = Number(take_profit) > 0 && Number.isFinite(Number(take_profit)) ? Number(take_profit) : null
  const stopLoss = Number(stop_loss) > 0 && Number.isFinite(Number(stop_loss)) ? Number(stop_loss) : null

  if ((take_profit != null && take_profit !== "" && takeProfit === null) ||
      (stop_loss != null && stop_loss !== "" && stopLoss === null)) {
    return NextResponse.json({ error: "Take-profit and stop-loss must be positive prices." }, { status: 400 })
  }

  const baseAsset = pair.split("/")[0]
  const quoteAsset = pair.split("/")[1]
  const marketPrice = await getLivePrice(baseAsset, pair)

  if (marketPrice <= 0) {
    return NextResponse.json({ error: "Could not fetch current market price" }, { status: 500 })
  }

  // Only a small fixed set of durations are allowed, matching the UI.
  const ALLOWED_DURATIONS = new Set([30, 60, 120])
  const durationSeconds = ALLOWED_DURATIONS.has(Number(duration_seconds)) ? Number(duration_seconds) : null

  // Leveraged Futures orders are handled in a completely separate path (real
  // margin, liquidation price, and funding) so the Spot logic below is never
  // touched or put at risk by this.
  if (takeProfit !== null || stopLoss !== null) {
    // TP/SL must be on the correct side of the current market and match the
    // position direction. Reject invalid levels rather than storing orders
    // that can trigger immediately or on the wrong side.
    const isShortPosition = is_futures && side === "sell"
    if (is_futures || side === "buy") {
      if (takeProfit !== null && (isShortPosition ? takeProfit >= marketPrice : takeProfit <= marketPrice)) {
        return NextResponse.json({ error: isShortPosition ? "Short take-profit must be below the current market price." : "Take-profit must be above the current market price." }, { status: 400 })
      }
      if (stopLoss !== null && (isShortPosition ? stopLoss <= marketPrice : stopLoss >= marketPrice)) {
        return NextResponse.json({ error: isShortPosition ? "Short stop-loss must be above the current market price." : "Stop-loss must be below the current market price." }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: "Spot TP/SL is supported for buy positions only. Use Futures for short-position TP/SL." }, { status: 400 })
    }
  }

  if (is_futures) {
    const leverageValue = Number(leverage)
    if (!Number.isFinite(leverageValue) || leverageValue < 1 || leverageValue > 125) {
      return NextResponse.json({ error: "Leverage must be between 1x and 125x." }, { status: 400 })
    }
    if (order_type === "stop_limit") {
      return NextResponse.json({ error: "Futures stop-limit orders are not supported yet. Use Market or a marketable Limit order." }, { status: 400 })
    }
    return handleFuturesOrder({
      adminSupabase, userId: user.id, userEmail: user.email || "unknown",
      pair, side, order_type, price, amount, marketPrice,
      leverage: leverageValue,
      takeProfit, stopLoss, baseAsset, quoteAsset, durationSeconds,
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

  if (!shouldFillNow && (takeProfit !== null || stopLoss !== null)) {
    return NextResponse.json({
      error: "TP/SL cannot be attached to a resting order yet. Use a Market or immediately marketable Limit order so protection is saved with the filled position.",
    }, { status: 400 })
  }

  const total = execPrice * amount
  const feeRate = await getUserTakerFeeRate(adminSupabase, user.id)
  const fee = total * feeRate

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

    // Calculate P&L from the actual entry/exit prices. Administrative
    // overrides are handled at position close and must not silently alter
    // entry-time balances or P&L.
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
        available: Math.max(0, qBal.available - total - fee),
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

      // Credit quote proceeds at the actual execution price
      const qBal = await ensureBalance(adminSupabase, user.id, quoteAsset)
      await adminSupabase.from("balances").update({
        available: Math.max(0, qBal.available + total - fee),
        updated_at: new Date().toISOString()
      }).eq("user_id", user.id).eq("asset", quoteAsset)
    }

    const tradeMsg = `${side === "buy" ? "Bought" : "Sold"} ${amount} ${baseAsset} @ $${Number(execPrice).toLocaleString()} | Fee: $${fee.toFixed(2)}${pnl !== 0 ? ` | P&L: ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}` : ""}`

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
      available: Math.max(0, qBal.available - lockTotal - (lockTotal * feeRate)),
      in_order: (qBal.in_order || 0) + lockTotal + (lockTotal * feeRate),
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

  // Claim cancellation before touching balances. This races safely against the
  // fill worker: only one request can transition an open order out of its active state.
  const { data: cancelledOrder, error: cancelError } = await adminSupabase
    .from("orders")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("user_id", user.id)
    .in("status", ["open", "partially_filled"])
    .select("id")
    .maybeSingle()

  if (cancelError || !cancelledOrder) {
    return NextResponse.json({ error: "This order was filled, cancelled, or changed. Refresh and try again." }, { status: 409 })
  }

  const baseAsset = order.pair.split("/")[0]
  const quoteAsset = order.pair.split("/")[1] || "USDT"
  const remaining = Number(order.amount) - Number(order.filled || 0)
  let unlockError: string | null = null

  // Unlock only the remaining reserved funds and compare-and-set the observed
  // balance so a concurrent wallet operation cannot overwrite a newer balance.
  if (remaining > 0 && order.side === "buy") {
    const cancelFeeRate = await getUserTakerFeeRate(adminSupabase, user.id)
    const locked = Number(order.price) * remaining * (1 + cancelFeeRate)
    const { data: qBal, error: readBalanceError } = await adminSupabase.from("balances")
      .select("*").eq("user_id", user.id).eq("asset", quoteAsset).maybeSingle()
    if (readBalanceError || !qBal) {
      unlockError = "Could not load the reserved quote balance."
    } else {
      const oldAvailable = Number(qBal.available)
      const oldInOrder = Number(qBal.in_order || 0)
      const { data: unlocked, error: balanceError } = await adminSupabase.from("balances").update({
        available: oldAvailable + locked,
        in_order: Math.max(0, oldInOrder - locked),
        updated_at: new Date().toISOString()
      }).eq("user_id", user.id).eq("asset", quoteAsset)
        .eq("available", qBal.available).eq("in_order", qBal.in_order)
        .select("asset").maybeSingle()
      if (balanceError || !unlocked) unlockError = "The quote balance changed before funds could be released."
    }
  } else if (remaining > 0) {
    const { data: bBal, error: readBalanceError } = await adminSupabase.from("balances")
      .select("*").eq("user_id", user.id).eq("asset", baseAsset).maybeSingle()
    if (readBalanceError || !bBal) {
      unlockError = "Could not load the reserved base balance."
    } else {
      const oldAvailable = Number(bBal.available)
      const oldInOrder = Number(bBal.in_order || 0)
      const { data: unlocked, error: balanceError } = await adminSupabase.from("balances").update({
        available: oldAvailable + remaining,
        in_order: Math.max(0, oldInOrder - remaining),
        updated_at: new Date().toISOString()
      }).eq("user_id", user.id).eq("asset", baseAsset)
        .eq("available", bBal.available).eq("in_order", bBal.in_order)
        .select("asset").maybeSingle()
      if (balanceError || !unlocked) unlockError = "The base balance changed before funds could be released."
    }
  }

  if (unlockError) {
    // Reopen only if the cancellation still owns the order state. If this fails,
    // report the condition explicitly instead of claiming the funds were released.
    const { data: restored } = await adminSupabase.from("orders")
      .update({ status: order.status, updated_at: new Date().toISOString() })
      .eq("id", orderId).eq("user_id", user.id).eq("status", "cancelled")
      .select("id").maybeSingle()
    return NextResponse.json({
      error: restored
        ? `${unlockError} The order was reopened; refresh and try again.`
        : `${unlockError} The order state could not be restored automatically. Contact support before retrying.`,
    }, { status: 409 })
  }

  return NextResponse.json({ success: true, message: "Order cancelled and remaining funds released." })
}
