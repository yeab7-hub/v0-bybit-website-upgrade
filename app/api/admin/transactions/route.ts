import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { data, error } = await supabase
    .from("transactions")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id, action, admin_note } = await request.json()

  // Get the transaction
  const { data: tx, error: txErr } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .single()

  if (txErr || !tx) return NextResponse.json({ error: "Transaction not found" }, { status: 404 })

  if (action === "approve") {
    if (tx.type === "deposit") {
      // Credit user balance
      const { data: balance } = await supabase
        .from("balances")
        .select("*")
        .eq("user_id", tx.user_id)
        .eq("asset", tx.asset)
        .single()

      if (balance) {
        await supabase.from("balances").update({
          available: balance.available + tx.amount,
          updated_at: new Date().toISOString(),
        }).eq("user_id", tx.user_id).eq("asset", tx.asset)
      } else {
        await supabase.from("balances").insert({
          user_id: tx.user_id,
          asset: tx.asset,
          available: tx.amount,
          in_order: 0,
        })
      }
    }

    if (tx.type === "withdrawal") {
      // Remove from in_order (already locked when created)
      const { data: balance } = await supabase
        .from("balances")
        .select("*")
        .eq("user_id", tx.user_id)
        .eq("asset", tx.asset)
        .single()

      if (balance) {
        await supabase.from("balances").update({
          in_order: Math.max(0, (balance.in_order || 0) - tx.amount),
          updated_at: new Date().toISOString(),
        }).eq("user_id", tx.user_id).eq("asset", tx.asset)
      }
    }

    await supabase.from("transactions").update({
      status: "completed",
      notes: admin_note || "Approved by admin",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    }).eq("id", id)

    return NextResponse.json({ success: true })
  }

  if (action === "reject") {
    if (tx.type === "withdrawal") {
      // Return locked funds to available
      const { data: balance } = await supabase
        .from("balances")
        .select("*")
        .eq("user_id", tx.user_id)
        .eq("asset", tx.asset)
        .single()

      if (balance) {
        await supabase.from("balances").update({
          available: balance.available + tx.amount,
          in_order: Math.max(0, (balance.in_order || 0) - tx.amount),
          updated_at: new Date().toISOString(),
        }).eq("user_id", tx.user_id).eq("asset", tx.asset)
      }
    }

    await supabase.from("transactions").update({
      status: "rejected",
      notes: admin_note || "Rejected by admin",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    }).eq("id", id)

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
