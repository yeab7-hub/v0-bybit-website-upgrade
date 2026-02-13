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

  const body = await request.json()
  const { subject, category, message } = body

  if (!subject || !category || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Create ticket
  const { data: ticket, error: ticketError } = await supabase
    .from("support_tickets")
    .insert({
      user_id: user.id,
      subject,
      category,
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
      message,
    })

  if (msgError) return NextResponse.json({ error: msgError.message }, { status: 500 })
  return NextResponse.json(ticket)
}
