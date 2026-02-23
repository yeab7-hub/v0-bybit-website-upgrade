"use client"

import { BarChart3 } from "lucide-react"
import Link from "next/link"

export default function ChartError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <BarChart3 className="h-12 w-12 text-muted-foreground/40" />
      <h2 className="text-lg font-semibold text-foreground">Chart could not load</h2>
      <p className="text-sm text-muted-foreground">Something went wrong loading the chart. Please try again.</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Try Again
        </button>
        <Link
          href="/trade"
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground"
        >
          Back to Trade
        </Link>
      </div>
    </div>
  )
}
