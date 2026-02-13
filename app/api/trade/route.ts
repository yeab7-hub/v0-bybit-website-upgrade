import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

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

  const { data } = await supabase.from("orders").select("*").eq("user_id", user.id).in("status", ["open", "partially_filled"]).order("created_at", { ascending: false })
  return NextResponse.json({ orders: data ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { pair, side, order_type, price, stop_price, amount } = body

  if (!pair || !side || !order_type || !amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid order parameters" }, { status: 400 })
  }

  const baseAsset = pair.split("/")[0]
  const quoteAsset = pair.split("/")[1] || "USDT"

  let execPrice = price
  if (order_type === "market") {
    try {
      const priceRes = await fetch(`${request.nextUrl.origin}/api/prices`)
      const priceData = await priceRes.json()
      const found = priceData.crypto?.find((c: { symbol: string }) => c.symbol === baseAsset)
      if (found) execPrice = found.price
      else return NextResponse.json({ error: "Asset not found" }, { status: 400 })
    } catch {
      return NextResponse.json({ error: "Could not fetch price" }, { status: 500 })
    }
  }

  if (!execPrice || execPrice <= 0) {
    return NextResponse.json({ error: "Price required for limit orders" }, { status: 400 })
  }

  const total = execPrice * amount
  const fee = total * 0.001

  // Check balance
  if (side === "buy") {
    const { data: bal } = await supabase.from("balances").select("*").eq("user_id", user.id).eq("asset", quoteAsset).single()
    if (!bal || bal.available < total + fee) {
      return NextResponse.json({ error: `Insufficient ${quoteAsset}. Need $${(total + fee).toFixed(2)}, have $${(bal?.available ?? 0).toFixed(2)}` }, { status: 400 })
    }
  } else {
    const { data: bal } = await supabase.from("balances").select("*").eq("user_id", user.id).eq("asset", baseAsset).single()
    if (!bal || bal.available < amount) {
      return NextResponse.json({ error: `Insufficient ${baseAsset}. Need ${amount}, have ${(bal?.available ?? 0).toFixed(6)}` }, { status: 400 })
    }
  }

  // Market order: execute immediately
  if (order_type === "market") {
    const { data: order, error: orderErr } = await supabase.from("orders").insert({
      user_id: user.id, pair, side, order_type, price: execPrice,
      amount, filled: amount, total, status: "filled"
    }).select().single()

    if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 500 })

    // P&L for sells
    let pnl = 0
    if (side === "sell") {
      const { data: prevBuys } = await supabase.from("trades").select("price, amount")
        .eq("user_id", user.id).eq("pair", pair).eq("side", "buy")
        .order("created_at", { ascending: false }).limit(1)
      if (prevBuys && prevBuys.length > 0) {
        pnl = (execPrice - prevBuys[0].price) * amount - fee
      }
    }

    await supabase.from("trades").insert({
      user_id: user.id, order_id: order.id, pair, side,
      price: execPrice, amount, total, fee, pnl
    })

    // Update balances
    if (side === "buy") {
      const { data: qBal } = await supabase.from("balances").select("*").eq("user_id", user.id).eq("asset", quoteAsset).single()
      if (qBal) await supabase.from("balances").update({ available: Math.max(0, qBal.available - total - fee), updated_at: new Date().toISOString() }).eq("user_id", user.id).eq("asset", quoteAsset)

      const { data: bBal } = await supabase.from("balances").select("*").eq("user_id", user.id).eq("asset", baseAsset).single()
      if (bBal) {
        await supabase.from("balances").update({ available: bBal.available + amount, updated_at: new Date().toISOString() }).eq("user_id", user.id).eq("asset", baseAsset)
      } else {
        await supabase.from("balances").insert({ user_id: user.id, asset: baseAsset, available: amount, in_order: 0 })
      }
    } else {
      const { data: bBal } = await supabase.from("balances").select("*").eq("user_id", user.id).eq("asset", baseAsset).single()
      if (bBal) await supabase.from("balances").update({ available: Math.max(0, bBal.available - amount), updated_at: new Date().toISOString() }).eq("user_id", user.id).eq("asset", baseAsset)

      const { data: qBal } = await supabase.from("balances").select("*").eq("user_id", user.id).eq("asset", quoteAsset).single()
      if (qBal) await supabase.from("balances").update({ available: qBal.available + total - fee, updated_at: new Date().toISOString() }).eq("user_id", user.id).eq("asset", quoteAsset)
    }

    return NextResponse.json({
      success: true, order,
      message: `${side === "buy" ? "Bought" : "Sold"} ${amount} ${baseAsset} @ $${Number(execPrice).toLocaleString()} | Fee: $${fee.toFixed(2)}${pnl !== 0 ? ` | P&L: ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}` : ""}`
    })
  }

  // Limit / Stop-Limit
  const { data: order, error } = await supabase.from("orders").insert({
    user_id: user.id, pair, side, order_type,
    price: execPrice, stop_price: stop_price || null,
    amount, filled: 0, total: execPrice * amount, status: "open"
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Lock balance
  if (side === "buy") {
    const { data: qBal } = await supabase.from("balances").select("*").eq("user_id", user.id).eq("asset", quoteAsset).single()
    if (qBal) await supabase.from("balances").update({ available: qBal.available - total, in_order: qBal.in_order + total, updated_at: new Date().toISOString() }).eq("user_id", user.id).eq("asset", quoteAsset)
  } else {
    const { data: bBal } = await supabase.from("balances").select("*").eq("user_id", user.id).eq("asset", baseAsset).single()
    if (bBal) await supabase.from("balances").update({ available: bBal.available - amount, in_order: bBal.in_order + amount, updated_at: new Date().toISOString() }).eq("user_id", user.id).eq("asset", baseAsset)
  }

  return NextResponse.json({ success: true, order, message: `${order_type === "limit" ? "Limit" : "Stop-Limit"} ${side} order placed: ${amount} ${baseAsset} @ $${Number(execPrice).toLocaleString()}` })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const orderId = request.nextUrl.searchParams.get("id")
  if (!orderId) return NextResponse.json({ error: "Order ID required" }, { status: 400 })

  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).eq("user_id", user.id).single()
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
  if (order.status !== "open") return NextResponse.json({ error: "Cannot cancel" }, { status: 400 })

  await supabase.from("orders").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", orderId)

  const baseAsset = order.pair.split("/")[0]
  const quoteAsset = order.pair.split("/")[1] || "USDT"
  const remaining = order.amount - order.filled

  if (order.side === "buy") {
    const locked = order.price * remaining
    const { data: qBal } = await supabase.from("balances").select("*").eq("user_id", user.id).eq("asset", quoteAsset).single()
    if (qBal) await supabase.from("balances").update({ available: qBal.available + locked, in_order: Math.max(0, qBal.in_order - locked) }).eq("user_id", user.id).eq("asset", quoteAsset)
  } else {
    const { data: bBal } = await supabase.from("balances").select("*").eq("user_id", user.id).eq("asset", baseAsset).single()
    if (bBal) await supabase.from("balances").update({ available: bBal.available + remaining, in_order: Math.max(0, bBal.in_order - remaining) }).eq("user_id", user.id).eq("asset", baseAsset)
  }

  return NextResponse.json({ success: true, message: "Order cancelled successfully" })
}
