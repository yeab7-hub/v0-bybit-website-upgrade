"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-20">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card">
          {/* Background accent */}
          <div className="pointer-events-none absolute right-0 top-0 h-[300px] w-[400px] rounded-full bg-primary/[0.06] blur-[100px]" />

          <div className="relative px-6 py-12 md:px-12 md:py-16">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-2xl font-bold text-foreground md:text-3xl">
                Start Trading in Minutes
              </h2>
              <p className="mt-3 text-sm text-muted-foreground md:text-base">
                Create your free account, complete verification, and fund your wallet to access the global crypto market.
              </p>

              {/* Steps */}
              <div className="mt-10 grid gap-8 md:grid-cols-3">
                {[
                  { step: "01", title: "Create Account", desc: "Sign up with email and set a secure password" },
                  { step: "02", title: "Verify Identity", desc: "Complete KYC verification in under 5 minutes" },
                  { step: "03", title: "Start Trading", desc: "Deposit funds and access 500+ trading pairs" },
                ].map((item, i) => (
                  <div key={item.step} className="relative text-center">
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-mono text-sm font-bold text-primary">
                      {item.step}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.desc}
                    </p>
                    {/* Connector line */}
                    {i < 2 && (
                      <div className="absolute right-0 top-5 hidden h-px w-[calc(50%-20px)] translate-x-full bg-border md:block" />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="h-11 bg-primary px-8 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Create Free Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
