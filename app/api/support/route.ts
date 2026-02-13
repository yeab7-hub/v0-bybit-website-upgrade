import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

// GET user's tickets (or admin gets all)
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const ticketId = request.nextUrl.searchParams.get("ticket_id")
  const isAdmin = request.nextUrl.searchParams.get("admin") === "true"

  // Single ticket with messages
  if (ticketId) {
    const { data: ticket } = await supabase.from("support_tickets").select("*").eq("id", ticketId).single()
    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 })

    const { data: messages } = await supabase.from("support_messages").select("*").eq("ticket_id", ticketId).order("created_at", { ascending: true })
    return NextResponse.json({ ticket, messages: messages ?? [] })
  }

  // Admin: all tickets
  if (isAdmin) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { data: tickets } = await supabase.from("support_tickets").select("*, profiles(display_name, email)").order("created_at", { ascending: false })
    return NextResponse.json({ tickets: tickets ?? [] })
  }

  // User: own tickets
  const { data: tickets } = await supabase.from("support_tickets").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
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

    // Add first message
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

    // Check if admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    const isAdmin = profile?.role === "admin"
    const senderRole = isAdmin ? "admin" : "user"

    const { error: msgErr } = await supabase.from("support_messages").insert({
      ticket_id, sender_id: user.id, sender_role: senderRole, message
    })

    if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 })

    // If admin reply, update ticket status
    if (isAdmin) {
      await supabase.from("support_tickets").update({ status: "in_progress", updated_at: new Date().toISOString() }).eq("id", ticket_id)
    }

    return NextResponse.json({ success: true })
  }

  // Update ticket status (admin only)
  if (action === "update_status") {
    const { ticket_id, status } = body
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    await supabase.from("support_tickets").update({ status, updated_at: new Date().toISOString() }).eq("id", ticket_id)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
