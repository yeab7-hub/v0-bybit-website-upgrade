import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const adminSupabase = await createAdminClient()
  const { data: orders, error } = await adminSupabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(orders)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const adminSupabase = await createAdminClient()
  const body = await request.json()
  const { pair, side, order_type, price, amount, stop_price } = body

  if (!pair || !side || !order_type || !amount) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const numPrice = parseFloat(price) || 0
  const numAmount = parseFloat(amount) || 0
  const total = numPrice * numAmount

  // Check balance
  const quoteAsset = pair.split("/")[1] || "USDT"
  const baseAsset = pair.split("/")[0] || "BTC"
  const checkAsset = side === "buy" ? quoteAsset : baseAsset
  const requiredAmount = side === "buy" ? total : numAmount

  const { data: balance } = await adminSupabase
    .from("balances")
    .select("available")
    .eq("user_id", user.id)
    .eq("asset", checkAsset)
    .single()

  if (!balance || balance.available < requiredAmount) {
    return NextResponse.json({ error: `Insufficient ${checkAsset} balance` }, { status: 400 })
  }

  // Deduct balance (move to in_order)
  await adminSupabase
    .from("balances")
    .update({
      available: balance.available - requiredAmount,
      in_order: requiredAmount,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("asset", checkAsset)

  // For market orders, execute immediately
  if (order_type === "Market") {
    const { data: order, error: orderError } = await adminSupabase
      .from("orders")
      .insert({
        user_id: user.id,
        pair,
        side,
        order_type,
        price: numPrice,
        amount: numAmount,
        filled: numAmount,
        total,
        status: "filled",
      })
      .select()
      .single()

    if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 })

    const fee = total * 0.001

    await adminSupabase.from("trades").insert({
      user_id: user.id,
      order_id: order.id,
      pair,
      side,
      price: numPrice,
      amount: numAmount,
      total,
      fee,
      pnl: 0,
    })

    const receiveAsset = side === "buy" ? baseAsset : quoteAsset
    const receiveAmount = side === "buy" ? numAmount : (total - fee)

    const { data: existingBalance } = await adminSupabase
      .from("balances")
      .select("*")
      .eq("user_id", user.id)
      .eq("asset", receiveAsset)
      .single()

    if (existingBalance) {
      await adminSupabase
        .from("balances")
        .update({
          available: existingBalance.available + receiveAmount,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("asset", receiveAsset)
    } else {
      await adminSupabase.from("balances").insert({
        user_id: user.id,
        asset: receiveAsset,
        available: receiveAmount,
        in_order: 0,
      })
    }

    const { data: spentBalance } = await adminSupabase
      .from("balances")
      .select("*")
      .eq("user_id", user.id)
      .eq("asset", checkAsset)
      .single()

    if (spentBalance) {
      await adminSupabase
        .from("balances")
        .update({
          in_order: Math.max(0, spentBalance.in_order - requiredAmount),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("asset", checkAsset)
    }

    return NextResponse.json({ order, executed: true, fee })
  }

  // Limit / Stop-Limit: insert as open
  const { data: order, error: orderError } = await adminSupabase
    .from("orders")
    .insert({
      user_id: user.id,
      pair,
      side,
      order_type,
      price: numPrice,
      amount: numAmount,
      filled: 0,
      total,
      stop_price: stop_price ? parseFloat(stop_price) : null,
      status: "open",
    })
    .select()
    .single()

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 })
  return NextResponse.json({ order, executed: false })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const adminSupabase = await createAdminClient()
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get("id")
  if (!orderId) return NextResponse.json({ error: "Missing order id" }, { status: 400 })

  const { data: order } = await adminSupabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single()

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
  if (order.status !== "open") return NextResponse.json({ error: "Order not cancelable" }, { status: 400 })

  const quoteAsset = order.pair.split("/")[1] || "USDT"
  const baseAsset = order.pair.split("/")[0] || "BTC"
  const refundAsset = order.side === "buy" ? quoteAsset : baseAsset
  const refundAmount = order.side === "buy" ? order.total : order.amount

  const { data: balance } = await adminSupabase
    .from("balances")
    .select("*")
    .eq("user_id", user.id)
    .eq("asset", refundAsset)
    .single()

  if (balance) {
    await adminSupabase
      .from("balances")
      .update({
        available: balance.available + refundAmount,
        in_order: Math.max(0, balance.in_order - refundAmount),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("asset", refundAsset)
  }

  await adminSupabase
    .from("orders")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("user_id", user.id)

  return NextResponse.json({ success: true })
}
