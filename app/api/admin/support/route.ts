import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
  if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) return null
  return user
}

export async function GET() {
  const supabase = await createClient()
  const admin = await verifyAdmin(supabase)
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { data: tickets, error } = await supabase
    .from("support_tickets")
    .select("*, profiles!support_tickets_user_id_fkey(email, full_name)")
    .order("created_at", { ascending: false })

  if (error) {
    // Fallback without join
    const { data: ticketsFallback } = await supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false })
    return NextResponse.json(ticketsFallback || [])
  }

  return NextResponse.json(tickets || [])
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const admin = await verifyAdmin(supabase)
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await request.json()
  const { ticket_id, status, priority, message } = body

  if (!ticket_id) return NextResponse.json({ error: "Missing ticket_id" }, { status: 400 })

  // Update ticket status/priority
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (status) updates.status = status
  if (priority) updates.priority = priority

  await supabase
    .from("support_tickets")
    .update(updates)
    .eq("id", ticket_id)

  // Send admin reply
  if (message) {
    await supabase.from("support_messages").insert({
      ticket_id,
      sender_id: admin.id,
      sender_role: "admin",
      message,
    })
  }

  // Log activity
  await supabase.from("activity_logs").insert({
    user_id: admin.id,
    action: "support_reply",
    details: { ticket_id, status, has_message: !!message },
  })

  return NextResponse.json({ success: true })
}
