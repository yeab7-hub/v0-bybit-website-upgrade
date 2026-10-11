import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: tickets, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(tickets || [])
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: { subject?: unknown; category?: unknown; message?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 })
  }
  const { subject, category, message } = body

  if (
    typeof subject !== "string" || !subject.trim() || subject.trim().length > 160 ||
    typeof category !== "string" || !category.trim() || category.trim().length > 80 ||
    typeof message !== "string" || !message.trim() || message.trim().length > 10000
  ) {
    return NextResponse.json({ error: "Provide a subject (1–160 characters), category, and message (1–10000 characters)." }, { status: 400 })
  }

  // Create ticket
  const { data: ticket, error: ticketError } = await supabase
    .from("support_tickets")
    .insert({
      user_id: user.id,
      subject: subject.trim(),
      category: category.trim(),
      status: "open",
      priority: "medium",
    })
    .select()
    .single()

  if (ticketError) return NextResponse.json({ error: ticketError.message }, { status: 500 })

  // Insert first message
  const { error: msgError } = await supabase
    .from("support_messages")
    .insert({
      ticket_id: ticket.id,
      sender_id: user.id,
      sender_role: "user",
      message: message.trim(),
    })

  if (msgError) {
    // Avoid leaving a ticket with no initial message if the second insert fails.
    await supabase.from("support_tickets").delete().eq("id", ticket.id).eq("user_id", user.id)
    return NextResponse.json({ error: "The ticket could not be completed. Please try again." }, { status: 500 })
  }
  return NextResponse.json(ticket, { status: 201 })
}
