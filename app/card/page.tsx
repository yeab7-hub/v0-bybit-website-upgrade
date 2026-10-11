import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CreditCard, ShieldAlert, Wallet, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-[900px] px-4 py-12 text-center lg:py-20">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight lg:text-5xl">Crypto Card</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground lg:text-base">
              Card issuance and payment processing are not connected to this platform yet.
              No card application, cashback rate, spending limit, or card benefit is currently available to promise.
            </p>
          </div>
        </section>
        <section className="mx-auto max-w-[900px] px-4 py-8 lg:py-12">
          <div role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <h2 className="text-base font-semibold">Card service unavailable</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  This feature will only be enabled after a card issuer, eligibility checks, fees, limits, and transaction processing are configured and verified.
                  Your wallet funds will not be charged from this page.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Link href="/wallet" className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-secondary/30">
              <Wallet className="h-5 w-5 text-primary" />
              <h3 className="mt-3 text-sm font-semibold">View wallet</h3>
              <p className="mt-1 text-xs text-muted-foreground">Review balances and available wallet actions.</p>
              <span className="mt-3 inline-flex items-center text-xs font-medium text-primary">Open wallet <ArrowRight className="ml-1 h-3.5 w-3.5" /></span>
            </Link>
            <Link href="/support" className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-secondary/30">
              <h3 className="text-sm font-semibold">Contact support</h3>
              <p className="mt-1 text-xs text-muted-foreground">Ask about card-service availability and future support.</p>
              <span className="mt-3 inline-flex items-center text-xs font-medium text-primary">Get support <ArrowRight className="ml-1 h-3.5 w-3.5" /></span>
            </Link>
          </div>
          <div className="mt-6 text-center">
            <Link href="/markets"><Button variant="outline">Explore markets</Button></Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
