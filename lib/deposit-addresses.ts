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

export const DEPOSIT_ADDRESSES: CoinDepositConfig[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    networks: [{ network: "Bitcoin", address: "167LPdGeuot8RbFDjvyzUPaNLkaad23UcN" }],
    minDeposit: 0.0001,
    confirmations: 2,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    networks: [{ network: "ERC20", address: "0xd2aca02c90d3cd259b5e79f7ed000388a903f7aa" }],
    minDeposit: 0.001,
    confirmations: 12,
  },
  {
    symbol: "USDT",
    name: "Tether",
    networks: [
      { network: "TRC20", address: "TNhptVGH9BBDWQf37PMiqGX6zopKLySfEN" },
      { network: "ERC20", address: "0xd2aca02c90d3cd259b5e79f7ed000388a903f7aa" },
    ],
    minDeposit: 1,
    confirmations: 20,
  },
  {
    symbol: "SOL",
    name: "Solana",
    networks: [{ network: "Solana", address: "46Ciw3Gzc1EcsV7mM3ut6LeBgfZMj6uGj4WFumgoiTGb" }],
    minDeposit: 0.01,
    confirmations: 32,
  },
  {
    symbol: "XRP",
    name: "XRP",
    networks: [{ network: "XRP", address: "167LPdGeuot8RbFDjvyzUPaNLkaad23UcN", memo: "Required" }],
    minDeposit: 1,
    confirmations: 1,
  },
  {
    symbol: "ADA",
    name: "Cardano",
    networks: [{ network: "Cardano", address: "167LPdGeuot8RbFDjvyzUPaNLkaad23UcN" }],
    minDeposit: 1,
    confirmations: 15,
  },
  {
    symbol: "BNB",
    name: "BNB",
    networks: [{ network: "BEP20", address: "0xd2aca02c90d3cd259b5e79f7ed000388a903f7aa" }],
    minDeposit: 0.01,
    confirmations: 15,
  },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    networks: [{ network: "Dogecoin", address: "167LPdGeuot8RbFDjvyzUPaNLkaad23UcN" }],
    minDeposit: 10,
    confirmations: 6,
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    networks: [{ network: "C-Chain", address: "0xd2aca02c90d3cd259b5e79f7ed000388a903f7aa" }],
    minDeposit: 0.1,
    confirmations: 12,
  },
]

export function getDepositConfig(symbol: string): CoinDepositConfig | undefined {
  return DEPOSIT_ADDRESSES.find((c) => c.symbol === symbol)
}
