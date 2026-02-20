"use client"

import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Copy,
  Bot,
  Coins,
  Layers,
  Rocket,
} from "lucide-react"

const products = [
  {
    icon: BarChart3,
    title: "Spot",
    description: "Trade 500+ crypto pairs with tight spreads and deep liquidity.",
    href: "/trade",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Layers,
    title: "Derivatives",
    description: "Perpetual and quarterly futures with up to 100x leverage.",
    href: "/trade",
    color: "text-[hsl(199,89%,48%)]",
    bg: "bg-[hsl(199,89%,48%)]/10",
  },
  {
    icon: Copy,
    title: "Copy Trading",
    description: "Automatically replicate strategies of top-performing traders.",
    href: "/trade",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: Bot,
    title: "Trading Bots",
    description: "Deploy grid bots and DCA strategies with zero coding.",
    href: "/trade",
    color: "text-[hsl(262,83%,58%)]",
    bg: "bg-[hsl(262,83%,58%)]/10",
  },
  {
    icon: Coins,
    title: "Earn",
    description: "Put your assets to work with savings and liquidity mining.",
    href: "/earn",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Rocket,
    title: "Launchpad",
    description: "Get early access to promising new crypto projects.",
    href: "/finance",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
]

export function ProductsShowcase() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-20">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-balance text-2xl font-bold text-foreground md:text-3xl">
              One Platform, Every Product
            </h2>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              From spot to derivatives, bots to passive income -- everything you need to build wealth in crypto.
            </p>
          </div>
          <Link
            href="/trade"
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            View all products
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.title}
              href={product.href}
              className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/20 hover:bg-secondary/30"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${product.bg}`}>
                <product.icon className={`h-5 w-5 ${product.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    {product.title}
                  </h3>
                  <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
