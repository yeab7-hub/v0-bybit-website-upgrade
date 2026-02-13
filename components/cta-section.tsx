"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 lg:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-8 md:p-16">
          {/* Glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
              Start Trading in Minutes
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              Create your free account, complete verification, and fund your
              wallet. It only takes a few steps to access the global crypto
              market.
            </p>

            {/* Steps */}
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Create Account",
                  desc: "Sign up with your email and set a secure password",
                },
                {
                  step: "02",
                  title: "Verify Identity",
                  desc: "Complete KYC verification in under 5 minutes",
                },
                {
                  step: "03",
                  title: "Start Trading",
                  desc: "Deposit funds and access 500+ trading pairs",
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {item.step}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-primary px-8 text-primary-foreground hover:bg-primary/90"
                >
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
