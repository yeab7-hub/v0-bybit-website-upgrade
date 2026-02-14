import { NextRequest, NextResponse } from "next/server"

const BINANCE_API = "https://api.binance.com/api/v3/klines"
const BINANCE_US_API = "https://api.binance.us/api/v3/klines"

const intervalMap: Record<string, string> = {
  "1m": "1m", "3m": "3m", "5m": "5m", "15m": "15m", "30m": "30m",
  "1H": "1h", "2H": "2h", "4H": "4h", "6H": "6h", "12H": "12h",
  "1D": "1d", "3D": "3d", "1W": "1w", "1M": "1M",
}

async function fetchFromBinance(url: string): Promise<Response | null> {
  try {
    const res = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(8000),
    })
    if (res.ok) return res
  } catch {
    // silently fail
  }
  return null
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const symbol = (searchParams.get("symbol") || "BTCUSDT").toUpperCase()
  const interval = searchParams.get("interval") || "15m"
  const limit = Math.min(Number(searchParams.get("limit") || "300"), 1000)

  const binanceInterval = intervalMap[interval] || interval.toLowerCase()
  const queryString = `symbol=${symbol}&interval=${binanceInterval}&limit=${limit}`

  try {
    // Try main Binance first, then Binance US as fallback
    let res = await fetchFromBinance(`${BINANCE_API}?${queryString}`)
    if (!res) {
      res = await fetchFromBinance(`${BINANCE_US_API}?${queryString}`)
    }

    if (!res) {
      return NextResponse.json({ error: "Failed to fetch from Binance", candles: [] }, { status: 502 })
    }

    const data = await res.json()

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: "Invalid data from Binance", candles: [] }, { status: 502 })
    }

    const candles = data.map((k: (string | number)[]) => ({
      time: Math.floor(Number(k[0]) / 1000),
      open: Number(k[1]),
      high: Number(k[2]),
      low: Number(k[3]),
      close: Number(k[4]),
      volume: Number(k[5]),
    }))

    return NextResponse.json(
      { candles, symbol, interval },
      { headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10" } }
    )
  } catch {
    return NextResponse.json({ error: "Failed to fetch candle data", candles: [] }, { status: 500 })
  }
}
