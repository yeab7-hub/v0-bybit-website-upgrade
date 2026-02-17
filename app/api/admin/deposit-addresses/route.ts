import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin" && profile?.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { data, error } = await supabase
    .from("deposit_addresses")
    .select("*")
    .order("symbol")
    .order("network")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ addresses: data ?? [] })
}
