import { NextResponse } from "next/server"

/**
 * Returns real, current crypto/financial news headlines from CryptoCompare's
 * public news API (free, no key required for this endpoint). Each item
 * includes a link back to the original source -- this app only shows the
 * headline and a short excerpt, never the full article, and always credits
 * and links to the original publisher.
 */
export async function GET() {
  try {
    const res = await fetch(
      "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest",
      { next: { revalidate: 300 } }, // cache 5 minutes -- this is a shared feed, not per-user
    )

    if (!res.ok) {
      return NextResponse.json({ articles: [], error: "News source unavailable" }, { status: 502 })
    }

    const data = await res.json()
    const raw: any[] = Array.isArray(data?.Data) ? data.Data : []

    const articles = raw.slice(0, 12).map((item) => ({
      title: item.title,
      excerpt: (item.body || "").slice(0, 160).trim() + (item.body?.length > 160 ? "…" : ""),
      url: item.url,
      source: item.source_info?.name || item.source || "Unknown source",
      publishedAt: item.published_on ? new Date(item.published_on * 1000).toISOString() : null,
      imageUrl: item.imageurl || null,
      category: (item.categories || "").split("|")[0] || "News",
    }))

    return NextResponse.json({ articles })
  } catch {
    return NextResponse.json({ articles: [], error: "Failed to fetch news" }, { status: 500 })
  }
}
