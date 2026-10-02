import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { FEE_TIERS, getFeeTier, getNextTier, getUserVolume30d } from "@/lib/trading-fees"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const adminSupabase = await createAdminClient()
  const volume30d = await getUserVolume30d(adminSupabase, user.id)
  const currentTier = getFeeTier(volume30d)
  const nextTier = getNextTier(volume30d)

  return NextResponse.json({
    tiers: FEE_TIERS,
    volume30d,
    currentTier: currentTier.name,
    nextTier: nextTier ? { name: nextTier.name, volumeNeeded: Math.max(0, nextTier.minVolume - volume30d) } : null,
  })
}
