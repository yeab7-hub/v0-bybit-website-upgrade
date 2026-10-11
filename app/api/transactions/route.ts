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

    const findDestination = (symbol: string) => supabase
      .from("deposit_addresses")
      .select("symbol, network, is_active, min_deposit")
      .eq("symbol", symbol)
      .eq("network", networkName)
      .eq("is_active", true)
      .maybeSingle()
    let { data: destination, error: destinationError } = await findDestination(assetName)
    if (!destination && !destinationError && assetName === "ETH") {
      const legacyResult = await findDestination("Ethereum")
      destination = legacyResult.data
      destinationError = legacyResult.error
    }
    if (destinationError) return NextResponse.json({ error: "Deposit routing is unavailable. Please try again later." }, { status: 503 })
    if (!destination) return NextResponse.json({ error: "This deposit asset/network is not currently available" }, { status: 400 })
    if (Number(destination.min_deposit || 0) > amountNum) return NextResponse.json({ error: `Minimum deposit is ${destination.min_deposit} ${assetName}` }, { status: 400 })

    if (txHash) {
      // A chain transaction hash must not be credited to multiple accounts.
      // This check is network-wide, not scoped to the submitting user.
      const { data: existing, error: duplicateError } = await supabase
        .from("transactions")
        .select("id")
        .eq("type", "deposit")
        .eq("network", networkName)
        .eq("tx_hash", txHash)
        .maybeSingle()
      if (duplicateError) return NextResponse.json({ error: "Could not verify transaction hash" }, { status: 503 })
      if (existing) {
        return NextResponse.json({
          error: "This transaction hash is already associated with a deposit request on this network.",
        }, { status: 409 })
      }
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
        subject: `Deposit Request Submitted - ${amountNum} ${assetName}`,
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

    const findNetwork = (symbol: string) => supabase
      .from("deposit_addresses")
      .select("symbol, network")
      .eq("symbol", symbol)
      .eq("network", network)
      .eq("is_active", true)
      .maybeSingle()
    let { data: supportedNetwork, error: networkError } = await findNetwork(asset)
    if (!supportedNetwork && !networkError && asset === "ETH") {
      const legacyResult = await findNetwork("Ethereum")
      supportedNetwork = legacyResult.data
      networkError = legacyResult.error
    }
    if (networkError) return NextResponse.json({ error: "Could not verify the selected network" }, { status: 503 })
    if (!supportedNetwork) return NextResponse.json({ error: "This asset/network is not currently supported for withdrawals" }, { status: 400 })

    // Read and lock the balance with a compare-and-set condition to prevent
    // concurrent withdrawal requests from spending the same available funds.
    const { data: balance, error: balanceError } = await supabase
      .from("balances")
      .select("available, in_order")
      .eq("user_id", user.id)
      .eq("asset", asset)
      .maybeSingle()

    if (balanceError) return NextResponse.json({ error: "Could not read your balance" }, { status: 500 })
    if (!balance || Number(balance.available) < amountNum) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    const oldAvailable = Number(balance.available)
    const oldInOrder = Number(balance.in_order || 0)
    const newAvailable = oldAvailable - amountNum
    const newInOrder = oldInOrder + amountNum
    const { data: lockedBalance, error: lockErr } = await supabase
      .from("balances")
      .update({
        available: newAvailable,
        in_order: newInOrder,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("asset", asset)
      .eq("available", oldAvailable)
      .select("id")
      .maybeSingle()

    if (lockErr) return NextResponse.json({ error: "Could not reserve withdrawal funds" }, { status: 500 })
    if (!lockedBalance) return NextResponse.json({ error: "Your balance changed. Refresh and try again." }, { status: 409 })

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

    if (error) {
      // Roll back only if the balance still matches the exact values written above.
      const { data: rollback } = await supabase.from("balances").update({
        available: oldAvailable,
        in_order: oldInOrder,
        updated_at: new Date().toISOString(),
      }).eq("user_id", user.id).eq("asset", asset)
        .eq("available", newAvailable).eq("in_order", newInOrder)
        .select("id").maybeSingle()
      return NextResponse.json({
        error: rollback
          ? "Could not create the withdrawal request; the reserved funds were restored."
          : "Could not create the withdrawal request and the reserved balance could not be restored automatically. Contact support before retrying.",
      }, { status: 500 })
    }

    notifyAdmin({
      subject: `New Withdrawal Request - ${amountNum} ${asset}`,
      event: "Withdrawal Request",
      userEmail: user.email || "unknown",
      details: { Asset: asset, Amount: amountNum, Network: network || "N/A", Address: address || "N/A", Status: "Pending Approval" },
    }).catch(() => {})

    if (user.email) {
      sendBrandedEmail({
        to: user.email,
        subject: `Withdrawal Request Received - ${amountNum} ${asset}`,
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
