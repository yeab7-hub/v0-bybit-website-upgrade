"use client"

import Image from "next/image"
import { useState } from "react"

/**
 * Universal MarketAsset component.
 * Detects the asset type (crypto, forex, stock, commodity) and shows
 * the correct logo/icon with appropriate styling.
 */

interface MarketAssetProps {
  symbol: string
  name?: string
  size?: number
  className?: string
}

// Map forex pairs to their country codes for flag rendering
const FOREX_FLAGS: Record<string, { base: string; quote: string }> = {
  "EUR/USD": { base: "EU", quote: "US" },
  "GBP/USD": { base: "GB", quote: "US" },
  "USD/JPY": { base: "US", quote: "JP" },
  "AUD/USD": { base: "AU", quote: "US" },
  "USD/CHF": { base: "US", quote: "CH" },
  "USD/CAD": { base: "US", quote: "CA" },
  "NZD/USD": { base: "NZ", quote: "US" },
  "EUR/GBP": { base: "EU", quote: "GB" },
  "EUR/JPY": { base: "EU", quote: "JP" },
}

// Map stock tickers to clearbit logo domains
const STOCK_LOGOS: Record<string, string> = {
  AAPL: "apple.com",
  MSFT: "microsoft.com",
  GOOGL: "google.com",
  AMZN: "amazon.com",
  TSLA: "tesla.com",
  NVDA: "nvidia.com",
  META: "meta.com",
}

// Commodity colors and labels
const COMMODITY_MAP: Record<string, { label: string; color: string; bg: string }> = {
  "XAU/USD": { label: "Au", color: "text-[#FFD700]", bg: "bg-[#FFD700]/15" },
  "XAG/USD": { label: "Ag", color: "text-[#C0C0C0]", bg: "bg-[#C0C0C0]/15" },
  WTI: { label: "Oil", color: "text-[#4A2511]", bg: "bg-amber-900/15" },
  BRENT: { label: "Brt", color: "text-[#8B4513]", bg: "bg-amber-800/15" },
  NG: { label: "Gas", color: "text-sky-400", bg: "bg-sky-400/15" },
  HG: { label: "Cu", color: "text-orange-400", bg: "bg-orange-400/15" },
}

// CFD / Index mappings
const CFD_MAP: Record<string, { label: string; color: string; bg: string }> = {
  US30: { label: "30", color: "text-blue-400", bg: "bg-blue-400/15" },
  US500: { label: "500", color: "text-green-400", bg: "bg-green-400/15" },
  US100: { label: "100", color: "text-purple-400", bg: "bg-purple-400/15" },
  UK100: { label: "UK", color: "text-red-400", bg: "bg-red-400/15" },
  DE40: { label: "DE", color: "text-yellow-400", bg: "bg-yellow-400/15" },
  JP225: { label: "JP", color: "text-rose-400", bg: "bg-rose-400/15" },
  HK50: { label: "HK", color: "text-orange-400", bg: "bg-orange-400/15" },
  VIX: { label: "VIX", color: "text-red-500", bg: "bg-red-500/15" },
}

// Crypto colors for the letter avatar fallback
const CRYPTO_COLORS: Record<string, { color: string; bg: string }> = {
  BTC: { color: "text-[#F7931A]", bg: "bg-[#F7931A]/15" },
  ETH: { color: "text-[#627EEA]", bg: "bg-[#627EEA]/15" },
  SOL: { color: "text-[#9945FF]", bg: "bg-[#9945FF]/15" },
  BNB: { color: "text-[#F3BA2F]", bg: "bg-[#F3BA2F]/15" },
  XRP: { color: "text-[#00AAE4]", bg: "bg-[#00AAE4]/15" },
  ADA: { color: "text-[#0033AD]", bg: "bg-[#0033AD]/15" },
  DOGE: { color: "text-[#C3A634]", bg: "bg-[#C3A634]/15" },
  AVAX: { color: "text-[#E84142]", bg: "bg-[#E84142]/15" },
  DOT: { color: "text-[#E6007A]", bg: "bg-[#E6007A]/15" },
  LINK: { color: "text-[#2A5ADA]", bg: "bg-[#2A5ADA]/15" },
}

type AssetTypeExt = "crypto" | "forex" | "commodity" | "stock" | "cfd"

function detectAssetType(symbol: string): AssetTypeExt {
  if (FOREX_FLAGS[symbol]) return "forex"
  if (COMMODITY_MAP[symbol]) return "commodity"
  if (STOCK_LOGOS[symbol]) return "stock"
  if (CFD_MAP[symbol]) return "cfd"
  return "crypto"
}

// Simple flag component using country-code emoji
function FlagIcon({ code, size }: { code: string; size: number }) {
  // Convert country code to regional indicator emoji
  const flag = code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("")

  return (
    <span
      style={{ fontSize: size * 0.6, lineHeight: 1 }}
      role="img"
      aria-label={`${code} flag`}
    >
      {flag}
    </span>
  )
}

