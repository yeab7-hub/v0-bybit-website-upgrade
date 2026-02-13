"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Smartphone,
  Shield,
  ArrowRight,
  QrCode,
} from "lucide-react"
import { Button } from "@/components/ui/button"

type LoginMethod = "email" | "phone" | "qr"

export default function LoginPage() {
  const [method, setMethod] = useState<LoginMethod>("email")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [twoFACode, setTwoFACode] = useState(["", "", "", "", "", ""])

  const handle2FAChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newCode = [...twoFACode]
    newCode[index] = value
    setTwoFACode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      const next = document.getElementById(`2fa-${index + 1}`)
      next?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShow2FA(true)
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel - Form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="mb-8 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">T</span>
            </div>
            <span className="text-xl font-bold text-foreground">Tryd</span>
          </Link>

          {!show2FA ? (
            <>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome Back
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Log in to your Tryd account to continue trading
              </p>

              {/* Login method tabs */}
              <div className="mt-6 flex items-center gap-1 rounded-lg bg-secondary p-1">
                <button
                  onClick={() => setMethod("email")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium ${
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
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium ${
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
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium ${
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
                            Math.random() > 0.4
                              ? "bg-foreground"
                              : "bg-transparent"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    Scan with the Tryd mobile app to log in
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6">
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
                    className="mt-2 w-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Log In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              )}

              <div className="mt-6 text-center text-sm text-muted-foreground">
                {"Don't have an account? "}
                <Link
                  href="/register"
                  className="font-medium text-primary hover:underline"
                >
                  Sign Up
                </Link>
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
