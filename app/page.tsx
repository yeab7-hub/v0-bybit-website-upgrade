"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
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
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => {
        setUser(data.user)
        setLoading(false)
      }).catch(() => setLoading(false))
    } catch { setLoading(false) }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <MarketTicker />
        <div className="flex items-center justify-center py-32">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <MarketTicker />
        <main>
          <HomeLoggedIn user={user} />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
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