export function MarketAsset({ symbol, size = 32, className = "" }: MarketAssetProps) {
  const type = detectAssetType(symbol)
  const dim = `${size}px`

  if (type === "forex") {
    const flags = FOREX_FLAGS[symbol]
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-secondary ${className}`}
        style={{ width: dim, height: dim }}
      >
        <div className="flex -space-x-1">
          <FlagIcon code={flags.base} size={size} />
          <FlagIcon code={flags.quote} size={size} />
        </div>
      </div>
    )
  }

  if (type === "stock") {
    return <StockLogo symbol={symbol} size={size} className={className} />
  }

  if (type === "commodity") {
    const info = COMMODITY_MAP[symbol]
    return (
      <div
        className={`flex items-center justify-center rounded-full ${info.bg} ${className}`}
        style={{ width: dim, height: dim }}
      >
        <span
          className={`font-bold ${info.color}`}
          style={{ fontSize: size * 0.38 }}
        >
          {info.label}
        </span>
      </div>
    )
  }

  if (type === "cfd") {
    const info = CFD_MAP[symbol] || { label: symbol.slice(0, 2), color: "text-primary", bg: "bg-primary/15" }
    return (
      <div
        className={`flex items-center justify-center rounded-full ${info.bg} ${className}`}
        style={{ width: dim, height: dim }}
      >
        <span
          className={`font-bold ${info.color}`}
          style={{ fontSize: size * 0.32 }}
        >
          {info.label}
        </span>
      </div>
    )
  }

  // Crypto: try GitHub-hosted icons, fallback to letter avatar
  return <CryptoLogo symbol={symbol} size={size} className={className} />
}

function StockLogo({ symbol, size, className }: { symbol: string; size: number; className: string }) {
  const [err, setErr] = useState(false)
  const domain = STOCK_LOGOS[symbol]
  const dim = `${size}px`

  if (err || !domain) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-primary/15 ${className}`}
        style={{ width: dim, height: dim }}
      >
        <span className="font-bold text-primary" style={{ fontSize: size * 0.35 }}>
          {symbol.slice(0, 2)}
        </span>
      </div>
    )
  }

  return (
    <div
      className={`overflow-hidden rounded-full bg-secondary ${className}`}
      style={{ width: dim, height: dim }}
    >
      <Image
        src={`https://logo.clearbit.com/${domain}`}
        alt={symbol}
        width={size}
        height={size}
        className="h-full w-full object-cover"
        onError={() => setErr(true)}
        unoptimized
      />
    </div>
  )
}

function CryptoLogo({ symbol, size, className }: { symbol: string; size: number; className: string }) {
  const [err, setErr] = useState(false)
  const dim = `${size}px`
  const colors = CRYPTO_COLORS[symbol] || { color: "text-primary", bg: "bg-primary/15" }

  // Map symbol to CoinGecko coin IDs for their CDN
  const COIN_IDS: Record<string, string> = {
    BTC: "bitcoin", ETH: "ethereum", SOL: "solana", XRP: "ripple",
    BNB: "binancecoin", ADA: "cardano", DOGE: "dogecoin", AVAX: "avalanche-2",
    DOT: "polkadot", LINK: "chainlink", UNI: "uniswap", MATIC: "matic-network",
    TRX: "tron", TON: "the-open-network", SHIB: "shiba-inu", LTC: "litecoin",
    NEAR: "near", APT: "aptos", SUI: "sui", ARB: "arbitrum",
    OP: "optimism", FIL: "filecoin", ATOM: "cosmos", AAVE: "aave",
    PEPE: "pepe", MNT: "mantle", USDT: "tether", USDC: "usd-coin",
  }

  const coinId = COIN_IDS[symbol]

  // Use GitHub-hosted cryptocurrency-icons as primary (very reliable)
  // Fallback: CoinGecko API thumbnail
  const githubUrl = `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${symbol.toLowerCase()}.png`
  const cgApiUrl = coinId ? `https://assets.coingecko.com/coins/images/1/small/bitcoin.png` : null

  if (err) {
    return (
      <div
        className={`flex items-center justify-center rounded-full ${colors.bg} ${className}`}
        style={{ width: dim, height: dim }}
      >
        <span className={`font-bold ${colors.color}`} style={{ fontSize: size * 0.4 }}>
          {symbol.charAt(0)}
        </span>
      </div>
    )
  }

  return (
    <div
      className={`overflow-hidden rounded-full bg-secondary ${className}`}
      style={{ width: dim, height: dim }}
    >
      <Image
        src={githubUrl}
        alt={symbol}
        width={size}
        height={size}
        className="h-full w-full object-cover"
        onError={() => setErr(true)}
        unoptimized
      />
    </div>
  )
}

// Utility: get the display pair string with proper formatting
export function formatPairDisplay(symbol: string): string {
  if (symbol.includes("/")) return symbol
  if (symbol.endsWith("USDT")) return symbol.replace("USDT", "/USDT")
  return symbol
}

// Utility: get decimal precision by asset type
export function getPricePrecision(symbol: string): number {
  if (FOREX_FLAGS[symbol]) return 5
  if (STOCK_LOGOS[symbol]) return 2
  if (COMMODITY_MAP[symbol]) return 2
  // Crypto: depends on price magnitude
  return 2
}

export function formatAssetPrice(price: number, symbol: string): string {
  const type = detectAssetType(symbol)
  if (type === "forex") return price.toFixed(5)
  if (type === "stock") return `$${price.toFixed(2)}`
  if (type === "commodity") return `$${price.toFixed(2)}`
  if (type === "cfd") return price >= 100 ? `$${price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : `$${price.toFixed(2)}`
  // Crypto
  if (price >= 10000) return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (price >= 1) return `$${price.toFixed(4)}`
  if (price >= 0.01) return `$${price.toFixed(6)}`
  return `$${price.toFixed(8)}`
}
