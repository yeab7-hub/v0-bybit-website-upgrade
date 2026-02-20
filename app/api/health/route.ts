import { NextResponse } from "next/server"

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const status = {
    timestamp: new Date().toISOString(),
    env: {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? `${supabaseUrl.slice(0, 30)}...` : "MISSING",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey ? `${supabaseKey.slice(0, 10)}...` : "MISSING",
      SUPABASE_SERVICE_ROLE_KEY: serviceKey ? "SET" : "MISSING",
    },
    supabase_reachable: false,
    error: null as string | null,
  }

  // Test Supabase connectivity
  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
        headers: { apikey: supabaseKey },
        signal: AbortSignal.timeout(5000),
      })
      status.supabase_reachable = res.ok
      if (!res.ok) {
        status.error = `Supabase returned ${res.status}`
      }
    } catch (err: any) {
      status.error = err?.message || "Failed to reach Supabase"
    }
  }

  return NextResponse.json(status)
}
