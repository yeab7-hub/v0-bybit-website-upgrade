"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { BybitLogo } from "@/components/bybit-logo"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"


export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/dashboard"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError) {
        const msg = authError.message || ""
        if (msg === "Supabase not configured") {
          setError("Authentication service is not configured. Please check environment variables.")
          setLoading(false)
          return
        } else if (msg.includes("Email not confirmed")) {
          setError("Please confirm your email using the verification link sent to your inbox.")
        } else if (msg.includes("Invalid login credentials")) {
          setError("Invalid email or password.")
        } else {
          setError(msg)
        }
        setLoading(false)
        return
      }

      if (!data?.session) {
        setError("Login succeeded but no session was created.")
        setLoading(false)
        return
      }

      // Success - redirect directly
      router.push(redirectTo)
      router.refresh()
    } catch (err: any) {
      const msg = err?.message?.toLowerCase() || ""
      if (msg.includes("fetch") || msg.includes("network") || msg.includes("load failed") || err?.name === "TypeError") {
        setError("Unable to connect. Please check your internet and try again.")
      } else {
        setError(err?.message || "An unexpected error occurred.")
      }
      setLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: "google" | "apple") => {
    setLoading(true)
    setError(null)
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}` },
    })
    if (oauthError) { setError(oauthError.message); setLoading(false) }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 lg:px-8">
        <Link href="/"><BybitLogo className="h-[18px]" /></Link>
        <Link href="/register" className="text-xs font-medium text-primary hover:underline">Sign Up</Link>
      </div>

      {/* Form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-[380px]">
          <>
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>

            {error && (
              <div role="alert" className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>
            )}

            <form onSubmit={handleEmailLogin} className="mt-6">
              <div className="mb-4">
                <label className="mb-1.5 block text-xs text-muted-foreground" htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-6">
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs text-muted-foreground" htmlFor="login-password">Password</label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                </div>
                <div className="flex items-center rounded-md border border-border bg-card px-3 focus-within:border-primary">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="flex-1 bg-transparent py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    required
                    disabled={loading}
                  />
                  <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:bg-primary/90 hover:shadow-[0_0_28px_rgba(234,179,8,0.35)]"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log In"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">Having trouble logging in?</Link>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground">or log in with</span></div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleOAuthLogin("google")}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border py-2.5 text-sm text-foreground transition-all hover:border-primary/40 hover:bg-secondary disabled:opacity-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
              <button
                onClick={() => handleOAuthLogin("apple")}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border py-2.5 text-sm text-foreground transition-all hover:border-primary/40 hover:bg-secondary disabled:opacity-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.18 0-.36-.02-.53-.06-.01-.17-.03-.36-.03-.56 0-1.12.535-2.3 1.235-3.07.36-.39.81-.73 1.36-1 .55-.27 1.06-.42 1.56-.46.02.16.03.32.03.5zm4.563 17.97c-.033.1-.05.2-.07.3-.43 1.38-1.12 2.73-2.02 3.9-.79 1.01-1.6 2.02-2.87 2.05-1.13.03-1.59-.67-3.22-.67-1.63 0-2.13.65-3.2.7-1.22.05-2.15-1.1-2.95-2.1-1.63-2.05-2.88-5.79-1.2-8.32.83-1.25 2.31-2.04 3.92-2.06 1.1-.02 2.14.74 2.81.74.67 0 1.93-.92 3.26-.78.55.02 2.1.22 3.1 1.68-.08.05-1.85 1.08-1.83 3.22.03 2.56 2.24 3.42 2.27 3.43z"/></svg>
                Apple
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/register" className="font-medium text-primary hover:underline">Sign up now</Link>
            </p>
          </>
        </div>
      </div>
    </div>
  )
}
