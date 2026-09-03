// Central trading fee configuration.
//
// Fee applied to the notional value of each executed order leg (both the
// opening trade and the closing trade). Kept in one place so the rate can be
// tuned without hunting through every trade route.
//
// Currently set to a nominal 0.01% so fees do not meaningfully drain position
// PnL during testing and regular trading. Set to 0 for zero-fee trading.
export const TRADING_FEE_RATE = 0.0001 // 0.01%

/** Returns the fee charged on a given notional total. */
export function calcFee(total: number): number {
  return total * TRADING_FEE_RATE
}
