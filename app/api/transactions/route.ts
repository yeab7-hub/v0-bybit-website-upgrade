import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const type = request.nextUrl.searchParams.get("type")
  const status = request.nextUrl.searchParams.get("status")

  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (type) query = query.eq("type", type)
  if (status) query = query.eq("status", status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { action } = body

  if (action === "deposit") {
    const { asset, network, amount, tx_hash } = body
    const { data, error } = await supabase.from("transactions").insert({
      user_id: user.id,
      type: "deposit",
      asset,
      network: network || null,
      amount: parseFloat(amount),
      tx_hash: tx_hash || null,
      status: "pending",
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (action === "withdraw") {
    const { asset, network, amount, address, memo } = body
    const amountNum = parseFloat(amount)

    // Check balance
    const { data: balance } = await supabase
      .from("balances")
      .select("available")
      .eq("user_id", user.id)
      .eq("asset", asset)
      .single()

    if (!balance || balance.available < amountNum) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // Lock the funds (move from available to frozen)
    const { error: lockErr } = await supabase
      .from("balances")
      .update({
        available: balance.available - amountNum,
        frozen: (balance as any).frozen ? (balance as any).frozen + amountNum : amountNum,
      })
      .eq("user_id", user.id)
      .eq("asset", asset)

    if (lockErr) return NextResponse.json({ error: lockErr.message }, { status: 500 })

    const { data, error } = await supabase.from("transactions").insert({
      user_id: user.id,
      type: "withdrawal",
      asset,
      network: network || null,
      amount: amountNum,
      address: address || null,
      memo: memo || null,
      status: "pending",
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (action === "transfer") {
    const { asset, amount, from_account, to_account } = body
    const amountNum = parseFloat(amount)

    // For internal transfers, auto-approve
    const { data: balance } = await supabase
      .from("balances")
      .select("available")
      .eq("user_id", user.id)
      .eq("asset", asset)
      .single()

    if (!balance || balance.available < amountNum) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    const { data, error } = await supabase.from("transactions").insert({
      user_id: user.id,
      type: "transfer",
      asset,
      amount: amountNum,
      status: "completed",
      admin_note: `${from_account} -> ${to_account}`,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
