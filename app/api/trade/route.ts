import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

// GET user orders & trades
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const type = request.nextUrl.searchParams.get("type") ?? "orders"

  if (type === "balances") {
    const { data } = await supabase.from("balances").select("*").eq("user_id", user.id)
    return NextResponse.json({ balances: data ?? [] })
  }

  if (type === "trades") {
    const { data } = await supabase.from("trades").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50)
    return NextResponse.json({ trades: data ?? [] })
  }

  // open orders
  const { data } = await supabase.from("orders").select("*").eq("user_id", user.id).in("status", ["open", "partially_filled"]).order("created_at", { ascending: false })
  return NextResponse.json({ orders: data ?? [] })
}

// POST place a new order
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { pair, side, order_type, price, stop_price, amount } = body

  if (!pair || !side || !order_type || !amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid order parameters" }, { status: 400 })
  }

  // Fetch live price for the pair
  const baseAsset = pair.split("/")[0]
  const quoteAsset = pair.split("/")[1] || "USDT"

  let currentPrice = price
  if (order_type === "market") {
    try {
      const priceRes = await fetch(`${request.nextUrl.origin}/api/prices`)
      const priceData = await priceRes.json()
      const found = priceData.crypto?.find((c: { symbol: string }) => c.symbol === baseAsset)
      if (found) currentPrice = found.price
      else return NextResponse.json({ error: "Asset not found" }, { status: 400 })
    } catch {
      return NextResponse.json({ error: "Could not fetch price" }, { status: 500 })
    }
  }

  if (!currentPrice || currentPrice <= 0) {
    return NextResponse.json({ error: "Price required for limit orders" }, { status: 400 })
  }

  const total = currentPrice * amount
  const fee = total * 0.001 // 0.1% fee

  // Check balances
  if (side === "buy") {
    const { data: bal } = await supabase.from("balances").select("*").eq("user_id", user.id).eq("asset", quoteAsset).single()
    if (!bal || bal.available < total + fee) {
      return NextResponse.json({ error: `Insufficient ${quoteAsset} balance. Need ${(total + fee).toFixed(2)}, have ${bal?.available ?? 0}` }, { status: 400 })
    }
  } else {
    const { data: bal } = await supabase.from("balances").select("*").eq("user_id", user.id).eq("asset", baseAsset).single()
    if (!bal || bal.available < amount) {
      return NextResponse.json({ error: `Insufficient ${baseAsset} balance. Need ${amount}, have ${bal?.available ?? 0}` }, { status: 400 })
    }
  }

  // For market orders: execute immediately
  if (order_type === "market") {
    // Deduct from balance
    if (side === "buy") {
      await supabase.rpc("execute_buy_market", { p_user_id: user.id, p_base: baseAsset, p_quote: quoteAsset, p_amount: amount, p_price: currentPrice, p_fee: fee, p_total: total })
    } else {
      await supabase.rpc("execute_sell_market", { p_user_id: user.id, p_base: baseAsset, p_quote: quoteAsset, p_amount: amount, p_price: currentPrice, p_fee: fee, p_total: total })
    }

    // Fallback: do it with regular queries if RPCs don't exist
    // Insert order as filled
    const { data: order, error: orderErr } = await supabase.from("orders").insert({
      user_id: user.id, pair, side, order_type, price: currentPrice, amount, filled: amount, total, status: "filled"
    }).select().single()

    if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 500 })

    // Calculate P&L for sells
    let pnl = 0
    if (side === "sell") {
      const { data: prevBuys } = await supabase.from("trades").select("price, amount").eq("user_id", user.id).eq("pair", pair).eq("side", "buy").order("created_at", { ascending: false }).limit(1)
      if (prevBuys && prevBuys.length > 0) {
        const avgBuyPrice = prevBuys[0].price
        pnl = (currentPrice - avgBuyPrice) * amount - fee
      }
    }

    // Record trade
    const { data: trade, error: tradeErr } = await supabase.from("trades").insert({
      user_id: user.id, order_id: order.id, pair, side, price: currentPrice, amount, total, fee, pnl
    }).select().single()

    if (tradeErr) return NextResponse.json({ error: tradeErr.message }, { status: 500 })

    // Update balances
    if (side === "buy") {
      // Deduct USDT
      await supabase.from("balances").update({
        available: supabase.rpc ? undefined : 0,
        updated_at: new Date().toISOString()
      }).eq("user_id", user.id).eq("asset", quoteAsset)

      // Use raw SQL via RPC for atomic update, or do read-then-write
      const { data: quoteBal } = await supabase.from("balances").select("available").eq("user_id", user.id).eq("asset", quoteAsset).single()
      if (quoteBal) {
        await supabase.from("balances").update({ available: Math.max(0, quoteBal.available - total - fee), updated_at: new Date().toISOString() }).eq("user_id", user.id).eq("asset", quoteAsset)
      }

      // Add base asset
      const { data: baseBal } = await supabase.from("balances").select("available").eq("user_id", user.id).eq("asset", baseAsset).single()
      if (baseBal) {
        await supabase.from("balances").update({ available: baseBal.available + amount, updated_at: new Date().toISOString() }).eq("user_id", user.id).eq("asset", baseAsset)
      } else {
        await supabase.from("balances").insert({ user_id: user.id, asset: baseAsset, available: amount, in_order: 0 })
      }
    } else {
      // Sell: deduct base
      const { data: baseBal } = await supabase.from("balances").select("available").eq("user_id", user.id).eq("asset", baseAsset).single()
      if (baseBal) {
        await supabase.from("balances").update({ available: Math.max(0, baseBal.available - amount), updated_at: new Date().toISOString() }).eq("user_id", user.id).eq("asset", baseAsset)
      }
      // Add USDT
      const { data: quoteBal } = await supabase.from("balances").select("available").eq("user_id", user.id).eq("asset", quoteAsset).single()
      if (quoteBal) {
        await supabase.from("balances").update({ available: quoteBal.available + total - fee, updated_at: new Date().toISOString() }).eq("user_id", user.id).eq("asset", quoteAsset)
      }
    }

    return NextResponse.json({ success: true, order, trade, message: `${side.toUpperCase()} ${amount} ${baseAsset} at $${currentPrice.toLocaleString()}` })
  }

  // For limit orders: place as pending
  const { data: order, error } = await supabase.from("orders").insert({
    user_id: user.id, pair, side, order_type, price: currentPrice, stop_price, amount, filled: 0, total: currentPrice * amount, status: "open"
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Lock the balance
  if (side === "buy") {
    const { data: quoteBal } = await supabase.from("balances").select("*").eq("user_id", user.id).eq("asset", quoteAsset).single()
    if (quoteBal) {
      await supabase.from("balances").update({ available: quoteBal.available - total, in_order: quoteBal.in_order + total, updated_at: new Date().toISOString() }).eq("user_id", user.id).eq("asset", quoteAsset)
    }
  } else {
    const { data: baseBal } = await supabase.from("balances").select("*").eq("user_id", user.id).eq("asset", baseAsset).single()
    if (baseBal) {
      await supabase.from("balances").update({ available: baseBal.available - amount, in_order: baseBal.in_order + amount, updated_at: new Date().toISOString() }).eq("user_id", user.id).eq("asset", baseAsset)
    }
  }

  return NextResponse.json({ success: true, order, message: `Limit ${side.toUpperCase()} order placed for ${amount} ${baseAsset} at $${currentPrice.toLocaleString()}` })
}

// DELETE cancel an order
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const orderId = request.nextUrl.searchParams.get("id")
  if (!orderId) return NextResponse.json({ error: "Order ID required" }, { status: 400 })

  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).eq("user_id", user.id).single()
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
  if (order.status !== "open") return NextResponse.json({ error: "Cannot cancel filled order" }, { status: 400 })

  // Cancel order
  await supabase.from("orders").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", orderId)

  // Unlock balance
  const baseAsset = order.pair.split("/")[0]
  const quoteAsset = order.pair.split("/")[1] || "USDT"
  const remaining = order.amount - order.filled

  if (order.side === "buy") {
    const lockedTotal = order.price * remaining
    const { data: quoteBal } = await supabase.from("balances").select("*").eq("user_id", user.id).eq("asset", quoteAsset).single()
    if (quoteBal) {
      await supabase.from("balances").update({ available: quoteBal.available + lockedTotal, in_order: Math.max(0, quoteBal.in_order - lockedTotal) }).eq("user_id", user.id).eq("asset", quoteAsset)
    }
  } else {
    const { data: baseBal } = await supabase.from("balances").select("*").eq("user_id", user.id).eq("asset", baseAsset).single()
    if (baseBal) {
      await supabase.from("balances").update({ available: baseBal.available + remaining, in_order: Math.max(0, baseBal.in_order - remaining) }).eq("user_id", user.id).eq("asset", baseAsset)
    }
  }

  return NextResponse.json({ success: true, message: "Order cancelled" })
}
