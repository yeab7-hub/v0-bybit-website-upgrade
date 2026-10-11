import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const requestedLimit = Number(request.nextUrl.searchParams.get("limit") || "50")
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(100, Math.max(1, Math.floor(requestedLimit)))
    : 50

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: "Could not load notifications" }, { status: 500 })

  const { count, error: countError } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false)

  if (countError) return NextResponse.json({ error: "Could not load unread notification count" }, { status: 500 })

  return NextResponse.json({ notifications: data || [], unread_count: count || 0 })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: { mark_all?: boolean; id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 })
  }

  let query = supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false)
  if (body.mark_all === true) {
    // The user can only mark their own notifications as read.
  } else if (typeof body.id === "string" && body.id.length > 0) {
    query = supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("id", body.id)
  } else {
    return NextResponse.json({ error: "Provide a notification id or mark_all: true" }, { status: 400 })
  }

  const { error } = await query
  if (error) return NextResponse.json({ error: "Could not update notification read status" }, { status: 500 })
  return NextResponse.json({ ok: true })
}
