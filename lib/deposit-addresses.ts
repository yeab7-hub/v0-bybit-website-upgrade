export interface NetworkAddress {
  network: string
  address: string
  memo?: string
}

export interface CoinDepositConfig {
  symbol: string
  name: string
  networks: NetworkAddress[]
  minDeposit: number
  confirmations: number
}

// Deposit destinations must come from the configured database.
// Never display sample addresses as real wallet destinations.
export const DEPOSIT_ADDRESSES: CoinDepositConfig[] = []

export function getDepositConfig(symbol: string): CoinDepositConfig | undefined {
  return DEPOSIT_ADDRESSES.find((c) => c.symbol === symbol)
}
