"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function PageLoader() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    setLoading(true)
    setFadeOut(false)

    const fadeTimer = setTimeout(() => setFadeOut(true), 150)
    const hideTimer = setTimeout(() => setLoading(false), 350)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [pathname])

  if (!loading) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-200 ${
        fadeOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        <img
          src="/images/bybit-logo.png"
          alt="Bybit"
          className="h-7 animate-pulse"
          style={{ animationDuration: "0.8s" }}
        />
        <div className="h-0.5 w-16 overflow-hidden rounded-full bg-border">
          <div className="h-full w-1/2 animate-[shimmer_0.6s_ease-in-out_infinite] rounded-full bg-[#f7a600]" />
        </div>
      </div>
    </div>
  )
}
