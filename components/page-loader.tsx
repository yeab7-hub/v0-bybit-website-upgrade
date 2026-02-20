"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"
import { BybitLogo } from "@/components/bybit-logo"

export function PageLoader() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const isFirst = useRef(true)

  useEffect(() => {
    // Skip the very first mount (initial page load already rendered)
    if (isFirst.current) {
      isFirst.current = false
      return
    }

    // Show overlay immediately on route change
    setVisible(true)
    setFadeOut(false)

    // Hold the overlay to let the new page render underneath,
    // then fade it out smoothly
    const holdTimer = setTimeout(() => setFadeOut(true), 500)
    const removeTimer = setTimeout(() => setVisible(false), 900)

    return () => {
      clearTimeout(holdTimer)
      clearTimeout(removeTimer)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0e17] transition-opacity duration-400 ease-out ${
        fadeOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-5">
        <div style={{ animation: "logoPulse 1s ease-in-out infinite" }}>
          <BybitLogo className="h-8" />
        </div>
        <div className="h-[2px] w-20 overflow-hidden rounded-full bg-[#1a1f2e]">
          <div
            className="h-full rounded-full bg-[#f7a600]"
            style={{ animation: "loaderSlide 0.8s ease-in-out infinite" }}
          />
        </div>
      </div>
    </div>
  )
}
