import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Verify admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin" && profile?.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // Get all tickets with user email
  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("*, profiles(email, full_name)")
    .order("updated_at", { ascending: false })

  const enriched = (tickets ?? []).map((t: Record<string, unknown>) => ({
    ...t,
    user_email: (t.profiles as Record<string, unknown>)?.email || "unknown",
    user_name: (t.profiles as Record<string, unknown>)?.full_name || "",
  }))

  return NextResponse.json({ tickets: enriched })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin" && profile?.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await request.json()
  const { action, ticket_id, message, status } = body

  if (action === "reply" && ticket_id && message) {
    await supabase.from("support_messages").insert({
      ticket_id,
      sender_id: user.id,
      sender_role: "admin",
      message,
    })
    // Also update ticket status to in_progress
    await supabase.from("support_tickets").update({
      status: "in_progress",
      updated_at: new Date().toISOString(),
    }).eq("id", ticket_id)

    return NextResponse.json({ success: true })
  }

  if (action === "update_status" && ticket_id && status) {
    await supabase.from("support_tickets").update({
      status,
      updated_at: new Date().toISOString(),
    }).eq("id", ticket_id)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
