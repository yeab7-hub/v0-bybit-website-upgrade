import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { notifyAdmin } from "@/lib/notify-admin"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: true })

  notifyAdmin({
    subject: `New User Registered - ${user.email}`,
    event: "New Registration",
    userEmail: user.email || "unknown",
    details: {
      User_ID: user.id.slice(0, 8) + "...",
      Email: user.email || "unknown",
      Registered: new Date().toLocaleString(),
    },
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
