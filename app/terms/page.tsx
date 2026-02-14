import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using the Bybit platform ("Platform"), including our website, mobile applications, APIs, and all related services, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not use the Platform. We reserve the right to modify these Terms at any time, and such modifications will be effective immediately upon posting. Your continued use of the Platform constitutes acceptance of the modified Terms.`,
  },
  {
    title: "2. Eligibility",
    content: `To use the Platform, you must be at least 18 years of age (or the age of legal majority in your jurisdiction), have the legal capacity to enter into a binding agreement, not be a resident of any restricted jurisdiction, and complete our Know Your Customer (KYC) verification process. By using the Platform, you represent and warrant that you meet all eligibility requirements.`,
  },
  {
    title: "3. Account Registration",
    content: `You must register for an account to access certain features of the Platform. You agree to provide accurate, current, and complete information during registration, maintain the security and confidentiality of your account credentials, notify us immediately of any unauthorized use of your account, and accept responsibility for all activities that occur under your account. We reserve the right to suspend or terminate accounts that violate these Terms.`,
  },
  {
    title: "4. Trading Services",
    content: `The Platform provides cryptocurrency trading services, including spot trading, margin trading, and derivatives trading. All trades are executed at the prices available at the time of order execution. We do not guarantee the execution of any order at a specific price. Market orders are subject to slippage, and limit orders may not be filled if the market does not reach the specified price. Past performance is not indicative of future results.`,
  },
  {
    title: "5. Fees and Charges",
    content: `You agree to pay all applicable fees associated with your use of the Platform, including trading fees, withdrawal fees, and any other fees as disclosed on our fee schedule. Fees may be changed at any time with prior notice. All fees are non-refundable unless otherwise stated. You are responsible for any taxes arising from your use of the Platform.`,
  },
  {
    title: "6. Risk Disclosure",
    content: `Cryptocurrency trading involves substantial risk of loss. The value of cryptocurrencies can be extremely volatile. You may lose some or all of your invested capital. You should not invest more than you can afford to lose. Trading on margin or with leverage increases the risk of loss. We recommend that you seek independent financial advice before trading. The Platform does not provide investment advice.`,
  },
  {
    title: "7. Prohibited Activities",
    content: `You agree not to use the Platform for any unlawful purpose, engage in market manipulation, use automated systems or bots without authorization, attempt to gain unauthorized access to the Platform, use the Platform for money laundering or terrorist financing, create multiple accounts to circumvent trading limits, or engage in any activity that disrupts the Platform's operations.`,
  },
  {
    title: "8. Intellectual Property",
    content: `All content, features, and functionality of the Platform, including but not limited to text, graphics, logos, icons, software, and the design and arrangement thereof, are the exclusive property of Bybit and are protected by international copyright, trademark, patent, and trade secret laws.`,
  },
  {
    title: "9. Limitation of Liability",
    content: `To the maximum extent permitted by law, Bybit shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Platform. Our total liability for any claims arising under these Terms shall not exceed the total fees paid by you to us in the twelve (12) months preceding the claim.`,
  },
  {
    title: "10. Governing Law",
    content: `These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles. Any disputes arising from these Terms shall be resolved through binding arbitration, unless otherwise required by law.`,
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12 lg:px-6 lg:py-20">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground lg:text-4xl">Terms of Service</h1>
          <p className="mt-2 text-muted-foreground">Last updated: February 14, 2026</p>
        </div>

        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.title} className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-3 text-lg font-bold text-foreground">{s.title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.content}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-bold text-foreground">Contact Us</h2>
          <p className="text-sm text-muted-foreground">
            If you have questions about these Terms, please contact us at{" "}
            <Link href="/support" className="text-primary hover:underline">our support center</Link> or
            email us at legal@bybit.com.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
