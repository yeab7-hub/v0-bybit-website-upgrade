import { Header } from "@/components/header"
import { MarketTicker } from "@/components/market-ticker"
import { HeroSection } from "@/components/hero-section"
import { MarketTable } from "@/components/market-table"
import { ProductsShowcase } from "@/components/products-showcase"
import { FeaturesSection } from "@/components/features-section"
import { SecuritySection } from "@/components/security-section"
import { AppDownloadSection } from "@/components/app-download-section"
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
