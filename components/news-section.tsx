"use client"

import useSWR from "swr"
import { ArrowUpRight, Newspaper } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function timeAgo(iso: string | null): string {
  if (!iso) return ""
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

interface NewsArticle {
  title: string
  excerpt: string
  url: string
  source: string
  publishedAt: string | null
  category: string
}

/** Real, live crypto/financial news -- refreshes automatically every 5 minutes. */
export function NewsSection() {
  const { data, isLoading } = useSWR<{ articles: NewsArticle[] }>("/api/news", fetcher, {
    refreshInterval: 5 * 60 * 1000,
  })
  const articles = data?.articles ?? []

  if (!isLoading && articles.length === 0) return null

  return (
    <div className="mt-5 rounded-xl bg-card p-4">
      <div className="mb-3 flex items-center gap-1.5">
        <Newspaper className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] font-medium uppercase tracking-wider text-primary">Market News</span>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-secondary/50" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {articles.slice(0, 5).map((a, i) => (
            <a
              key={i}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:opacity-80"
            >
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">{a.title}</p>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="font-medium">{a.source}</span>
                  <span>•</span>
                  <span>{timeAgo(a.publishedAt)}</span>
                </div>
              </div>
              <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
