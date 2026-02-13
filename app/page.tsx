import { Header } from "@/components/header"
import { MarketTicker } from "@/components/market-ticker"
import { HeroSection } from "@/components/hero-section"
import { MarketTable } from "@/components/market-table"
import { FeaturesSection } from "@/components/features-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MarketTicker />
      <main>
        <HeroSection />
        <MarketTable />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
