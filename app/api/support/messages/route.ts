import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const ticketId = searchParams.get("ticket_id")
  if (!ticketId) return NextResponse.json({ error: "Missing ticket_id" }, { status: 400 })

  const { data: messages, error } = await supabase
    .from("support_messages")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(messages || [])
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { ticket_id, message } = body

  if (!ticket_id || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const { data: msg, error } = await supabase
    .from("support_messages")
    .insert({
      ticket_id,
      sender_id: user.id,
      sender_role: "user",
      message,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update ticket timestamp
  await supabase
    .from("support_tickets")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", ticket_id)

  return NextResponse.json(msg)
}
