"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BybitLogo } from "@/components/bybit-logo"
import { createClient } from "@/lib/supabase/client"
import { Loader2, LockKeyhole, CheckCircle2 } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    if (password.length < 8) {
      setError("Use at least 8 characters for your new password.")
      return
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.")
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setSuccess(true)
      window.setTimeout(() => {
        router.replace("/dashboard")
        router.refresh()
      }, 1200)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The reset link may have expired. Request a new one and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8">
        <Link href="/" className="inline-flex"><BybitLogo className="h-5" /></Link>
        <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          {success ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <LockKeyhole className="h-6 w-6 text-primary" />}
        </div>
        <h1 className="mt-5 text-2xl font-bold text-foreground">{success ? "Password updated" : "Choose a new password"}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{success ? "Your password has been changed. Redirecting you to your account…" : "Choose a strong password you haven’t used on another site."}</p>
        {!success && <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="mb-2 block text-sm text-foreground">New password</label>
            <input id="password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-base text-foreground outline-none focus:border-primary" />
          </div>
          <div>
            <label htmlFor="confirm-password" className="mb-2 block text-sm text-foreground">Confirm new password</label>
            <input id="confirm-password" type="password" autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-base text-foreground outline-none focus:border-primary" />
          </div>
          {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={loading} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
          </button>
        </form>}
        {success && <p role="status" className="mt-4 text-sm text-emerald-500">Success</p>}
        {!success && <Link href="/login" className="mt-5 inline-flex min-h-10 items-center text-sm text-muted-foreground hover:text-foreground">Back to login</Link>}
      </section>
    </main>
  )
}
