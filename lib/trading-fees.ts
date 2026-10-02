// Real, volume-based fee tiers. A user's 30-day trailing trading volume
// determines their tier, exactly like the Fee Schedule page shows them --
// this is the single source of truth both the UI and the actual trade
// execution routes read from, so what's displayed always matches what's
// actually charged.

export interface FeeTier {
  name: string
  minVolume: number // inclusive lower bound of 30d trading volume, in USD
  maker: number      // as a fraction, e.g. 0.001 = 0.10%
  taker: number
}

export const FEE_TIERS: FeeTier[] = [
  { name: "Regular", minVolume: 0, maker: 0.0010, taker: 0.0010 },
  { name: "VIP 1", minVolume: 100_000, maker: 0.0006, taker: 0.0008 },
  { name: "VIP 2", minVolume: 500_000, maker: 0.0004, taker: 0.0006 },
  { name: "VIP 3", minVolume: 1_000_000, maker: 0.0002, taker: 0.0005 },
]

/** Returns the tier a given 30-day trading volume qualifies for. */
export function getFeeTier(volume30d: number): FeeTier {
  let tier = FEE_TIERS[0]
  for (const t of FEE_TIERS) {
    if (volume30d >= t.minVolume) tier = t
  }
  return tier
}

/** The next tier up, or null if already at the top tier. */
export function getNextTier(volume30d: number): FeeTier | null {
  const current = getFeeTier(volume30d)
  const idx = FEE_TIERS.findIndex((t) => t.name === current.name)
  return FEE_TIERS[idx + 1] ?? null
}

/**
 * Computes a user's real trailing 30-day trading volume from their actual
 * trade history (sum of executed notional value). This is what determines
 * their fee tier -- not a stored/cached number, so it's always current.
 */
export async function getUserVolume30d(adminSupabase: any, userId: string): Promise<number> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await adminSupabase
    .from("trades")
    .select("total")
    .eq("user_id", userId)
    .gte("created_at", thirtyDaysAgo)

  return (data ?? []).reduce((sum: number, t: any) => sum + (Number(t.total) || 0), 0)
}

/** Convenience: looks up a user's real volume and returns their taker fee rate directly. */
export async function getUserTakerFeeRate(adminSupabase: any, userId: string): Promise<number> {
  const volume = await getUserVolume30d(adminSupabase, userId)
  return getFeeTier(volume).taker
}
