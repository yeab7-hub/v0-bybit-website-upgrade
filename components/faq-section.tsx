"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "How do I create an account on Tryd?",
    answer:
      "Creating an account is simple. Click 'Sign Up', enter your email address, create a secure password, and verify your email. You can then complete KYC verification to unlock full trading features including deposits and withdrawals.",
  },
  {
    question: "What are the trading fees on Tryd?",
    answer:
      "Tryd offers a competitive tiered fee structure. Spot trading starts at 0.10% maker / 0.10% taker, with discounts available based on your 30-day trading volume and TRYD token holdings. VIP tiers can enjoy fees as low as 0.02% maker / 0.04% taker.",
  },
  {
    question: "How does Tryd keep my assets safe?",
    answer:
      "We employ a multi-layered security approach: 95% of assets are stored in multi-signature cold wallets with HSM modules, real-time AI monitoring detects suspicious activity, and our insurance fund covers potential breaches. We also publish regular third-party proof-of-reserves audits.",
  },
  {
    question: "What cryptocurrencies can I trade on Tryd?",
    answer:
      "Tryd supports 500+ trading pairs across major cryptocurrencies like Bitcoin, Ethereum, and Solana, as well as emerging altcoins. We regularly add new listings based on community interest and thorough security reviews.",
  },
  {
    question: "How do deposits and withdrawals work?",
    answer:
      "You can deposit crypto from any external wallet by selecting your asset and copying the deposit address. For fiat deposits, we support bank transfers, credit/debit cards, and third-party payment processors. Withdrawals are processed instantly for crypto and within 1-3 business days for fiat.",
  },
  {
    question: "What is KYC and why is it required?",
    answer:
      "KYC (Know Your Customer) is an identity verification process required by financial regulations. It helps prevent fraud, money laundering, and protects all users. Verification typically takes under 5 minutes with a government-issued ID and a selfie.",
  },
  {
    question: "Does Tryd offer leverage trading?",
    answer:
      "Yes, Tryd offers leverage up to 100x on perpetual and quarterly futures contracts. We support both USDT-margined and coin-margined contracts with cross and isolated margin modes. Risk management tools including stop-loss, take-profit, and trailing stops are available.",
  },
  {
    question: "How does copy trading work?",
    answer:
      "Copy trading lets you automatically replicate the trades of experienced traders. Browse our verified leaderboard, select a trader based on their performance metrics, set your copy amount and risk parameters, and their trades will be mirrored in your account proportionally.",
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-3xl px-4 py-20 lg:px-6">
        <div className="mb-12 text-center">
          <span className="text-xs font-medium uppercase tracking-widest text-primary">
            FAQ
          </span>
          <h2 className="mt-3 text-balance text-3xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-muted-foreground">
            Everything you need to know about trading on Tryd.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i

            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-foreground">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-border px-5 py-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
