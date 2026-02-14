import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { notifyAdmin } from "@/lib/notify-admin"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: true })

  // Detect if new signup (created within last 60 seconds) or login
  const createdAt = new Date(user.created_at).getTime()
  const now = Date.now()
  const isNewUser = (now - createdAt) < 60000

  if (isNewUser) {
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
  } else {
    notifyAdmin({
      subject: `User Logged In - ${user.email}`,
      event: "User Login",
      userEmail: user.email || "unknown",
      details: {
        Email: user.email || "unknown",
        Login_Time: new Date().toLocaleString(),
        IP: request.headers.get("x-forwarded-for") || "unknown",
      },
    }).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
