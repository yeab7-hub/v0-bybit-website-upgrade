"use client"

import { useEffect, useRef } from "react"
import { CalendarDays, ExternalLink } from "lucide-react"

/**
 * Live macroeconomic calendar supplied by TradingView.
 * Event schedules and actual/forecast values are sourced from the provider;
 * this component intentionally does not invent or hardcode event listings.
 */
export function EconomicCalendar() {
  const widgetHost = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = widgetHost.current
    if (!host) return

    host.replaceChildren()
    const container = document.createElement("div")
    container.className = "tradingview-widget-container"
    container.style.width = "100%"

    const widget = document.createElement("div")
    widget.className = "tradingview-widget-container__widget"
    widget.style.width = "100%"
    container.appendChild(widget)

    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js"
    script.async = true
    script.type = "text/javascript"
    script.text = JSON.stringify({
      colorTheme: "dark",
      isTransparent: true,
      locale: "en",
      countryFilter: "us,eu,gb,jp,cn,ca,au,nz,ch",
      importanceFilter: "-1,0,1",
      width: "100%",
      height: 480,
    })
    container.appendChild(script)
    host.appendChild(container)

    return () => {
      host.replaceChildren()
    }
  }, [])

  return (
    <section className="mt-5 overflow-hidden rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <div>
            <h2 className="text-sm font-semibold text-foreground">Economic Calendar</h2>
            <p className="text-xs text-muted-foreground">Upcoming releases and market-moving financial events</p>
          </div>
        </div>
        <a
          href="https://www.tradingview.com/economic-calendar/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Full calendar <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <div ref={widgetHost} className="min-h-[320px] w-full overflow-hidden" />
      <p className="mt-2 text-[10px] text-muted-foreground">
        Calendar data provided by TradingView. Event times and market data may be delayed; verify important releases with the original source.
      </p>
    </section>
  )
}
