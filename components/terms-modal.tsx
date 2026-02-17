"use client"

import { useState, useRef, useEffect } from "react"
import { X, ChevronDown } from "lucide-react"

const termsSections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using the Bybit platform ("Platform"), including our website, mobile applications, APIs, and all related services, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not use the Platform. We reserve the right to modify these Terms at any time, and such modifications will be effective immediately upon posting.`,
  },
  {
    title: "2. Eligibility",
    content: `To use the Platform, you must be at least 18 years of age (or the age of legal majority in your jurisdiction), have the legal capacity to enter into a binding agreement, not be a resident of any restricted jurisdiction, and complete our Know Your Customer (KYC) verification process.`,
  },
  {
    title: "3. Account Registration",
    content: `You must register for an account to access certain features of the Platform. You agree to provide accurate, current, and complete information during registration, maintain the security and confidentiality of your account credentials, and accept responsibility for all activities that occur under your account.`,
  },
  {
    title: "4. Trading Services",
    content: `The Platform provides cryptocurrency trading services, including spot trading, margin trading, and derivatives trading. All trades are executed at the prices available at the time of order execution. We do not guarantee the execution of any order at a specific price. Past performance is not indicative of future results.`,
  },
  {
    title: "5. Fees and Charges",
    content: `You agree to pay all applicable fees associated with your use of the Platform, including trading fees, withdrawal fees, and any other fees as disclosed on our fee schedule. Fees may be changed at any time with prior notice. All fees are non-refundable unless otherwise stated.`,
  },
  {
    title: "6. Risk Disclosure",
    content: `Cryptocurrency trading involves substantial risk of loss. The value of cryptocurrencies can be extremely volatile. You may lose some or all of your invested capital. You should not invest more than you can afford to lose. We recommend that you seek independent financial advice before trading.`,
  },
  {
    title: "7. Prohibited Activities",
    content: `You agree not to use the Platform for any unlawful purpose, engage in market manipulation, use automated systems or bots without authorization, attempt to gain unauthorized access to the Platform, or engage in any activity that disrupts the Platform's operations.`,
  },
  {
    title: "8. Intellectual Property",
    content: `All content, features, and functionality of the Platform are the exclusive property of Bybit and are protected by international copyright, trademark, patent, and trade secret laws.`,
  },
  {
    title: "9. Limitation of Liability",
    content: `To the maximum extent permitted by law, Bybit shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Platform.`,
  },
  {
    title: "10. Governing Law",
    content: `These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these Terms shall be resolved through binding arbitration.`,
  },
]

const privacySections = [
  {
    title: "1. Information We Collect",
    content: `We collect information you provide directly, such as your name, email address, identification documents, and financial information. We also automatically collect device information, IP addresses, browser type, usage patterns, and cookies.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use your information to provide and maintain the Platform, process transactions, verify your identity, send security alerts, respond to support requests, monitor for fraudulent activity, and personalize your experience.`,
  },
  {
    title: "3. Information Sharing",
    content: `We do not sell your personal information to third parties. We may share your information with service providers, regulatory authorities as required by law, and affiliated companies for internal business purposes.`,
  },
  {
    title: "4. Data Security",
    content: `We implement industry-standard security measures including encryption of data in transit and at rest, multi-factor authentication, regular security audits, access controls, and cold storage for digital assets.`,
  },
  {
    title: "5. Your Rights",
    content: `Depending on your jurisdiction, you may have the right to access your personal information, correct inaccurate data, request deletion of your data, object to processing, and data portability.`,
  },
]

interface TermsModalProps {
  open: boolean
  onClose: () => void
  onAccept: () => void
}

export function TermsModal({ open, onClose, onAccept }: TermsModalProps) {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms")
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrolledToBottom, setScrolledToBottom] = useState(false)
  const [readTerms, setReadTerms] = useState(false)
  const [readPrivacy, setReadPrivacy] = useState(false)

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const isBottom = scrollTop + clientHeight >= scrollHeight - 20
    if (isBottom) {
      setScrolledToBottom(true)
      if (activeTab === "terms") setReadTerms(true)
      else setReadPrivacy(true)
    }
  }

  useEffect(() => {
    setScrolledToBottom(false)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [activeTab])

  const canAccept = readTerms && readPrivacy

  if (!open) return null

  const sections = activeTab === "terms" ? termsSections : privacySections

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Terms & Privacy</h2>
            <p className="text-xs text-muted-foreground">Please read and scroll through both documents to continue</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("terms")}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "terms" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Terms of Service
            {readTerms && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success text-[10px] text-success-foreground">&#10003;</span>}
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "privacy" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Privacy Policy
            {readPrivacy && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success text-[10px] text-success-foreground">&#10003;</span>}
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-4"
          style={{ maxHeight: "50vh" }}
        >
          {sections.map((s) => (
            <div key={s.title} className="mb-4">
              <h3 className="mb-1.5 text-sm font-semibold text-foreground">{s.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{s.content}</p>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        {!scrolledToBottom && (
          <div className="flex items-center justify-center border-t border-border py-2">
            <div className="flex items-center gap-1 text-xs text-primary">
              <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
              Scroll down to read all
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <div className="text-xs text-muted-foreground">
            {!readTerms && !readPrivacy && "Read both documents to continue"}
            {readTerms && !readPrivacy && "Now read the Privacy Policy"}
            {!readTerms && readPrivacy && "Now read the Terms of Service"}
            {canAccept && "You may now accept and continue"}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              Decline
            </button>
            <button
              onClick={onAccept}
              disabled={!canAccept}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-40"
            >
              I Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
