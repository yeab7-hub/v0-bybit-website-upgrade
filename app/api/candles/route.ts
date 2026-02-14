import { NextRequest, NextResponse } from "next/server"

const BINANCE_API = "https://api.binance.com/api/v3/klines"

const intervalMap: Record<string, string> = {
  "1m": "1m", "3m": "3m", "5m": "5m", "15m": "15m", "30m": "30m",
  "1H": "1h", "2H": "2h", "4H": "4h", "6H": "6h", "12H": "12h",
  "1D": "1d", "3D": "3d", "1W": "1w", "1M": "1M",
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const symbol = (searchParams.get("symbol") || "BTCUSDT").toUpperCase()
  const interval = searchParams.get("interval") || "15m"
  const limit = Math.min(Number(searchParams.get("limit") || "500"), 1000)

  const binanceInterval = intervalMap[interval] || interval.toLowerCase()

  try {
    const res = await fetch(
      `${BINANCE_API}?symbol=${symbol}&interval=${binanceInterval}&limit=${limit}`,
      { next: { revalidate: 5 } }
    )

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch from Binance" }, { status: 502 })
    }

    const data = await res.json()

    // Binance kline format: [openTime, open, high, low, close, volume, closeTime, ...]
    const candles = data.map((k: (string | number)[]) => ({
      time: Math.floor(Number(k[0]) / 1000), // Unix timestamp in seconds
      open: Number(k[1]),
      high: Number(k[2]),
      low: Number(k[3]),
      close: Number(k[4]),
      volume: Number(k[5]),
    }))

    return NextResponse.json({ candles, symbol, interval })
  } catch {
    return NextResponse.json({ error: "Failed to fetch candle data" }, { status: 500 })
  }
}
