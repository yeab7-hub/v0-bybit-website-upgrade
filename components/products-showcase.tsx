"use client"

import Link from "next/link"
import { ArrowRight, BarChart3, Copy, Bot, Coins, Layers, Rocket } from "lucide-react"

const products = [
  { icon: BarChart3, title: "Spot Trading", desc: "600+ trading pairs with deep liquidity and tight spreads.", href: "/trade", tag: "Popular" },
  { icon: Layers, title: "Derivatives", desc: "Perpetual & quarterly futures with up to 100x leverage.", href: "/trade", tag: null },
  { icon: Copy, title: "Copy Trading", desc: "Auto-copy strategies from top-performing traders.", href: "/trade", tag: "New" },
  { icon: Bot, title: "Trading Bots", desc: "Grid, DCA, and smart rebalance bots with zero coding.", href: "/trade", tag: null },
  { icon: Coins, title: "Bybit Earn", desc: "Put idle assets to work with flexible and fixed savings.", href: "/earn", tag: null },
  { icon: Rocket, title: "Launchpad", desc: "Early access to vetted new crypto projects.", href: "/finance", tag: null },
]

export function ProductsShowcase() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1400px] px-4 py-16 lg:py-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">One Platform, Every Tool</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">Everything you need to trade, earn, and grow your crypto portfolio.</p>
          </div>
          <Link href="/trade" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline md:flex">
            Explore all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Link
              key={p.title}
              href={p.href}
              className="group flex items-start gap-4 rounded-lg border border-border bg-secondary/50 p-5 transition-colors hover:border-primary/30 hover:bg-secondary"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <p.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
                  {p.tag && (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">{p.tag}</span>
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.desc}</p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
