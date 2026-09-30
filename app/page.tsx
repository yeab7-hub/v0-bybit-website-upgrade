"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MarketTicker } from "@/components/market-ticker"
import { HeroSection } from "@/components/hero-section"
import { MarketTable } from "@/components/market-table"
import { ProductsShowcase } from "@/components/products-showcase"
import { FeaturesSection } from "@/components/features-section"
import { SecuritySection } from "@/components/security-section"
import { AppDownloadSection } from "@/components/app-download-section"
import { CTASection } from "@/components/cta-section"
import { HomeLoggedIn } from "@/components/home-logged-in"
import { BottomNav } from "@/components/bottom-nav"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    let cancelled = false
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { user: u } } = await supabase.auth.getUser()
        if (cancelled) return
        if (u) {
          setUser(u)
        }
      } catch {
        // Auth check failed -- show landing page
      } finally {
        if (!cancelled) {
          setLoading(false)
          setAuthChecked(true)
        }
      }
    }
    checkAuth()
    return () => { cancelled = true }
  }, [])

  // Loading state -- short spinner, never blocks more than 2s
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false)
      setAuthChecked(true)
    }, 2000)
    return () => clearTimeout(timeout)
  }, [])

  if (loading && !authChecked) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  // Logged-in users see the full interactive dashboard
  if (user) {
    return (
      <div className="min-h-[100dvh] bg-background">
        <Header />
        <MarketTicker />
        <main className="pb-14 lg:pb-0">
          <HomeLoggedIn user={user} />
        </main>
        <BottomNav />
        <div className="hidden lg:block"><Footer /></div>
      </div>
    )
  }

  // Not logged in -- show the marketing landing page
  return (
    <div className="min-h-[100dvh] bg-background">
      <Header />
      <MarketTicker />
      <main>
        <HeroSection />
        <MarketTable />
        <ProductsShowcase />
        <FeaturesSection />
        <SecuritySection />
        <AppDownloadSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
