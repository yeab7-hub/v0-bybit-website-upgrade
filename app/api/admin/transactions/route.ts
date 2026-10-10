import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { renderDepositEmail, renderWithdrawalEmail, sendBrandedEmail } from "@/lib/email/templates"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const adminSupabase = await createAdminClient()

  const { data: profile } = await adminSupabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin" && profile?.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // Fetch transactions (without FK join to avoid PostgREST errors if FK is missing)
  const { data: transactions, error } = await adminSupabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!transactions || transactions.length === 0) {
    return NextResponse.json([])
  }

  // Fetch associated profiles separately
  const userIds = [...new Set(transactions.map((t: any) => t.user_id).filter(Boolean))]
  const { data: profiles } = await adminSupabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", userIds)

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]))

  // Merge profile data into transactions
  const enriched = transactions.map((t: any) => ({
    ...t,
    profiles: profileMap.get(t.user_id) || { full_name: "Unknown", email: "—" },
  }))

  return NextResponse.json(enriched)
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const adminSupabase = await createAdminClient()

  const { data: profile } = await adminSupabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin" && profile?.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id, action, admin_note } = await request.json()

  const { data: tx, error: txErr } = await adminSupabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .single()

  if (txErr || !tx) return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }
  if (tx.status !== "pending") {
    return NextResponse.json({ error: "This transaction has already been reviewed or is being processed." }, { status: 409 })
  }
  if (tx.type !== "deposit" && tx.type !== "withdrawal") {
    return NextResponse.json({ error: "Unsupported transaction type" }, { status: 400 })
  }

  // Claim a pending transaction before touching balances so concurrent admin
  // requests cannot approve or reject the same request twice.
  const { data: claimed, error: claimError } = await adminSupabase
    .from("transactions")
    .update({ status: "processing", reviewed_by: user.id, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle()
  if (claimError || !claimed) {
    return NextResponse.json({ error: "This transaction is already being processed. Refresh and try again." }, { status: 409 })
  }

  if (action === "approve") {
    if (tx.type === "deposit") {
      const { data: balance, error: balanceReadError } = await adminSupabase
        .from("balances")
        .select("*")
        .eq("user_id", tx.user_id)
        .eq("asset", tx.asset)
        .maybeSingle()

      if (balanceReadError) {
        await adminSupabase.from("transactions").update({ status: "pending", reviewed_by: null, reviewed_at: null }).eq("id", id).eq("status", "processing")
        return NextResponse.json({ error: "Could not read the user's balance. The transaction remains pending." }, { status: 500 })
      }

      if (balance) {
        const { error: balanceUpdateError } = await adminSupabase.from("balances").update({
          available: Number(balance.available) + Number(tx.amount),
          updated_at: new Date().toISOString(),
        }).eq("user_id", tx.user_id).eq("asset", tx.asset)
        if (balanceUpdateError) {
          await adminSupabase.from("transactions").update({ status: "pending", reviewed_by: null, reviewed_at: null }).eq("id", id).eq("status", "processing")
          return NextResponse.json({ error: "Could not credit the deposit. The transaction remains pending." }, { status: 500 })
        }
      } else {
        const { error: balanceInsertError } = await adminSupabase.from("balances").insert({
          user_id: tx.user_id,
          asset: tx.asset,
          available: tx.amount,
          in_order: 0,
        })
        if (balanceInsertError) {
          await adminSupabase.from("transactions").update({ status: "pending", reviewed_by: null, reviewed_at: null }).eq("id", id).eq("status", "processing")
          return NextResponse.json({ error: "Could not create the user's balance. The transaction remains pending." }, { status: 500 })
        }
      }
    }

    if (tx.type === "withdrawal") {
      const { data: balance, error: balanceReadError } = await adminSupabase
        .from("balances")
        .select("*")
        .eq("user_id", tx.user_id)
        .eq("asset", tx.asset)
        .maybeSingle()

      if (balanceReadError || !balance) {
        await adminSupabase.from("transactions").update({ status: "pending", reviewed_by: null, reviewed_at: null }).eq("id", id).eq("status", "processing")
        return NextResponse.json({ error: "Could not find the withdrawal balance. The transaction remains pending." }, { status: 500 })
      }

      const { error: balanceUpdateError } = await adminSupabase.from("balances").update({
        in_order: Math.max(0, Number(balance.in_order || 0) - Number(tx.amount)),
        updated_at: new Date().toISOString(),
      }).eq("user_id", tx.user_id).eq("asset", tx.asset)
      if (balanceUpdateError) {
        await adminSupabase.from("transactions").update({ status: "pending", reviewed_by: null, reviewed_at: null }).eq("id", id).eq("status", "processing")
        return NextResponse.json({ error: "Could not finalize the withdrawal balance. The transaction remains pending." }, { status: 500 })
      }
    }

    const { error: finalizeError } = await adminSupabase.from("transactions").update({
      status: "completed",
      notes: admin_note || "Approved by admin",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    }).eq("id", id).eq("status", "processing")
    if (finalizeError) {
      return NextResponse.json({ error: "Balance operation succeeded but transaction finalization failed. Do not retry this request; reconcile this transaction before processing it again." }, { status: 500 })
    }

    // Notify the user that their deposit/withdrawal was approved
    const { data: approvedProfile } = await adminSupabase
      .from("profiles")
      .select("email")
      .eq("id", tx.user_id)
      .single()

    if (approvedProfile?.email) {
      const html =
        tx.type === "deposit"
          ? renderDepositEmail({ status: "approved", amount: String(tx.amount), asset: tx.asset, network: tx.network })
          : renderWithdrawalEmail({ status: "approved", amount: String(tx.amount), asset: tx.asset, address: tx.address })
      await sendBrandedEmail({
        to: approvedProfile.email,
        subject: `${tx.type === "deposit" ? "Deposit" : "Withdrawal"} Approved - ${tx.amount} ${tx.asset} - Bybit`,
        html,
      })
    }

    return NextResponse.json({ success: true })
  }

  if (action === "reject") {
    if (tx.type === "withdrawal") {
      const { data: balance, error: balanceReadError } = await adminSupabase
        .from("balances")
        .select("*")
        .eq("user_id", tx.user_id)
        .eq("asset", tx.asset)
        .maybeSingle()

      if (balanceReadError || !balance) {
        await adminSupabase.from("transactions").update({ status: "pending", reviewed_by: null, reviewed_at: null }).eq("id", id).eq("status", "processing")
        return NextResponse.json({ error: "Could not find the withdrawal balance. The transaction remains pending." }, { status: 500 })
      }

      const { error: balanceUpdateError } = await adminSupabase.from("balances").update({
        available: Number(balance.available) + Number(tx.amount),
        in_order: Math.max(0, Number(balance.in_order || 0) - Number(tx.amount)),
        updated_at: new Date().toISOString(),
      }).eq("user_id", tx.user_id).eq("asset", tx.asset)
      if (balanceUpdateError) {
        await adminSupabase.from("transactions").update({ status: "pending", reviewed_by: null, reviewed_at: null }).eq("id", id).eq("status", "processing")
        return NextResponse.json({ error: "Could not release the withdrawal hold. The transaction remains pending." }, { status: 500 })
      }
    }

    const { error: finalizeError } = await adminSupabase.from("transactions").update({
      status: "rejected",
      notes: admin_note || "Rejected by admin",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    }).eq("id", id).eq("status", "processing")
    if (finalizeError) {
      return NextResponse.json({ error: "Funds were released but transaction finalization failed. Do not retry this request; reconcile this transaction before processing it again." }, { status: 500 })
    }

    // Create in-app notification for the user
    const rejectionReason = admin_note || `Your ${tx.type} request did not meet our requirements.`
    await adminSupabase.from("notifications").insert({
      user_id: tx.user_id,
      type: `${tx.type}_rejected`,
      title: `${tx.type === "deposit" ? "Deposit" : "Withdrawal"} Request Rejected`,
      message: tx.type === "withdrawal"
        ? `Your withdrawal of ${tx.amount} ${tx.asset} has been rejected. Reason: ${rejectionReason}. Funds have been returned to your available balance.`
        : `Your deposit request for ${tx.amount} ${tx.asset} has been rejected. Reason: ${rejectionReason}.`,
      data: { transaction_id: id, amount: tx.amount, asset: tx.asset, reason: rejectionReason },
      read: false,
    })

    // Send branded rejection email to the user (with admin-provided reason)
    const { data: userProfile } = await adminSupabase
      .from("profiles")
      .select("email")
      .eq("id", tx.user_id)
      .single()

    if (userProfile?.email) {
      const html =
        tx.type === "deposit"
          ? renderDepositEmail({ status: "rejected", amount: String(tx.amount), asset: tx.asset, network: tx.network })
          : renderWithdrawalEmail({ status: "rejected", amount: String(tx.amount), asset: tx.asset, address: tx.address, reason: rejectionReason })
      await sendBrandedEmail({
        to: userProfile.email,
        subject: `${tx.type === "deposit" ? "Deposit" : "Withdrawal"} Rejected - ${tx.amount} ${tx.asset} - Bybit`,
        html,
      })
    }

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
