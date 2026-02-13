"use client"

import { Smartphone, Monitor, Apple, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AppDownloadSection() {
  return (
    <section className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-20 lg:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div>
            <span className="text-xs font-medium uppercase tracking-widest text-primary">
              Trade Anywhere
            </span>
            <h2 className="mt-3 text-balance text-3xl font-bold text-foreground md:text-4xl">
              Download the Tryd App
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">
              Access your portfolio, execute trades, and manage your assets from
              anywhere. Available on iOS, Android, Windows, and macOS.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                <Apple className="h-5 w-5" />
                <div className="text-left">
                  <div className="text-[10px] leading-none opacity-70">
                    Download on the
                  </div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </Button>
              <Button className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 0 1 0 1.732l-2.807 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] leading-none opacity-70">
                    GET IT ON
                  </div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-border text-foreground hover:bg-secondary"
              >
                <Monitor className="h-4 w-4" />
                Desktop App
              </Button>
            </div>

            {/* QR */}
            <div className="mt-8 flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-foreground text-background">
                <QrCode className="h-10 w-10" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  Scan to Download
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  iOS & Android supported
                </div>
              </div>
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="flex items-center justify-center">
            <div className="relative">
              {/* Phone frame */}
              <div className="relative h-[540px] w-[270px] overflow-hidden rounded-[36px] border-2 border-muted bg-card shadow-2xl">
                {/* Notch */}
                <div className="absolute left-1/2 top-0 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-background" />

                {/* Screen Content */}
                <div className="flex h-full flex-col bg-background p-4 pt-10">
                  {/* Status bar */}
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      9:41
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-3 rounded-sm bg-muted-foreground" />
                      <div className="h-1.5 w-1.5 rounded-sm bg-muted-foreground" />
                      <div className="h-2 w-4 rounded-sm border border-muted-foreground">
                        <div className="h-full w-3/4 rounded-sm bg-success" />
                      </div>
                    </div>
                  </div>

                  {/* App header */}
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-[8px] font-bold text-primary-foreground">
                      T
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      Tryd
                    </span>
                  </div>

                  {/* Balance Card */}
                  <div className="mb-4 rounded-xl bg-card p-3">
                    <div className="text-[10px] text-muted-foreground">
                      Total Balance
                    </div>
                    <div className="mt-1 font-mono text-lg font-bold text-foreground">
                      $124,532.18
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] text-success">
                      +$2,341.50 (1.91%)
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="mb-4 grid grid-cols-4 gap-2">
                    {["Deposit", "Withdraw", "Trade", "Earn"].map((a) => (
                      <div key={a} className="text-center">
                        <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <Smartphone className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-[9px] text-muted-foreground">
                          {a}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Mini market list */}
                  <div className="text-[10px] font-medium text-muted-foreground">
                    Watchlist
                  </div>
                  <div className="mt-2 flex flex-col gap-2">
                    {[
                      { s: "BTC", p: "$97,432", c: "+2.34%", up: true },
                      { s: "ETH", p: "$3,842", c: "-1.12%", up: false },
                      { s: "SOL", p: "$214.67", c: "+5.43%", up: true },
                      { s: "XRP", p: "$2.48", c: "+0.87%", up: true },
                    ].map((coin) => (
                      <div
                        key={coin.s}
                        className="flex items-center justify-between rounded-lg bg-card p-2"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[8px] font-bold text-foreground">
                            {coin.s[0]}
                          </div>
                          <span className="text-[10px] font-medium text-foreground">
                            {coin.s}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-[10px] text-foreground">
                            {coin.p}
                          </div>
                          <div
                            className={`font-mono text-[9px] ${
                              coin.up
                                ? "text-success"
                                : "text-destructive"
                            }`}
                          >
                            {coin.c}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Glow behind phone */}
              <div className="absolute -inset-8 -z-10 rounded-full bg-primary/10 blur-[60px]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
