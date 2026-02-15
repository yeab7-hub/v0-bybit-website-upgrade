"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Verify admin role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError("Authentication failed"); setLoading(false); return }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role !== "admin") {
      await supabase.auth.signOut()
      setError("Access denied. Admin credentials required.")
      setLoading(false)
      return
    }

    router.push("/admin")
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0e17] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <img src="/images/bybit-logo.png" alt="Bybit" className="h-8" />
          <div className="flex items-center gap-2">
            <div className="h-px w-8 bg-[#f7a600]/30" />
            <span className="text-xs font-semibold tracking-widest text-[#f7a600]">ADMIN PANEL</span>
            <div className="h-px w-8 bg-[#f7a600]/30" />
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#1e2433] bg-[#0f1420] p-8">
          <h1 className="text-xl font-bold text-white">Admin Sign In</h1>
          <p className="mt-1 text-sm text-[#6b7280]">Authorized personnel only</p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#9ca3af]">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#1e2433] bg-[#0a0e17] px-4 py-3 text-sm text-white placeholder-[#4b5563] outline-none transition-colors focus:border-[#f7a600]/50"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#9ca3af]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#1e2433] bg-[#0a0e17] px-4 py-3 text-sm text-white placeholder-[#4b5563] outline-none transition-colors focus:border-[#f7a600]/50"
                placeholder="Enter admin password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-lg bg-[#f7a600] py-3 text-sm font-bold text-[#0a0e17] transition-all hover:bg-[#e5990a] disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Sign In to Admin"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 border-t border-[#1e2433] pt-5">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-[#6b7280]">Secure admin authentication</span>
          </div>
        </div>
      </div>
    </div>
  )
}
