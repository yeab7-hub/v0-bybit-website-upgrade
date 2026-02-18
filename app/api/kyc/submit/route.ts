import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const adminSupabase = await createAdminClient()
  const body = await request.json()
  const { document_type, document_data } = body

  if (!document_type || !document_data) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Check if user already has a pending KYC submission
  const { data: existing } = await adminSupabase
    .from("kyc_documents")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .limit(1)

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: "You already have a pending KYC submission" }, { status: 400 })
  }

  // Insert KYC document using admin client to bypass RLS
  const { data: doc, error: docError } = await adminSupabase
    .from("kyc_documents")
    .insert({
      user_id: user.id,
      document_type,
      document_data,
      status: "pending",
    })
    .select()
    .single()

  if (docError) {
    return NextResponse.json({ error: docError.message }, { status: 500 })
  }

  // Update profile KYC status using admin client
  const { error: profileError } = await adminSupabase
    .from("profiles")
    .update({
      kyc_status: "pending",
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, document: doc })
}
