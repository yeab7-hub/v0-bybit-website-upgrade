import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

/**
 * GET /api/admin/kyc - Fetch KYC records (uses admin client for cross-user access)
 * POST /api/admin/kyc - Approve/Reject KYC (uses admin client to bypass RLS)
 */

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Check if user is admin
  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin" && profile?.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const filter = request.nextUrl.searchParams.get("filter") ?? "pending"

  // 1. Fetch actual KYC document submissions
  let query = adminSupabase
    .from("kyc_documents")
    .select("*, profiles(email, full_name)")
    .order("created_at", { ascending: false })

  if (filter !== "all") {
    query = query.eq("status", filter)
  }

  const { data: docRecords, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const records = [...(docRecords ?? [])]

  // 2. For "pending" or "all" filter, also include profiles with kyc_status = 'pending'
  //    that have NO matching kyc_documents row (user is pending but hasn't uploaded docs)
  if (filter === "pending" || filter === "all") {
    const { data: pendingProfiles } = await adminSupabase
      .from("profiles")
      .select("id, email, full_name, kyc_status, created_at")
      .eq("kyc_status", "pending")
      .order("created_at", { ascending: false })

    if (pendingProfiles) {
      const docUserIds = new Set((docRecords ?? []).map((r: { user_id: string }) => r.user_id))
      for (const p of pendingProfiles) {
        if (!docUserIds.has(p.id)) {
          // Create a synthetic record for display
          records.push({
            id: `profile-${p.id}`,
            user_id: p.id,
            document_type: "not_submitted",
            document_data: {},
            status: "pending",
            created_at: p.created_at,
            reviewed_at: null,
            profiles: { email: p.email, full_name: p.full_name },
          })
        }
      }
    }
  }

  return NextResponse.json({ records })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Check if user is admin
  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin" && profile?.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const { record_id, user_id, action } = body

  if (!record_id || !user_id || !action) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  if (action !== "approved" && action !== "rejected") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  // Update KYC document status using admin client (bypasses RLS)
  const { error: docError } = await adminSupabase
    .from("kyc_documents")
    .update({
      status: action,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq("id", record_id)

  if (docError) {
    return NextResponse.json({ error: docError.message }, { status: 500 })
  }

  // Update user profile KYC status using admin client (bypasses RLS)
  const { error: profileError } = await adminSupabase
    .from("profiles")
    .update({
      kyc_status: action,
      kyc_level: action === "approved" ? 2 : 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user_id)

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: `KYC ${action} successfully`,
  })
}
