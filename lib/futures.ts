// Shared math for leveraged Futures positions. Kept in one place so the
// open, close, and monitor routes can never drift out of sync with each
// other on how margin, liquidation, and funding are calculated.

/** Maintenance margin requirement, as a fraction of notional value. */
export const MAINTENANCE_MARGIN_RATE = 0.005 // 0.5%

/** Funding fee charged per 8-hour funding interval, as a fraction of notional. */
export const FUNDING_RATE_PER_INTERVAL = 0.0001 // 0.01% per 8h
export const FUNDING_INTERVAL_MS = 8 * 60 * 60 * 1000 // 8 hours

/**
 * The margin required to open a leveraged position of the given notional
 * value. This is the amount actually deducted from the user's quote-asset
 * balance -- NOT the full notional, unlike a Spot trade.
 */
export function calcMargin(notional: number, leverage: number): number {
  if (leverage <= 0) return notional
  return notional / leverage
}

/**
 * The price at which a leveraged position gets force-closed because losses
 * have eaten through the margin down to the maintenance requirement.
 *
 * LONG:  liquidates when price falls
 * SHORT: liquidates when price rises
 */
export function calcLiquidationPrice(
  entryPrice: number,
  leverage: number,
  isShort: boolean
): number {
  if (leverage <= 0) return isShort ? Infinity : 0
  const maxLossFraction = 1 / leverage - MAINTENANCE_MARGIN_RATE
  return isShort
    ? entryPrice * (1 + Math.max(maxLossFraction, 0))
    : entryPrice * (1 - Math.max(maxLossFraction, 0))
}

/**
 * How many whole funding intervals have elapsed since the position last had
 * funding charged (or since it opened, if never charged). Used to lazily
 * settle funding fees when a position is fetched or closed, since this
 * project has no background cron job to charge it on a fixed schedule.
 */
export function elapsedFundingIntervals(lastFundingAt: string | null, openedAt: string): number {
  const since = lastFundingAt ? new Date(lastFundingAt).getTime() : new Date(openedAt).getTime()
  const elapsedMs = Date.now() - since
  return Math.max(0, Math.floor(elapsedMs / FUNDING_INTERVAL_MS))
}

/** Funding fee owed for N elapsed intervals on a given notional value. */
export function calcFundingFee(notional: number, intervals: number): number {
  return notional * FUNDING_RATE_PER_INTERVAL * intervals
}
