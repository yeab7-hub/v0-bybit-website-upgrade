"use client"

import { BarChart3 } from "lucide-react"
import Link from "next/link"

export default function TradeError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <BarChart3 className="h-12 w-12 text-muted-foreground/40" />
      <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">The trading page encountered an error. Please try again.</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
