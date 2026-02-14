"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Smartphone,
  Shield,
  ArrowRight,
  QrCode,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

type LoginMethod = "email" | "phone" | "qr"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/dashboard"
  const [method, setMethod] = useState<LoginMethod>("email")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [twoFACode, setTwoFACode] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handle2FAChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newCode = [...twoFACode]
    newCode[index] = value
    setTwoFACode(newCode)
    if (value && index < 5) {
      const next = document.getElementById(`2fa-${index + 1}`)
      next?.focus()
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      if (authError.message.includes("Email not confirmed")) {
        // Auto-confirm trigger may not have fired yet, retry after a moment
        await new Promise((r) => setTimeout(r, 1500))
        const { error: retryError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (retryError) {
          setError("Your email is not confirmed yet. Please wait a moment and try again.")
          setLoading(false)
          return
        }
        // Retry succeeded
        router.push(redirectTo)
        router.refresh()
        return
      } else if (authError.message.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please check your credentials or sign up for a new account.")
      } else {
        setError(authError.message)
      }
      setLoading(false)
      return
    }

    // Notify admin of login
    fetch("/api/notify-signup", { method: "POST" }).catch(() => {})

    router.push(redirectTo)
    router.refresh()
  }

  const handleOAuthLogin = (provider: "google" | "apple") => {
    const name = provider.charAt(0).toUpperCase() + provider.slice(1)
    setError(`${name} login is coming soon. Please use email and password to sign in.`)
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel - Form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="mb-8 flex items-center">
            <img src="/images/bybit-logo.png" alt="Bybit" className="h-6" />
          </Link>

          {!show2FA ? (
            <>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome Back
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Log in to your Bybit account to continue trading
              </p>

              {error && (
                <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Login method tabs */}
              <div className="mt-6 flex items-center gap-1 rounded-lg bg-secondary p-1">
                <button
                  onClick={() => setMethod("email")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-colors ${
                    method === "email"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </button>
                <button
                  onClick={() => setMethod("phone")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-colors ${
                    method === "phone"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  Phone
                </button>
                <button
                  onClick={() => setMethod("qr")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-colors ${
                    method === "qr"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  <QrCode className="h-3.5 w-3.5" />
                  QR Code
                </button>
              </div>

              {method === "qr" ? (
                <div className="mt-8 flex flex-col items-center">
                  <div className="flex h-52 w-52 items-center justify-center rounded-xl border border-border bg-secondary">
                    <div className="grid grid-cols-5 gap-1">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-6 w-6 rounded-sm ${
                            [0,1,3,4,5,8,10,12,14,16,18,20,21,23,24].includes(i)
                              ? "bg-foreground"
                              : "bg-transparent"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    Scan with the Bybit mobile app to log in
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEmailLogin} className="mt-6">
                  {method === "email" ? (
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
                  ) : (
                    <div className="mb-4">
                      <label className="mb-1.5 block text-xs font-medium text-foreground">
                        Phone Number
                      </label>
                      <div className="flex items-center rounded-lg border border-border bg-secondary/30 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                        <button
                          type="button"
                          className="flex items-center gap-1 border-r border-border px-3 py-2.5 text-sm text-muted-foreground"
                        >
                          +1
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="currentColor"
                          >
                            <path d="M2 4l3 3 3-3" />
                          </svg>
                        </button>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter phone number"
                          className="flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-xs font-medium text-foreground">
                        Password
                      </label>
                      <Link
                        href="#"
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="flex items-center rounded-lg border border-border bg-secondary/30 px-3 py-2.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                      <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
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
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Log In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* OAuth */}
              <div className="mt-6">
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <span className="relative bg-background px-3 text-xs text-muted-foreground">
                    or continue with
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => handleOAuthLogin("google")}
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
                    onClick={() => handleOAuthLogin("apple")}
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
                {"Don't have an account? "}
                <Link
                  href="/register"
                  className="font-medium text-primary hover:underline"
                >
                  Sign Up
                </Link>
              </div>

              <div className="mt-8 text-center">
                <p className="text-[10px] text-muted-foreground/60">
                  Bybit&trade; 2026. All rights reserved.
                </p>
              </div>
            </>
          ) : (
            /* 2FA Verification */
            <div>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Two-Factor Authentication
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter the 6-digit code from your authenticator app
              </p>

              <div className="mt-8 flex items-center justify-center gap-3">
                {twoFACode.map((digit, i) => (
                  <input
                    key={i}
                    id={`2fa-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handle2FAChange(i, e.target.value)}
                    className="h-12 w-12 rounded-lg border border-border bg-secondary/30 text-center font-mono text-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                ))}
              </div>

              <Button className="mt-8 w-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                Verify
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="mt-4 text-center">
                <button className="text-xs text-primary hover:underline">
                  {"Lost your authenticator? Use backup code"}
                </button>
              </div>

              <button
                onClick={() => setShow2FA(false)}
                className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                Back to login
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right panel - Visual */}
      <div className="hidden w-1/2 flex-col items-center justify-center border-l border-border bg-card p-12 lg:flex">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Secure Trading Environment
          </h2>
          <p className="mt-4 text-muted-foreground">
            Your assets are protected with industry-leading security including
            multi-signature cold storage, real-time monitoring, and
            comprehensive insurance coverage.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6">
            {[
              { value: "$1B+", label: "Insurance Fund" },
              { value: "100%", label: "Cold Storage" },
              { value: "24/7", label: "Monitoring" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-lg font-bold text-primary">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
