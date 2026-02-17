import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized", status: 401 }

  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase.from("profiles").select("role").eq("id", user.id).single()
  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin"
  if (!isAdmin) return { error: "Forbidden", status: 403 }

  return { user, adminSupabase, role: profile.role }
}

async function getLivePrice(baseAsset: string): Promise<number> {
  try {
    const symbol = `${baseAsset}USDT`
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`, { cache: "no-store" })
    if (!res.ok) return 0
    const data = await res.json()
    return parseFloat(data.price) || 0
  } catch {
    return 0
  }
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

/**
 * GET /api/admin/trades
 * Fetch all trades, orders, or specific user's trades/orders
 */
export async function GET(request: NextRequest) {
  const auth = await verifyAdmin()
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { adminSupabase } = auth

  const type = request.nextUrl.searchParams.get("type") ?? "trades"
  const userId = request.nextUrl.searchParams.get("user_id")
  const search = request.nextUrl.searchParams.get("search")

  if (type === "orders") {
    let query = adminSupabase
      .from("orders")
      .select("*, profiles(email, full_name)")
      .order("created_at", { ascending: false })
      .limit(200)

    if (userId) query = query.eq("user_id", userId)
    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    let results = data ?? []
    if (search) {
      const s = search.toLowerCase()
      results = results.filter((o: any) =>
        o.profiles?.email?.toLowerCase().includes(s) ||
        o.profiles?.full_name?.toLowerCase().includes(s) ||
        o.pair?.toLowerCase().includes(s)
      )
    }
    return NextResponse.json({ orders: results })
  }

  // Default: trades
  let query = adminSupabase
    .from("trades")
    .select("*, profiles(email, full_name)")
    .order("created_at", { ascending: false })
    .limit(200)

  if (userId) query = query.eq("user_id", userId)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let results = data ?? []
  if (search) {
    const s = search.toLowerCase()
    results = results.filter((t: any) =>
      t.profiles?.email?.toLowerCase().includes(s) ||
      t.profiles?.full_name?.toLowerCase().includes(s) ||
      t.pair?.toLowerCase().includes(s)
    )
  }
  return NextResponse.json({ trades: results })
}

/**
 * POST /api/admin/trades
 * Admin actions: modify_order, cancel_order, close_trade, open_trade
 */
export async function POST(request: NextRequest) {
  const auth = await verifyAdmin()
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { adminSupabase, user } = auth

  const body = await request.json()
  const { action } = body

  // ---- CANCEL ORDER ----
  if (action === "cancel_order") {
    const { order_id } = body
    if (!order_id) return NextResponse.json({ error: "order_id required" }, { status: 400 })

    const { data: order } = await adminSupabase.from("orders").select("*").eq("id", order_id).single()
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
    if (order.status !== "open" && order.status !== "partially_filled") {
      return NextResponse.json({ error: "Cannot cancel this order" }, { status: 400 })
    }

    await adminSupabase.from("orders").update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    }).eq("id", order_id)

    // Unlock balance
    const baseAsset = order.pair.split("/")[0]
    const quoteAsset = order.pair.split("/")[1] || "USDT"
    const remaining = order.amount - order.filled

    if (order.side === "buy") {
      const locked = order.price * remaining + (order.price * remaining * 0.001)
      const qBal = await ensureBalance(adminSupabase, order.user_id, quoteAsset)
      await adminSupabase.from("balances").update({
        available: qBal.available + locked,
        in_order: Math.max(0, (qBal.in_order || 0) - locked),
        updated_at: new Date().toISOString(),
      }).eq("user_id", order.user_id).eq("asset", quoteAsset)
    } else {
      const bBal = await ensureBalance(adminSupabase, order.user_id, baseAsset)
      await adminSupabase.from("balances").update({
        available: bBal.available + remaining,
        in_order: Math.max(0, (bBal.in_order || 0) - remaining),
        updated_at: new Date().toISOString(),
      }).eq("user_id", order.user_id).eq("asset", baseAsset)
    }

    return NextResponse.json({ success: true, message: "Order cancelled by admin" })
  }

  // ---- MODIFY ORDER ----
  if (action === "modify_order") {
    const { order_id, new_price, new_amount } = body
    if (!order_id) return NextResponse.json({ error: "order_id required" }, { status: 400 })

    const { data: order } = await adminSupabase.from("orders").select("*").eq("id", order_id).single()
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
    if (order.status !== "open") return NextResponse.json({ error: "Can only modify open orders" }, { status: 400 })

    const updates: Record<string, any> = { updated_at: new Date().toISOString() }
    if (new_price) updates.price = parseFloat(new_price)
    if (new_amount) {
      updates.amount = parseFloat(new_amount)
      updates.total = (new_price ? parseFloat(new_price) : order.price) * parseFloat(new_amount)
    }

    await adminSupabase.from("orders").update(updates).eq("id", order_id)
    return NextResponse.json({ success: true, message: "Order modified by admin" })
  }

  // ---- OPEN TRADE FOR USER ----
  if (action === "open_trade") {
    const { target_user_id, pair, side, amount, price: overridePrice } = body
    if (!target_user_id || !pair || !side || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const baseAsset = pair.split("/")[0]
    const quoteAsset = pair.split("/")[1] || "USDT"

    let execPrice = overridePrice ? parseFloat(overridePrice) : 0
    if (!execPrice) {
      execPrice = await getLivePrice(baseAsset)
      if (execPrice <= 0) return NextResponse.json({ error: "Could not fetch price" }, { status: 500 })
    }

    const total = execPrice * amount
    const fee = total * 0.001

    // Check balance
    if (side === "buy") {
      const bal = await ensureBalance(adminSupabase, target_user_id, quoteAsset)
      if (bal.available < total + fee) {
        return NextResponse.json({ error: `Insufficient ${quoteAsset}: need ${(total + fee).toFixed(2)}, have ${bal.available.toFixed(2)}` }, { status: 400 })
      }
    } else {
      const bal = await ensureBalance(adminSupabase, target_user_id, baseAsset)
      if (bal.available < amount) {
        return NextResponse.json({ error: `Insufficient ${baseAsset}: need ${amount}, have ${bal.available}` }, { status: 400 })
      }
    }

    // Create order + trade
    const { data: order, error: orderErr } = await adminSupabase.from("orders").insert({
      user_id: target_user_id, pair, side, order_type: "market",
      price: execPrice, amount, filled: amount,
      total, status: "filled",
    }).select().single()

    if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 500 })

    await adminSupabase.from("trades").insert({
      user_id: target_user_id, order_id: order.id, pair, side,
      price: execPrice, amount, total, fee, pnl: 0,
    })

    // Update balances
    if (side === "buy") {
      const qBal = await ensureBalance(adminSupabase, target_user_id, quoteAsset)
      await adminSupabase.from("balances").update({
        available: Math.max(0, qBal.available - total - fee),
        updated_at: new Date().toISOString(),
      }).eq("user_id", target_user_id).eq("asset", quoteAsset)

      const bBal = await ensureBalance(adminSupabase, target_user_id, baseAsset)
      await adminSupabase.from("balances").update({
        available: bBal.available + amount,
        updated_at: new Date().toISOString(),
      }).eq("user_id", target_user_id).eq("asset", baseAsset)
    } else {
      const bBal = await ensureBalance(adminSupabase, target_user_id, baseAsset)
      await adminSupabase.from("balances").update({
        available: Math.max(0, bBal.available - amount),
        updated_at: new Date().toISOString(),
      }).eq("user_id", target_user_id).eq("asset", baseAsset)

      const qBal = await ensureBalance(adminSupabase, target_user_id, quoteAsset)
      await adminSupabase.from("balances").update({
        available: qBal.available + total - fee,
        updated_at: new Date().toISOString(),
      }).eq("user_id", target_user_id).eq("asset", quoteAsset)
    }

    return NextResponse.json({
      success: true,
      message: `${side === "buy" ? "Bought" : "Sold"} ${amount} ${baseAsset} @ $${execPrice.toLocaleString()} for user (by admin)`,
    })
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
