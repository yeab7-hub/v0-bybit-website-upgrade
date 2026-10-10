"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { BybitLogo } from "@/components/bybit-logo"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Mail, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    setSent(false)
    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })
      if (resetError) throw resetError
      // Keep the response generic so this page does not disclose whether an account exists.
      setSent(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not request a password reset. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8">
        <Link href="/" className="inline-flex"><BybitLogo className="h-5" /></Link>
        <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-foreground">Reset your password</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Enter the email address associated with your account. If the account exists, we’ll send you a secure reset link.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-foreground">Email address</label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-base text-foreground outline-none focus:border-primary" />
          </div>
          {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          {sent && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-foreground">If an account matches this email, a password reset link has been sent. Check your inbox and spam folder.</p>}
          <button type="submit" disabled={loading} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
          </button>
        </form>
        <Link href="/login" className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to login</Link>
      </section>
    </main>
  )
}
