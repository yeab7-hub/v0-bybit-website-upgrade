import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { checkAccountStatus } from "@/lib/account-status"
import { notifyAdmin } from "@/lib/notify-admin"
import { renderDepositEmail, renderWithdrawalEmail, sendBrandedEmail } from "@/lib/email/templates"

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

  let body: Record<string, any>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
  const { action } = body

  if (action === "deposit") {
    const assetName = String(body.asset || "").trim().toUpperCase()
    const networkName = String(body.network || "").trim()
    const amountNum = Number(body.amount)
    const txHash = String(body.tx_hash || "").trim()
    if (!assetName || !networkName || !Number.isFinite(amountNum) || amountNum <= 0) {
      return NextResponse.json({ error: "Enter a valid asset, network, and positive amount" }, { status: 400 })
    }
    if (txHash.length > 256) return NextResponse.json({ error: "Transaction hash is too long" }, { status: 400 })

    const { data: destination, error: destinationError } = await supabase
      .from("deposit_addresses")
      .select("symbol, network, is_active, min_deposit")
      .eq("symbol", assetName)
      .eq("network", networkName)
      .eq("is_active", true)
      .maybeSingle()
    if (destinationError) return NextResponse.json({ error: "Deposit routing is unavailable. Please try again later." }, { status: 503 })
    if (!destination) return NextResponse.json({ error: "This deposit asset/network is not currently available" }, { status: 400 })
    if (Number(destination.min_deposit || 0) > amountNum) return NextResponse.json({ error: `Minimum deposit is ${destination.min_deposit} ${assetName}` }, { status: 400 })

    if (txHash) {
      const { data: existing, error: duplicateError } = await supabase.from("transactions").select("*").eq("user_id", user.id).eq("type", "deposit").eq("asset", assetName).eq("network", networkName).eq("tx_hash", txHash).maybeSingle()
      if (duplicateError) return NextResponse.json({ error: "Could not verify transaction hash" }, { status: 503 })
      if (existing) return NextResponse.json(existing)
    }

    const { data, error } = await supabase.from("transactions").insert({
      user_id: user.id, type: "deposit", asset: assetName, network: networkName,
      amount: amountNum, tx_hash: txHash || null, status: "pending",
    }).select().single()

    if (error) return NextResponse.json({ error: "Could not queue deposit for review" }, { status: 500 })

    notifyAdmin({
      subject: `New Deposit Request - ${amountNum} ${assetName}`,
      event: "Deposit Request",
      userEmail: user.email || "unknown",
      details: { Asset: assetName, Amount: amountNum, Network: networkName || "N/A", TX_Hash: txHash || "N/A", Status: "Pending Approval" },
    }).catch(() => {})

    if (user.email) {
      sendBrandedEmail({
        to: user.email,
        subject: `Deposit Received - ${amountNum} ${assetName} - Bybit`,
        html: renderDepositEmail({ status: "pending", amount: String(amountNum), asset: assetName, network: networkName }),
      }).catch(() => {})
    }

    return NextResponse.json(data)
  }

  if (action === "withdraw") {
    const asset = String(body.asset ?? "").trim().toUpperCase()
    const network = String(body.network ?? "").trim()
    const amountNum = Number(body.amount)
    const address = String(body.address ?? "").trim()
    const memo = String(body.memo ?? "").trim()

    if (!/^[A-Z0-9]{2,12}$/.test(asset) || !network || !address || !Number.isFinite(amountNum) || amountNum <= 0) {
      return NextResponse.json({ error: "Enter a valid asset, network, destination address, and positive amount" }, { status: 400 })
    }
    if (address.length > 512 || network.length > 80 || memo.length > 256) {
      return NextResponse.json({ error: "Withdrawal details exceed the allowed length" }, { status: 400 })
    }
    const accountStatus = await checkAccountStatus(supabase, user.id)
    if (accountStatus.blocked) return NextResponse.json({ error: accountStatus.reason }, { status: 403 })

    // Check balance
    const { data: balance } = await supabase
      .from("balances")
      .select("available, in_order")
      .eq("user_id", user.id)
      .eq("asset", asset)
      .single()

    if (!balance || balance.available < amountNum) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // Lock the funds (move from available to in_order)
    const { error: lockErr } = await supabase
      .from("balances")
      .update({
        available: balance.available - amountNum,
        in_order: (balance.in_order || 0) + amountNum,
        updated_at: new Date().toISOString(),
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
      notes: memo || null,
      status: "pending",
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    notifyAdmin({
      subject: `New Withdrawal Request - ${amountNum} ${asset}`,
      event: "Withdrawal Request",
      userEmail: user.email || "unknown",
      details: { Asset: asset, Amount: amountNum, Network: network || "N/A", Address: address || "N/A", Status: "Pending Approval" },
    }).catch(() => {})

    if (user.email) {
      sendBrandedEmail({
        to: user.email,
        subject: `Withdrawal Request Received - ${amountNum} ${asset} - Bybit`,
        html: renderWithdrawalEmail({ status: "pending", amount: String(amountNum), asset, address }),
      }).catch(() => {})
    }

    return NextResponse.json(data)
  }

  if (action === "transfer") {
    // The current balances schema does not track separate Spot/Funding/etc.
    // Do not create a completed transaction unless funds can actually move.
    return NextResponse.json({
      error: "Internal account transfers are not configured yet. No funds were moved.",
    }, { status: 501 })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
