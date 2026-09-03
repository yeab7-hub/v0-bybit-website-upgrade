import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin" && profile?.role !== "super_admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }
  return { user }
}

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  // Service-role client bypasses RLS so every user's ticket is visible to the admin,
  // regardless of the admin vs super_admin RLS role mismatch.
  const admin = await createAdminClient()

  const { data: tickets, error } = await admin
    .from("support_tickets")
    .select("*")
    .order("updated_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Enrich with requester profile info (support_tickets.user_id maps to profiles.id).
  const userIds = [...new Set((tickets ?? []).map((t) => t.user_id))]
  const profileMap = new Map<string, { email?: string; full_name?: string }>()
  if (userIds.length > 0) {
    const { data: profiles } = await admin.from("profiles").select("id, email, full_name").in("id", userIds)
    for (const p of profiles ?? []) profileMap.set(p.id, { email: p.email, full_name: p.full_name })
  }

  const enriched = (tickets ?? []).map((t) => ({
    ...t,
    user_email: profileMap.get(t.user_id)?.email || "unknown",
    user_name: profileMap.get(t.user_id)?.full_name || "",
  }))

  return NextResponse.json({ tickets: enriched })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error
  const user = auth.user!

  const body = await request.json()
  const { action, ticket_id, message, status } = body

  const admin = await createAdminClient()

  if (action === "reply" && ticket_id && message) {
    const { error: msgErr } = await admin.from("support_messages").insert({
      ticket_id,
      sender_id: user.id,
      sender_role: "admin",
      message,
    })
    if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 })

    await admin.from("support_tickets").update({
      status: "in_progress",
      updated_at: new Date().toISOString(),
    }).eq("id", ticket_id)

    return NextResponse.json({ success: true })
  }

  if (action === "update_status" && ticket_id && status) {
    const { error: updErr } = await admin.from("support_tickets").update({
      status,
      updated_at: new Date().toISOString(),
    }).eq("id", ticket_id)
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
