import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // For OAuth users, ensure profile + balances exist
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Check if profile exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single()

        if (!profile) {
          // Create profile for OAuth user
          const fullName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "User"

          await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
            full_name: fullName,
            role: "user",
            kyc_status: "none",
          })

          // Create default balances
          const defaultCoins = ["BTC", "ETH", "USDT", "USDC", "SOL", "XRP", "ADA", "BNB", "AVAX", "DOT"]
          await supabase.from("balances").insert(
            defaultCoins.map((coin) => ({
              user_id: user.id,
              asset: coin,
              available: 0,
              in_order: 0,
            }))
          )

          // Log activity
          await supabase.from("activity_logs").insert({
            user_id: user.id,
            action: "oauth_signup",
            details: {
              provider: user.app_metadata?.provider || "oauth",
              email: user.email,
            },
            ip_address: request.headers.get("x-forwarded-for") || "unknown",
          })
        }

        // Notify admin
        fetch(`${origin}/api/notify-signup`, {
          method: "POST",
          headers: { cookie: request.headers.get("cookie") || "" },
        }).catch(() => {})
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
