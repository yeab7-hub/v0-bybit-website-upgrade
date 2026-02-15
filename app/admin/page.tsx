"use client"

import { useState, useEffect } from "react"
import {
  Users,
  Activity,
  TrendingUp,
  UserCheck,
  UserX,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Stats {
  totalUsers: number
  pendingKYC: number
  approvedKYC: number
  rejectedKYC: number
  totalTrades: number
  openTickets: number
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    pendingKYC: 0,
    approvedKYC: 0,
    rejectedKYC: 0,
    totalTrades: 0,
    openTickets: 0,
  })
  const [recentUsers, setRecentUsers] = useState<
    { id: string; email: string; full_name: string | null; kyc_status: string; created_at: string }[]
  >([])

  useEffect(() => {
    const supabase = createClient()

    const fetchStats = async () => {
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })

      const { count: pendingKYC } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("kyc_status", "pending")

      const { count: approvedKYC } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("kyc_status", "approved")

      const { count: rejectedKYC } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("kyc_status", "rejected")

      const { count: totalTrades } = await supabase
        .from("trades")
        .select("*", { count: "exact", head: true })

      const { count: openTickets } = await supabase
        .from("support_tickets")
        .select("*", { count: "exact", head: true })
        .in("status", ["open", "in_progress"])

      setStats({
        totalUsers: totalUsers || 0,
        pendingKYC: pendingKYC || 0,
        approvedKYC: approvedKYC || 0,
        rejectedKYC: rejectedKYC || 0,
        totalTrades: totalTrades || 0,
        openTickets: openTickets || 0,
      })

      // Recent users
      const { data: users } = await supabase
        .from("profiles")
        .select("id, email, full_name, kyc_status, created_at")
        .order("created_at", { ascending: false })
        .limit(8)

      if (users) setRecentUsers(users)
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Pending KYC",
      value: stats.pendingKYC,
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      label: "Approved KYC",
      value: stats.approvedKYC,
      icon: UserCheck,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Rejected KYC",
      value: stats.rejectedKYC,
      icon: UserX,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      label: "Total Trades",
      value: stats.totalTrades,
      icon: Activity,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Open Tickets",
      value: stats.openTickets,
      icon: TrendingUp,
      color: "text-chart-4",
      bg: "bg-chart-4/10",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
            Approved
          </span>
        )
      case "pending":
        return (
          <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-medium text-yellow-500">
            Pending
          </span>
        )
      case "rejected":
        return (
          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
            Rejected
          </span>
        )
      default:
        return (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            None
          </span>
        )
    }
  }

  return (
    <div>
      <div className="border-b border-border bg-card/50 px-4 py-5 lg:px-8">
        <h1 className="text-xl font-bold text-foreground">
          Admin Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform statistics and recent activity
        </p>
      </div>

      <div className="px-4 py-6 lg:px-8">
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {card.label}
                  </span>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bg}`}
                  >
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-foreground">
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          {/* Alerts */}
          {stats.pendingKYC > 0 && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {stats.pendingKYC} KYC application
                  {stats.pendingKYC > 1 ? "s" : ""} pending review
                </p>
                <p className="text-xs text-muted-foreground">
                  Review and approve or reject user identity documents
                </p>
              </div>
            </div>
          )}

          {/* Recent users table */}
          <div className="mt-6 rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-semibold text-foreground">Recent Users</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">KYC Status</th>
                    <th className="px-5 py-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-8 text-center text-sm text-muted-foreground"
                      >
                        No users yet
                      </td>
                    </tr>
                  ) : (
                    recentUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-border last:border-0 hover:bg-secondary/30"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                              {(u.full_name || u.email || "?")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <span className="text-sm text-foreground">
                              {u.full_name || "Unnamed"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-muted-foreground">
                          {u.email}
                        </td>
                        <td className="px-5 py-3">
                          {getStatusBadge(u.kyc_status)}
                        </td>
                        <td className="px-5 py-3 text-sm text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
    </div>
  )
}
