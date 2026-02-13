"use client"

import { useEffect, useRef, useState } from "react"

function useCountUp(end: number, duration: number, start: boolean) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number | null = null
    let frame: number
    const animate = (ts: number) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * end))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [end, duration, start])
  return value
}

const stats = [
  { value: 42, suffix: "B+", prefix: "$", label: "24h Trading Volume" },
  { value: 20, suffix: "M+", prefix: "", label: "Registered Users" },
  { value: 150, suffix: "+", prefix: "", label: "Countries Supported" },
  { value: 500, suffix: "+", prefix: "", label: "Trading Pairs" },
  { value: 99, suffix: ".99%", prefix: "", label: "Platform Uptime" },
  { value: 12, suffix: "B+", prefix: "$", label: "Assets Under Protection" },
]

export function AnimatedStats() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="border-t border-border">
      <div
        ref={ref}
        className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-20 md:grid-cols-3 lg:grid-cols-6 lg:px-6"
      >
        {stats.map((stat) => (
          <StatItem key={stat.label} stat={stat} visible={visible} />
        ))}
      </div>
    </section>
  )
}

function StatItem({
  stat,
  visible,
}: {
  stat: (typeof stats)[number]
  visible: boolean
}) {
  const count = useCountUp(stat.value, 2000, visible)

  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-foreground lg:text-3xl">
        {stat.prefix}
        {visible ? count : 0}
        {stat.suffix}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">{stat.label}</div>
    </div>
  )
}
