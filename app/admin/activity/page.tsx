"use client"

import { useState, useEffect, useCallback } from "react"
import { Activity, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

interface ActivityLog {
  id: string
  admin_id: string
  action: string
  target_user_id: string | null
  details: Record<string, string> | null
  created_at: string
  admin_profile: {
    email: string | null
    full_name: string | null
  } | null
}

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [filterAction, setFilterAction] = useState("all")

  const pageSize = 20

  const fetchLogs = useCallback(async () => {
    const supabase = createClient()
    let query = supabase
      .from("activity_logs")
      .select("*, admin_profile:profiles(email, full_name)", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (filterAction !== "all") {
      query = query.eq("action", filterAction)
    }

    const { data, count } = await query
    if (data) setLogs(data as ActivityLog[])
    if (count !== null) setTotal(count)
  }, [page, filterAction])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const actionColors: Record<string, string> = {
    kyc_approved: "text-success bg-success/10",
    kyc_rejected: "text-destructive bg-destructive/10",
    user_banned: "text-destructive bg-destructive/10",
    user_unbanned: "text-success bg-success/10",
    role_changed: "text-primary bg-primary/10",
    login: "text-muted-foreground bg-secondary",
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <div className="border-b border-border bg-card/50 px-4 py-5 lg:px-8">
        <h1 className="text-xl font-bold text-foreground">Activity Logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Audit trail of all admin actions on the platform
        </p>
      </div>

      <div className="px-4 py-6 lg:px-8">
          {/* Filter */}
          <div className="mb-6 flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {[
              "all",
              "kyc_approved",
              "kyc_rejected",
              "user_banned",
              "role_changed",
            ].map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilterAction(f)
                  setPage(0)
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  filterAction === f
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {f === "all" ? "All" : f.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Logs */}
          <div className="rounded-xl border border-border bg-card">
            {logs.length === 0 ? (
              <div className="p-10 text-center">
                <Activity className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No activity logs yet. Actions taken in the admin panel will
                  appear here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {logs.map((log, i) => (
                  <div
                    key={log.id}
                    className={`flex items-center justify-between px-5 py-4 ${
                      i < logs.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                        {(
                          log.admin_profile?.full_name ||
                          log.admin_profile?.email ||
                          "A"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {log.admin_profile?.full_name ||
                              log.admin_profile?.email ||
                              "Admin"}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              actionColors[log.action] ||
                              "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {log.action.replace("_", " ")}
                          </span>
                        </div>
                        {log.details && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {JSON.stringify(log.details)}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-5 py-3">
                <span className="text-xs text-muted-foreground">
                  {total} total logs - Page {page + 1} of {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="h-8 w-8 p-0 text-muted-foreground"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setPage(Math.min(totalPages - 1, page + 1))
                    }
                    disabled={page >= totalPages - 1}
                    className="h-8 w-8 p-0 text-muted-foreground"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
