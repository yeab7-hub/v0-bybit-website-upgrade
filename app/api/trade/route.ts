import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"
import { notifyAdmin } from "@/lib/notify-admin"

/* ---------- helpers ---------- */
async function getLivePrice(baseAsset: string): Promise<number> {
  const symbol = `${baseAsset}USDT`

  // Try Binance first
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const data = await res.json()
      const price = parseFloat(data.price)
      if (price > 0) return price
    }
  } catch { /* Binance failed, try fallback */ }

  // Fallback: CoinGecko
  try {
    const idMap: Record<string, string> = {
      BTC: "bitcoin", ETH: "ethereum", SOL: "solana", XRP: "ripple",
      BNB: "binancecoin", ADA: "cardano", DOGE: "dogecoin", AVAX: "avalanche-2",
      DOT: "polkadot", LINK: "chainlink", UNI: "uniswap", MATIC: "matic-network",
      TRX: "tron", TON: "the-open-network", SHIB: "shiba-inu",
    }
    const cgId = idMap[baseAsset]
    if (cgId) {
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cgId}&vs_currencies=usd`, {
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      })
      if (res.ok) {
        const data = await res.json()
        const price = data[cgId]?.usd
        if (price > 0) return price
      }
    }
  } catch { /* CoinGecko failed too */ }

  // Last resort: fetch from our own /api/prices (internal call)
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

  if (type === "balances") {
    const { data } = await adminSupabase.from("balances").select("*").eq("user_id", user.id)
    return NextResponse.json({ balances: data ?? [] })
  }

  if (type === "trades") {
    const { data } = await adminSupabase.from("trades").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50)
    return NextResponse.json({ trades: data ?? [] })
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

/* ---------- POST ---------- */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Use admin client for DB operations to bypass RLS constraints
  const adminSupabase = await createAdminClient()

  const body = await request.json()
  const { pair, side, order_type, price, stop_price, amount } = body

  if (!pair || !side || !order_type || !amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid order parameters" }, { status: 400 })
  }

  const baseAsset = pair.split("/")[0]
  const quoteAsset = pair.split("/")[1] || "USDT"
  const marketPrice = await getLivePrice(baseAsset)

  if (marketPrice <= 0) {
    return NextResponse.json({ error: "Could not fetch current market price" }, { status: 500 })
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
  const fee = total * 0.001

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

    // Calculate P&L for sells
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

    // Insert trade record
    await adminSupabase.from("trades").insert({
      user_id: user.id, order_id: order.id, pair, side,
      price: execPrice, amount, total, fee, pnl
    })

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

      // Credit quote
      const qBal = await ensureBalance(adminSupabase, user.id, quoteAsset)
      await adminSupabase.from("balances").update({
        available: qBal.available + total - fee,
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
      available: Math.max(0, qBal.available - lockTotal - (lockTotal * 0.001)),
      in_order: (qBal.in_order || 0) + lockTotal + (lockTotal * 0.001),
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
    const locked = order.price * remaining + (order.price * remaining * 0.001)
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
