"use client"

import useSWR from "swr"

export interface PriceData {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  change7d?: number
  volume: number
  marketCap: number
  high24h?: number
  low24h?: number
  sparkline?: number[]
  category: "crypto" | "forex" | "commodity" | "stock" | "cfd"
}

export interface PricesResponse {
  crypto: PriceData[]
  forex: PriceData[]
  commodities: PriceData[]
  stocks: PriceData[]
  cfd: PriceData[]
  timestamp: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useLivePrices(refreshInterval = 5000) {
  const { data, error, isLoading } = useSWR<PricesResponse>(
    "/api/prices",
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      dedupingInterval: 3000,
    }
  )

  return {
    data,
    crypto: data?.crypto ?? [],
    forex: data?.forex ?? [],
    commodities: data?.commodities ?? [],
    stocks: data?.stocks ?? [],
    cfd: data?.cfd ?? [],
    isLoading,
    isError: !!error,
  }
}

// Helper to format price based on value magnitude
export function formatPrice(price: number): string {
  if (price >= 10000) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (price >= 100) return price.toFixed(2)
  if (price >= 1) return price.toFixed(4)
  if (price >= 0.01) return price.toFixed(6)
  return price.toFixed(8)
}

// Format volume to human readable
export function formatVolume(vol: number): string {
  if (vol >= 1e12) return `${(vol / 1e12).toFixed(2)}T`
  if (vol >= 1e9) return `${(vol / 1e9).toFixed(2)}B`
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(2)}M`
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`
  return vol.toString()
}

// Format market cap
export function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(1)}M`
  return `$${cap.toLocaleString()}`
}
