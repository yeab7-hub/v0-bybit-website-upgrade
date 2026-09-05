import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
export { POST, PUT } from "@/app/api/deposit-addresses/route"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin" && profile?.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // Service-role read so admins and super_admins see every row, including
  // disabled ones, regardless of the row-level security policy.
  const adminSupabase = await createAdminClient()
  const { data, error } = await adminSupabase
    .from("deposit_addresses")
    .select("*")
    .order("symbol")
    .order("network")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ addresses: data ?? [] })
}
