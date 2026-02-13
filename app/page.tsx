import { Header } from "@/components/header"
import { MarketTicker } from "@/components/market-ticker"
import { HeroSection } from "@/components/hero-section"
import { PartnersSection } from "@/components/partners-section"
import { MarketTable } from "@/components/market-table"
import { ProductsShowcase } from "@/components/products-showcase"
import { AnimatedStats } from "@/components/animated-stats"
import { FeaturesSection } from "@/components/features-section"
import { SecuritySection } from "@/components/security-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { AppDownloadSection } from "@/components/app-download-section"
import { NewsSection } from "@/components/news-section"
import { FAQSection } from "@/components/faq-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MarketTicker />
      <main>
        <HeroSection />
        <PartnersSection />
        <MarketTable />
        <ProductsShowcase />
        <AnimatedStats />
        <FeaturesSection />
        <SecuritySection />
        <TestimonialsSection />
        <AppDownloadSection />
        <NewsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
