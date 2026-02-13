"use client"

import { useEffect, useRef } from "react"

const partners = [
  "Fireblocks", "Chainalysis", "Circle", "Wintermute", "Jump Trading",
  "Galaxy Digital", "Paradigm", "a16z Crypto", "Sequoia Capital", "Pantera",
]

export function PartnersSection() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let frame: number
    let pos = 0
    const speed = 0.5
    const animate = () => {
      pos += speed
      if (pos >= el.scrollWidth / 2) pos = 0
      el.scrollLeft = pos
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <section className="border-t border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <p className="mb-8 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Trusted by leading institutions worldwide
        </p>
        <div
          ref={scrollRef}
          className="flex items-center gap-12 overflow-hidden"
        >
          {[...partners, ...partners].map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="flex shrink-0 items-center gap-2 rounded-lg border border-border/50 bg-secondary/30 px-6 py-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                {name.charAt(0)}
              </div>
              <span className="whitespace-nowrap text-sm font-medium text-muted-foreground">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
