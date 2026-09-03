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

  if (action === "approve") {
    if (tx.type === "deposit") {
      const { data: balance } = await adminSupabase
        .from("balances")
        .select("*")
        .eq("user_id", tx.user_id)
        .eq("asset", tx.asset)
        .single()

      if (balance) {
        await adminSupabase.from("balances").update({
          available: balance.available + tx.amount,
          updated_at: new Date().toISOString(),
        }).eq("user_id", tx.user_id).eq("asset", tx.asset)
      } else {
        await adminSupabase.from("balances").insert({
          user_id: tx.user_id,
          asset: tx.asset,
          available: tx.amount,
          in_order: 0,
        })
      }
    }

    if (tx.type === "withdrawal") {
      const { data: balance } = await adminSupabase
        .from("balances")
        .select("*")
        .eq("user_id", tx.user_id)
        .eq("asset", tx.asset)
        .single()

      if (balance) {
        await adminSupabase.from("balances").update({
          in_order: Math.max(0, (balance.in_order || 0) - tx.amount),
          updated_at: new Date().toISOString(),
        }).eq("user_id", tx.user_id).eq("asset", tx.asset)
      }
    }

    await adminSupabase.from("transactions").update({
      status: "completed",
      notes: admin_note || "Approved by admin",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    }).eq("id", id)

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
      const { data: balance } = await adminSupabase
        .from("balances")
        .select("*")
        .eq("user_id", tx.user_id)
        .eq("asset", tx.asset)
        .single()

      if (balance) {
        await adminSupabase.from("balances").update({
          available: balance.available + tx.amount,
          in_order: Math.max(0, (balance.in_order || 0) - tx.amount),
          updated_at: new Date().toISOString(),
        }).eq("user_id", tx.user_id).eq("asset", tx.asset)
      }
    }

    await adminSupabase.from("transactions").update({
      status: "rejected",
      notes: admin_note || "Rejected by admin",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    }).eq("id", id)

    // Create in-app notification for the user
    const rejectionReason = admin_note || "Your withdrawal request did not meet our requirements."
    await adminSupabase.from("notifications").insert({
      user_id: tx.user_id,
      type: "withdrawal_rejected",
      title: "Withdrawal Request Rejected",
      message: `Your withdrawal of ${tx.amount} ${tx.asset} has been rejected. Reason: ${rejectionReason}. Funds have been returned to your available balance.`,
      metadata: { transaction_id: id, amount: tx.amount, asset: tx.asset, reason: rejectionReason },
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
