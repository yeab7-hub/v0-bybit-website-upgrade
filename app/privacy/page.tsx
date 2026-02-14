import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"

const sections = [
  {
    title: "1. Information We Collect",
    content: `We collect information you provide directly, such as your name, email address, phone number, government-issued identification documents, financial information, and transaction history. We also automatically collect device information, IP addresses, browser type, usage patterns, and cookies. This data helps us provide, maintain, and improve our services.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use your information to provide and maintain the Platform, process transactions and send related information, verify your identity and comply with KYC/AML requirements, send technical notices and security alerts, respond to your comments and support requests, monitor and analyze trends, usage, and activities, detect, investigate, and prevent fraudulent or unauthorized activity, and personalize and improve your experience.`,
  },
  {
    title: "3. Information Sharing",
    content: `We do not sell your personal information to third parties. We may share your information with service providers who assist in operating the Platform, regulatory authorities as required by law, law enforcement agencies when legally required, business partners with your consent, and affiliated companies for internal business purposes. All third parties are required to protect your information in accordance with applicable laws.`,
  },
  {
    title: "4. Data Security",
    content: `We implement industry-standard security measures to protect your personal information, including encryption of data in transit and at rest, multi-factor authentication, regular security audits and penetration testing, access controls and monitoring, and cold storage for digital assets. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: "5. Data Retention",
    content: `We retain your personal information for as long as your account is active or as needed to provide services, comply with legal obligations, resolve disputes, and enforce our agreements. When your data is no longer needed, we will securely delete or anonymize it in accordance with our data retention policies.`,
  },
  {
    title: "6. Your Rights",
    content: `Depending on your jurisdiction, you may have the right to access your personal information, correct inaccurate data, request deletion of your data, object to or restrict processing, data portability, and withdraw consent. To exercise any of these rights, please contact us through our support center. We will respond to your request within 30 days.`,
  },
  {
    title: "7. International Transfers",
    content: `Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international data transfers, including standard contractual clauses and adequacy decisions where applicable.`,
  },
  {
    title: "8. Children's Privacy",
    content: `The Platform is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child, we will take steps to delete it promptly.`,
  },
  {
    title: "9. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12 lg:px-6 lg:py-20">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground lg:text-4xl">Privacy Policy</h1>
          <p className="mt-2 text-muted-foreground">Last updated: February 14, 2026</p>
        </div>

        <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            At Bybit, we are committed to protecting your privacy and ensuring the security of your personal information.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>
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
            If you have questions about this Privacy Policy, please contact our Data Protection Officer at{" "}
            <Link href="/support" className="text-primary hover:underline">our support center</Link> or
            email privacy@tryd.com.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
