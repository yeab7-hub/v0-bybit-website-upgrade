import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

function buildWithdrawalRejectionEmail(amount: string, asset: string, reason: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Withdrawal Rejected - Bybit</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0e11;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0e11;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#1a1d23;border-radius:16px;overflow:hidden;">

          <!-- Header with Logo -->
          <tr>
            <td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid #2a2d35;">
              <img src="${process.env.NEXT_PUBLIC_APP_URL || 'https://v0-bybit-website-upgrade.vercel.app'}/images/bybit-email-logo.jpg" alt="Bybit" width="180" height="45" style="display:block;margin:0 auto;max-width:180px;height:auto;" />
              <p style="margin:8px 0 0;font-size:12px;color:#72768f;letter-spacing:0.5px;">CRYPTO EXCHANGE</p>
            </td>
          </tr>

          <!-- Title with warning icon -->
          <tr>
            <td style="padding:32px 40px 8px;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">&#x26A0; Withdrawal Request Rejected</h1>
            </td>
          </tr>

          <!-- Subtitle -->
          <tr>
            <td style="padding:0 40px 28px;">
              <p style="margin:0;font-size:14px;line-height:22px;color:#a0a3b1;">Your recent withdrawal request has been reviewed and was not approved. Please review the details below.</p>
            </td>
          </tr>

          <!-- Transaction Details Box -->
          <tr>
            <td style="padding:0 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0e11;border-radius:12px;border:1px solid #2a2d35;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:0 0 14px;">
                          <p style="margin:0;font-size:11px;color:#72768f;text-transform:uppercase;letter-spacing:1px;">Transaction Type</p>
                          <p style="margin:4px 0 0;font-size:15px;color:#ffffff;font-weight:600;">Withdrawal</p>
                        </td>
                        <td style="padding:0 0 14px;text-align:right;">
                          <p style="margin:0;font-size:11px;color:#72768f;text-transform:uppercase;letter-spacing:1px;">Status</p>
                          <p style="margin:4px 0 0;font-size:15px;color:#f04866;font-weight:700;">REJECTED</p>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding:14px 0 0;border-top:1px solid #2a2d35;">
                          <p style="margin:0;font-size:11px;color:#72768f;text-transform:uppercase;letter-spacing:1px;">Amount</p>
                          <p style="margin:4px 0 0;font-size:24px;color:#ffffff;font-weight:800;">${amount} <span style="font-size:14px;color:#72768f;font-weight:400;">${asset}</span></p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Reason Box -->
          <tr>
            <td style="padding:0 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(240,72,102,0.08);border-radius:8px;border-left:3px solid #f04866;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 6px;font-size:12px;color:#f04866;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Reason for Rejection</p>
                    <p style="margin:0;font-size:14px;line-height:22px;color:#e0e0e0;">${reason}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Refund notice -->
          <tr>
            <td style="padding:0 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(32,211,175,0.08);border-radius:8px;border-left:3px solid #20d3af;">
                <tr>
                  <td style="padding:12px 16px;">
                    <p style="margin:0;font-size:13px;color:#20d3af;font-weight:500;">Funds Returned</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#a0a3b1;">The withdrawal amount of ${amount} ${asset} has been returned to your available balance.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What to do next -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#ffffff;">What You Can Do:</p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 0 6px;font-size:12px;color:#72768f;line-height:18px;">
                    <span style="color:#f7a600;margin-right:6px;">&#x2022;</span> Review the rejection reason and address any issues
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 6px;font-size:12px;color:#72768f;line-height:18px;">
                    <span style="color:#f7a600;margin-right:6px;">&#x2022;</span> Contact our support team if you believe this is an error
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 6px;font-size:12px;color:#72768f;line-height:18px;">
                    <span style="color:#f7a600;margin-right:6px;">&#x2022;</span> Submit a new withdrawal request after resolving any issues
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://v0-bybit-website-upgrade.vercel.app'}/wallet" style="display:inline-block;background-color:#f7a600;color:#0b0e11;font-size:14px;font-weight:700;padding:14px 40px;border-radius:8px;text-decoration:none;">View My Wallet</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background-color:#12151a;border-top:1px solid #2a2d35;text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;color:#72768f;">
                This is an automated email from Bybit. Please do not reply directly.
              </p>
              <p style="margin:0 0 8px;font-size:11px;color:#72768f;">
                If you have questions, please contact our <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://v0-bybit-website-upgrade.vercel.app'}/support" style="color:#f7a600;text-decoration:none;">24/7 Support Team</a>.
              </p>
              <p style="margin:0;font-size:11px;color:#4a4d5a;">
                &copy; 2018-2026 Bybit. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const adminSupabase = await createAdminClient()

  const { data: profile } = await adminSupabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin" && profile?.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // Fetch transactions (without FK join to avoid PostgREST errors if FK is missing)
  const { data: transactions, error } = await adminSupabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!transactions || transactions.length === 0) {
    return NextResponse.json([])
  }

  // Fetch associated profiles separately
  const userIds = [...new Set(transactions.map((t: any) => t.user_id).filter(Boolean))]
  const { data: profiles } = await adminSupabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", userIds)

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]))

  // Merge profile data into transactions
  const enriched = transactions.map((t: any) => ({
    ...t,
    profiles: profileMap.get(t.user_id) || { full_name: "Unknown", email: "—" },
  }))

  return NextResponse.json(enriched)
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const adminSupabase = await createAdminClient()

  const { data: profile } = await adminSupabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin" && profile?.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id, action, admin_note } = await request.json()

  const { data: tx, error: txErr } = await adminSupabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .single()

  if (txErr || !tx) return NextResponse.json({ error: "Transaction not found" }, { status: 404 })

  if (action === "approve") {
    if (tx.type === "deposit") {
      const { data: balance } = await adminSupabase
        .from("balances")
        .select("*")
        .eq("user_id", tx.user_id)
        .eq("asset", tx.asset)
        .single()

      if (balance) {
        await adminSupabase.from("balances").update({
          available: balance.available + tx.amount,
          updated_at: new Date().toISOString(),
        }).eq("user_id", tx.user_id).eq("asset", tx.asset)
      } else {
        await adminSupabase.from("balances").insert({
          user_id: tx.user_id,
          asset: tx.asset,
          available: tx.amount,
          in_order: 0,
        })
      }
    }

    if (tx.type === "withdrawal") {
      const { data: balance } = await adminSupabase
        .from("balances")
        .select("*")
        .eq("user_id", tx.user_id)
        .eq("asset", tx.asset)
        .single()

      if (balance) {
        await adminSupabase.from("balances").update({
          in_order: Math.max(0, (balance.in_order || 0) - tx.amount),
          updated_at: new Date().toISOString(),
        }).eq("user_id", tx.user_id).eq("asset", tx.asset)
      }
    }

    await adminSupabase.from("transactions").update({
      status: "completed",
      notes: admin_note || "Approved by admin",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    }).eq("id", id)

    return NextResponse.json({ success: true })
  }

  if (action === "reject") {
    if (tx.type === "withdrawal") {
      const { data: balance } = await adminSupabase
        .from("balances")
        .select("*")
        .eq("user_id", tx.user_id)
        .eq("asset", tx.asset)
        .single()

      if (balance) {
        await adminSupabase.from("balances").update({
          available: balance.available + tx.amount,
          in_order: Math.max(0, (balance.in_order || 0) - tx.amount),
          updated_at: new Date().toISOString(),
        }).eq("user_id", tx.user_id).eq("asset", tx.asset)
      }
    }

    await adminSupabase.from("transactions").update({
      status: "rejected",
      notes: admin_note || "Rejected by admin",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    }).eq("id", id)

    // Create in-app notification for the user
    const rejectionReason = admin_note || "Your withdrawal request did not meet our requirements."
    await adminSupabase.from("notifications").insert({
      user_id: tx.user_id,
      type: "withdrawal_rejected",
      title: "Withdrawal Request Rejected",
      message: `Your withdrawal of ${tx.amount} ${tx.asset} has been rejected. Reason: ${rejectionReason}. Funds have been returned to your available balance.`,
      metadata: { transaction_id: id, amount: tx.amount, asset: tx.asset, reason: rejectionReason },
      read: false,
    })

    // Send rejection email to the user
    const { data: userProfile } = await adminSupabase
      .from("profiles")
      .select("email")
      .eq("id", tx.user_id)
      .single()

    if (userProfile?.email) {
      try {
        await resend.emails.send({
          from: "Bybit <onboarding@resend.dev>",
          to: userProfile.email,
          subject: `Withdrawal Rejected - ${tx.amount} ${tx.asset} - Bybit`,
          html: buildWithdrawalRejectionEmail(
            String(tx.amount),
            tx.asset,
            rejectionReason
          ),
        })
      } catch (emailErr) {
        console.error("Failed to send rejection email:", emailErr)
      }
    }

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
