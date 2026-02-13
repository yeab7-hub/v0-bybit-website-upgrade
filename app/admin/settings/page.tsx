"use client"

import { useState } from "react"
import { Settings, Shield, Key, Bell, Globe, Loader2 } from "lucide-react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export default function AdminSettingsPage() {
  const [promoteEmail, setPromoteEmail] = useState("")
  const [promoteLoading, setPromoteLoading] = useState(false)
  const [promoteMsg, setPromoteMsg] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const supabase = createClient()

  const handlePromote = async () => {
    setPromoteLoading(true)
    setPromoteMsg(null)

    const { data: profile, error } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("email", promoteEmail)
      .select()
      .single()

    if (error || !profile) {
      setPromoteMsg({
        type: "error",
        text: "User not found or update failed. Make sure the email is registered.",
      })
    } else {
      setPromoteMsg({
        type: "success",
        text: `${promoteEmail} has been promoted to admin.`,
      })
      setPromoteEmail("")
    }

    setPromoteLoading(false)
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="border-b border-border bg-card/50 px-8 py-5">
          <h1 className="text-xl font-bold text-foreground">
            Admin Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform configuration and management options
          </p>
        </div>

        <div className="px-8 py-6">
          <div className="flex flex-col gap-6">
            {/* Promote Admin */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">
                    Promote User to Admin
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Grant admin access to a registered user by email
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <div className="flex flex-1 items-center rounded-lg border border-border bg-secondary/30 px-3 py-2.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                  <input
                    type="email"
                    value={promoteEmail}
                    onChange={(e) => setPromoteEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <Button
                  onClick={handlePromote}
                  disabled={!promoteEmail || promoteLoading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {promoteLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Promote"
                  )}
                </Button>
              </div>

              {promoteMsg && (
                <div
                  className={`mt-3 rounded-lg px-3 py-2 text-sm ${
                    promoteMsg.type === "success"
                      ? "border border-success/30 bg-success/10 text-success"
                      : "border border-destructive/30 bg-destructive/10 text-destructive"
                  }`}
                >
                  {promoteMsg.text}
                </div>
              )}
            </div>

            {/* Platform settings */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">
                    Platform Settings
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    General configuration options
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-4">
                <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 p-4">
                  <div className="flex items-center gap-3">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Require KYC for Trading
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Users must complete KYC before placing orders
                      </p>
                    </div>
                  </div>
                  <button className="relative h-6 w-11 rounded-full bg-primary transition-colors">
                    <span className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-primary-foreground transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 p-4">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Email Notifications
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Send email alerts for new KYC submissions
                      </p>
                    </div>
                  </div>
                  <button className="relative h-6 w-11 rounded-full bg-primary transition-colors">
                    <span className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-primary-foreground transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 p-4">
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Maintenance Mode
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Temporarily disable the platform for all users
                      </p>
                    </div>
                  </div>
                  <button className="relative h-6 w-11 rounded-full bg-secondary transition-colors">
                    <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-muted-foreground transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <Shield className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">
                    Danger Zone
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Irreversible and destructive actions
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <p className="text-sm text-foreground">
                  Reset all user KYC statuses
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  This will set all users back to unverified. They will need to
                  re-submit documents.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  Reset All KYC
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
