"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Check,
  Gift,
  Shield,
  Zap,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { TermsModal } from "@/components/terms-modal"

const passwordRequirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
  {
    label: "One special character",
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
]

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [referral, setReferral] = useState("")
  const [showReferral, setShowReferral] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTerms, setShowTerms] = useState(false)

  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const allMet = passwordRequirements.every((r) => r.test(password))
    if (!allMet) {
      setError("Please meet all password requirements.")
      setLoading(false)
      return
    }

    let data
    let authError

    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            referral_code: referral || null,
          },
        },
      })
      data = result.data
      authError = result.error
    } catch (err: any) {
      if (err?.message?.includes("fetch") || err?.message?.includes("network") || err?.name === "TypeError") {
        setError("Unable to connect to authentication service. Please check that the site is properly configured.")
      } else {
        setError(err?.message || "An unexpected error occurred. Please try again.")
      }
      setLoading(false)
      return
    }

    if (authError) {
      if (authError.message === "Supabase not configured") {
        setError("Service is temporarily unavailable. Please try again later.")
        setLoading(false)
        return
      }
      if (authError.message.includes("already registered")) {
        setError("This email is already registered. Please log in instead.")
      } else {
        setError(authError.message)
      }
      setLoading(false)
      return
    }

    // Notify admin of new signup
    fetch("/api/notify-signup", { method: "POST" }).catch(() => {})

    // Auto-confirm trigger runs on DB, so try signing in immediately
    if (data.session) {
      router.push("/dashboard")
      router.refresh()
    } else {
      // Wait for auto-confirm trigger to fire, then sign in
      await new Promise((r) => setTimeout(r, 1000))

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) {
        // Try once more after another second
        await new Promise((r) => setTimeout(r, 1500))
        const { error: retryError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (retryError) {
          router.push("/auth/sign-up-success")
        } else {
          router.push("/trade")
          router.refresh()
        }
      } else {
        router.push("/trade")
        router.refresh()
      }
    }
  }

  const handleOAuthSignUp = async (provider: "google" | "apple") => {
    setLoading(true)
    setError(null)
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    })
    if (oauthError) {
      setError(oauthError.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel - Visual */}
      <div className="hidden w-1/2 flex-col items-center justify-center border-r border-border bg-card p-12 lg:flex">
        <div className="max-w-md">
          <h2 className="text-3xl font-bold text-foreground">
            Start Your Crypto Journey
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join millions of traders worldwide. Create your account in minutes
            and access the full suite of trading tools.
          </p>

          <div className="mt-10 flex flex-col gap-6">
            {[
              {
                icon: Gift,
                title: "Welcome Bonus",
                desc: "Get up to $30,000 in deposit rewards for new users",
              },
              {
                icon: Shield,
                title: "KYC in Minutes",
                desc: "Fast identity verification with automated document review",
              },
              {
                icon: Zap,
                title: "Instant Deposits",
                desc: "Fund your account instantly via bank transfer or crypto",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-xl border border-border bg-secondary/30 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Gift className="h-4 w-4" />
              Limited Time Offer
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Sign up now and trade with 0% maker fees for your first 30 days.
              Plus earn up to 20% commission through our referral program.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="mb-8 flex items-center">
            <img src="/images/bybit-logo.png" alt="Bybit" className="h-6" />
          </Link>

          <h1 className="text-2xl font-bold text-foreground">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join Bybit and start trading 500+ cryptocurrencies
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="mt-6">
            {/* Full Name */}
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Full Name
              </label>
              <div className="flex items-center rounded-lg border border-border bg-secondary/30 px-3 py-2.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Email Address
              </label>
              <div className="flex items-center rounded-lg border border-border bg-secondary/30 px-3 py-2.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Password
              </label>
              <div className="flex items-center rounded-lg border border-border bg-secondary/30 px-3 py-2.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password strength */}
              {password.length > 0 && (
                <div className="mt-2 flex flex-col gap-1">
                  {passwordRequirements.map((req) => {
                    const met = req.test(password)
                    return (
                      <div
                        key={req.label}
                        className="flex items-center gap-1.5"
                      >
                        <div
                          className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${
                            met ? "bg-success" : "border border-border"
                          }`}
                        >
                          {met && (
                            <Check className="h-2.5 w-2.5 text-success-foreground" />
                          )}
                        </div>
                        <span
                          className={`text-[10px] ${
                            met ? "text-success" : "text-muted-foreground"
                          }`}
                        >
                          {req.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Referral */}
            {!showReferral ? (
              <button
                type="button"
                onClick={() => setShowReferral(true)}
                className="mb-4 flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Gift className="h-3.5 w-3.5" />
                Have a referral code?
              </button>
            ) : (
              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-medium text-foreground">
                  Referral Code (Optional)
                </label>
                <div className="flex items-center rounded-lg border border-border bg-secondary/30 px-3 py-2.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                  <Gift className="mr-2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={referral}
                    onChange={(e) => setReferral(e.target.value)}
                    placeholder="Enter referral code"
                    className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Agreement */}
            <div className="mb-6 flex items-start gap-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={() => {
                  if (!agreed) setShowTerms(true)
                }}
                className="mt-0.5 h-5 w-5 rounded border-border accent-primary"
              />
              <span className="text-xs text-muted-foreground">
                I agree to Bybit&apos;s{" "}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-primary hover:underline"
                >
                  Terms of Service & Privacy Policy
                </button>
                {!agreed && (
                  <span className="ml-1 text-[10px] text-primary">(click to read & accept)</span>
                )}
              </span>
            </div>

            <Button
              type="submit"
              disabled={!agreed || loading}
              className="w-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* OAuth */}
          <div className="mt-6">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <span className="relative bg-background px-3 text-xs text-muted-foreground">
                or sign up with
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => handleOAuthSignUp("google")}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
              <button
                onClick={() => handleOAuthSignUp("apple")}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.18 0-.36-.02-.53-.06-.01-.17-.03-.36-.03-.56 0-1.12.535-2.3 1.235-3.07.36-.39.81-.73 1.36-1 .55-.27 1.06-.42 1.56-.46.02.16.03.32.03.5zm4.563 17.97c-.033.1-.05.2-.07.3-.43 1.38-1.12 2.73-2.02 3.9-.79 1.01-1.6 2.02-2.87 2.05-1.13.03-1.59-.67-3.22-.67-1.63 0-2.13.65-3.2.7-1.22.05-2.15-1.1-2.95-2.1-1.63-2.05-2.88-5.79-1.2-8.32.83-1.25 2.31-2.04 3.92-2.06 1.1-.02 2.14.74 2.81.74.67 0 1.93-.92 3.26-.78.55.02 2.1.22 3.1 1.68-.08.05-1.85 1.08-1.83 3.22.03 2.56 2.24 3.42 2.27 3.43z" />
                </svg>
                Apple
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Log In
            </Link>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-muted-foreground/60">
              Bybit&trade; 2026. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <TermsModal
        open={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={() => {
          setAgreed(true)
          setShowTerms(false)
        }}
      />
    </div>
  )
}
