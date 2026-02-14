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

    const fadeTimer = setTimeout(() => setFadeOut(true), 400)
    const hideTimer = setTimeout(() => setLoading(false), 700)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [pathname])

  if (!loading) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-300 ${
        fadeOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <img
            src="/images/bybit-logo.png"
            alt="Bybit"
            className="h-8 animate-pulse"
          />
        </div>
        <div className="flex gap-1">
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#f7a600]" style={{ animationDelay: "0ms" }} />
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#f7a600]" style={{ animationDelay: "150ms" }} />
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#f7a600]" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  )
}
