import { NextRequest, NextResponse } from "next/server"

const BYBIT_KLINE = "https://api.bybit.com/v5/market/kline"
const BINANCE_KLINE = "https://api.binance.com/api/v3/klines"
const intervalMap: Record<string, { bybit: string; binance: string }> = {
  "1": { bybit: "1", binance: "1m" }, "1m": { bybit: "1", binance: "1m" }, "3": { bybit: "3", binance: "3m" }, "3m": { bybit: "3", binance: "3m" }, "5": { bybit: "5", binance: "5m" }, "5m": { bybit: "5", binance: "5m" },
  "15": { bybit: "15", binance: "15m" }, "15m": { bybit: "15", binance: "15m" }, "30": { bybit: "30", binance: "30m" }, "30m": { bybit: "30", binance: "30m" }, "1H": { bybit: "60", binance: "1h" },
  "2H": { bybit: "120", binance: "2h" }, "4H": { bybit: "240", binance: "4h" }, "6H": { bybit: "360", binance: "6h" },
  "12H": { bybit: "720", binance: "12h" }, "1D": { bybit: "D", binance: "1d" }, "3D": { bybit: "D", binance: "3d" },
  "1W": { bybit: "W", binance: "1w" }, "1M": { bybit: "M", binance: "1M" },
}

async function getJson(url: string) {
  try {
    const response = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) })
    return response.ok ? await response.json() : null
  } catch { return null }
}

function normalize(rows: unknown[][]) {
  return rows.map((k) => ({ time: Math.floor(Number(k[0]) / 1000), open: Number(k[1]), high: Number(k[2]), low: Number(k[3]), close: Number(k[4]), volume: Number(k[5]) })).filter((k) => [k.time, k.open, k.high, k.low, k.close].every(Number.isFinite)).sort((a, b) => a.time - b.time)
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const symbol = (params.get("symbol") || "BTCUSDT").replace("/", "").toUpperCase()
  const interval = params.get("interval") || "15m"
  const mapping = intervalMap[interval] || intervalMap["15m"]
  const limit = Math.max(1, Math.min(Number(params.get("limit") || 300), 1000))

  const bybit = await getJson(`${BYBIT_KLINE}&symbol=${encodeURIComponent(symbol)}&interval=${mapping.bybit}&limit=${limit}`)
  const bybitRows = bybit?.retCode === 0 ? bybit.result?.list : null
  if (Array.isArray(bybitRows) && bybitRows.length) {
    const candles = normalize(bybitRows.map((k: string[]) => [Number(k[0]), k[1], k[2], k[3], k[4], k[5]]))
    return NextResponse.json({ candles, symbol, interval, source: "bybit" }, { headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10" } })
  }

  const binance = await getJson(`${BINANCE_KLINE}?symbol=${encodeURIComponent(symbol)}&interval=${mapping.binance}&limit=${limit}`)
  if (Array.isArray(binance) && binance.length) {
    return NextResponse.json({ candles: normalize(binance), symbol, interval, source: "binance" }, { headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10" } })
  }
  return NextResponse.json({ error: "Live candle data unavailable", candles: [], symbol, interval }, { status: 502 })
}
