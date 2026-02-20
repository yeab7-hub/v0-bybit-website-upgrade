"use client"

import { Smartphone, Monitor, Apple, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AppDownloadSection() {
  return (
    <section className="border-t border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Content */}
          <div>
            <span className="text-xs font-medium uppercase tracking-widest text-primary">
              Trade Anywhere
            </span>
            <h2 className="mt-2 text-balance text-2xl font-bold text-foreground md:text-3xl">
              Download the Bybit App
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Access your portfolio, execute trades, and manage your assets from anywhere. Available on iOS, Android, Windows, and macOS.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                <Apple className="h-4 w-4" />
                <div className="text-left">
                  <div className="text-[9px] leading-none opacity-70">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </Button>
              <Button className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 0 1 0 1.732l-2.807 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
                </svg>
                <div className="text-left">
                  <div className="text-[9px] leading-none opacity-70">GET IT ON</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </Button>
              <Button variant="outline" className="gap-2 border-border text-foreground hover:bg-secondary">
                <Monitor className="h-4 w-4" />
                Desktop
              </Button>
            </div>

            {/* QR */}
            <div className="mt-6 flex items-center gap-4 rounded-xl border border-border bg-card p-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-foreground text-background">
                <QrCode className="h-8 w-8" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">Scan to Download</div>
                <div className="mt-0.5 text-xs text-muted-foreground">iOS & Android supported</div>
              </div>
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="relative h-[480px] w-[240px] overflow-hidden rounded-[32px] border-2 border-muted bg-card shadow-2xl">
                {/* Notch */}
                <div className="absolute left-1/2 top-0 z-10 h-5 w-24 -translate-x-1/2 rounded-b-xl bg-background" />

                <div className="flex h-full flex-col bg-background p-3.5 pt-8">
                  {/* Status bar */}
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[9px] text-muted-foreground">9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-3 rounded-sm bg-muted-foreground" />
                      <div className="h-2 w-4 rounded-sm border border-muted-foreground">
                        <div className="h-full w-3/4 rounded-sm bg-success" />
                      </div>
                    </div>
                  </div>

                  {/* App header */}
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-primary text-[7px] font-bold text-primary-foreground">B</div>
                    <span className="text-[10px] font-bold text-foreground">Bybit</span>
                  </div>

                  {/* Balance Card */}
                  <div className="mb-3 rounded-lg bg-card p-2.5">
                    <div className="text-[9px] text-muted-foreground">Total Balance</div>
                    <div className="mt-0.5 font-mono text-base font-bold text-foreground">$124,532.18</div>
                    <div className="font-mono text-[9px] text-success">+$2,341.50 (1.91%)</div>
                  </div>

                  {/* Quick actions */}
                  <div className="mb-3 grid grid-cols-4 gap-1.5">
                    {["Deposit", "Withdraw", "Trade", "Earn"].map((a) => (
                      <div key={a} className="text-center">
                        <div className="mx-auto mb-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                          <Smartphone className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-[8px] text-muted-foreground">{a}</span>
                      </div>
                    ))}
                  </div>

                  {/* Mini market list */}
                  <div className="text-[9px] font-medium text-muted-foreground">Watchlist</div>
                  <div className="mt-1.5 flex flex-col gap-1.5">
                    {[
                      { s: "BTC", p: "$97,432", c: "+2.34%", up: true },
                      { s: "ETH", p: "$3,842", c: "-1.12%", up: false },
                      { s: "SOL", p: "$214.67", c: "+5.43%", up: true },
                      { s: "XRP", p: "$2.48", c: "+0.87%", up: true },
                    ].map((coin) => (
                      <div key={coin.s} className="flex items-center justify-between rounded-md bg-card p-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[7px] font-bold text-foreground">
                            {coin.s[0]}
                          </div>
                          <span className="text-[9px] font-medium text-foreground">{coin.s}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-[9px] text-foreground">{coin.p}</div>
                          <div className={`font-mono text-[8px] ${coin.up ? "text-success" : "text-destructive"}`}>{coin.c}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Glow */}
              <div className="absolute -inset-6 -z-10 rounded-full bg-primary/[0.06] blur-[50px]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
