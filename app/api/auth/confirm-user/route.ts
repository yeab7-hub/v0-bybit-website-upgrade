import { NextResponse } from "next/server"

/**
 * Manual email confirmation by arbitrary email is intentionally disabled.
 * Users must confirm ownership through Supabase's verification link.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Manual email confirmation is disabled. Use the verification link sent to your email." },
    { status: 410 },
  )
}
