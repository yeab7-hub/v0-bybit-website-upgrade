import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

// GET user's tickets (or admin gets all)
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const ticketId = request.nextUrl.searchParams.get("ticket_id")
  const wantsAdmin = request.nextUrl.searchParams.get("admin") === "true"

  const { data: requesterProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  const isAdmin = requesterProfile?.role === "admin" || requesterProfile?.role === "super_admin"

  // Single ticket with messages. Admins may view any ticket; users only their own.
  if (ticketId) {
    // Admin reads bypass RLS via the service-role client so tickets/messages are
    // always visible regardless of the admin vs super_admin RLS role mismatch.
    const db = isAdmin ? await createAdminClient() : supabase

    const { data: ticket, error: ticketError } = await db
      .from("support_tickets")
      .select("*")
      .eq("id", ticketId)
      .single()
    if (ticketError || !ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    if (!isAdmin && ticket.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // Attach requester profile info (support_tickets.user_id maps to profiles.id).
    const { data: ticketProfile } = await db
      .from("profiles").select("email, full_name").eq("id", ticket.user_id).single()

    const { data: messages, error: messagesError } = await db
      .from("support_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true })
    if (messagesError) return NextResponse.json({ error: messagesError.message }, { status: 500 })

    return NextResponse.json({
      ticket: { ...ticket, user_email: ticketProfile?.email || "unknown", user_name: ticketProfile?.full_name || "" },
      messages: messages ?? [],
    })
  }

  // Admin: all tickets (service-role read + manual profile join)
  if (wantsAdmin) {
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const admin = await createAdminClient()
    const { data: tickets, error } = await admin
      .from("support_tickets").select("*").order("created_at", { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

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

  // User: own tickets
  const { data: tickets } = await supabase
    .from("support_tickets").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
  return NextResponse.json({ tickets: tickets ?? [] })
}

// POST create ticket or send message
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { action } = body

  // Create new ticket
  if (action === "create_ticket") {
    const { subject, category, message, priority } = body
    if (!subject || !message) return NextResponse.json({ error: "Subject and message required" }, { status: 400 })

    const { data: ticket, error: ticketErr } = await supabase.from("support_tickets").insert({
      user_id: user.id, subject, category: category || "general", priority: priority || "medium"
    }).select().single()

    if (ticketErr) return NextResponse.json({ error: ticketErr.message }, { status: 500 })

    const { error: msgErr } = await supabase.from("support_messages").insert({
      ticket_id: ticket.id, sender_id: user.id, sender_role: "user", message
    })

    if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 })

    return NextResponse.json({ success: true, ticket })
  }

  // Reply to ticket
  if (action === "reply") {
    const { ticket_id, message } = body
    if (!ticket_id || !message) return NextResponse.json({ error: "Ticket ID and message required" }, { status: 400 })

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    const isAdmin = profile?.role === "admin" || profile?.role === "super_admin"

    if (isAdmin) {
      // Admin writes bypass RLS via the service-role client.
      const admin = await createAdminClient()
      const { error: msgErr } = await admin.from("support_messages").insert({
        ticket_id, sender_id: user.id, sender_role: "admin", message
      })
      if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 })
      await admin.from("support_tickets").update({ status: "in_progress", updated_at: new Date().toISOString() }).eq("id", ticket_id)
      return NextResponse.json({ success: true })
    }

    // User reply is scoped by RLS to their own ticket.
    const { error: msgErr } = await supabase.from("support_messages").insert({
      ticket_id, sender_id: user.id, sender_role: "user", message
    })
    if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // Update ticket status (admin only)
  if (action === "update_status") {
    const { ticket_id, status } = body
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role !== "admin" && profile?.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const admin = await createAdminClient()
    const { error } = await admin.from("support_tickets").update({ status, updated_at: new Date().toISOString() }).eq("id", ticket_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
