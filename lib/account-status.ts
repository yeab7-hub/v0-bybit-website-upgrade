import { SupabaseClient } from "@supabase/supabase-js"

/**
 * Checks a user's account status before allowing a financial action
 * (trading, converting, depositing, withdrawing).
 *
 * - Banned accounts are blocked from everything (enforced separately at
 *   the middleware level for page access, and here for API calls).
 * - Frozen accounts can still log in and view their account, but cannot
 *   place trades, convert assets, or move funds.
 */
export async function checkAccountStatus(
  supabase: SupabaseClient,
  userId: string
): Promise<{ blocked: false } | { blocked: true; reason: string }> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_banned, is_frozen")
    .eq("id", userId)
    .single()

  if (profile?.is_banned) {
    return { blocked: true, reason: "Your account has been suspended. Please contact support." }
  }
  if (profile?.is_frozen) {
    return { blocked: true, reason: "Your account is temporarily frozen. Please contact support for assistance." }
  }
  return { blocked: false }
}
