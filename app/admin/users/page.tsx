"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Search,
  UserCheck,
  UserX,
  Shield,
  Ban,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

interface UserProfile {
  id: string
  email: string | null
  full_name: string | null
  role: string
  kyc_status: string
  is_banned: boolean
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [search, setSearch] = useState("")
  const [filterKYC, setFilterKYC] = useState<string>("all")
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const pageSize = 15

  const fetchUsers = useCallback(async () => {
    const supabase = createClient()
    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (filterKYC !== "all") {
      query = query.eq("kyc_status", filterKYC)
    }

    if (search) {
      query = query.or(
        `email.ilike.%${search}%,full_name.ilike.%${search}%`
      )
    }

    const { data, count } = await query
    if (data) setUsers(data)
    if (count !== null) setTotal(count)
  }, [page, filterKYC, search])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const updateUserRole = async (userId: string, role: string) => {
    const supabase = createClient()
    await supabase.from("profiles").update({ role }).eq("id", userId)
    setActiveMenu(null)
    fetchUsers()
  }

  const toggleBan = async (userId: string, isBanned: boolean) => {
    const supabase = createClient()
    await supabase
      .from("profiles")
      .update({ is_banned: !isBanned })
      .eq("id", userId)
    setActiveMenu(null)
    fetchUsers()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
            <UserCheck className="h-3 w-3" /> Approved
          </span>
        )
      case "pending":
        return (
          <span className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-medium text-yellow-500">
            <Shield className="h-3 w-3" /> Pending
          </span>
        )
      case "rejected":
        return (
          <span className="flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
            <UserX className="h-3 w-3" /> Rejected
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

  const getRoleBadge = (role: string) => {
    if (role === "admin") {
      return (
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          Admin
        </span>
      )
    }
    return (
      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
        User
      </span>
    )
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="border-b border-border bg-card/50 px-8 py-5">
          <h1 className="text-xl font-bold text-foreground">User Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View, search, and manage all platform users
          </p>
        </div>

        <div className="px-8 py-6">
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(0)
                }}
                className="w-64 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex items-center gap-2">
              {["all", "none", "pending", "approved", "rejected"].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilterKYC(f)
                    setPage(0)
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    filterKYC === f
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {f === "all" ? "All" : f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">KYC</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Joined</th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-8 text-center text-sm text-muted-foreground"
                      >
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
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
                            <span className="text-sm font-medium text-foreground">
                              {u.full_name || "Unnamed"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-muted-foreground">
                          {u.email}
                        </td>
                        <td className="px-5 py-3">{getRoleBadge(u.role)}</td>
                        <td className="px-5 py-3">
                          {getStatusBadge(u.kyc_status)}
                        </td>
                        <td className="px-5 py-3">
                          {u.is_banned ? (
                            <span className="flex items-center gap-1 text-xs text-destructive">
                              <Ban className="h-3 w-3" /> Banned
                            </span>
                          ) : (
                            <span className="text-xs text-success">Active</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-sm text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3">
                          <div className="relative">
                            <button
                              onClick={() =>
                                setActiveMenu(
                                  activeMenu === u.id ? null : u.id
                                )
                              }
                              className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {activeMenu === u.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setActiveMenu(null)}
                                />
                                <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-card p-1 shadow-xl">
                                  {u.role !== "admin" ? (
                                    <button
                                      onClick={() =>
                                        updateUserRole(u.id, "admin")
                                      }
                                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    >
                                      <Shield className="h-3.5 w-3.5" />
                                      Make Admin
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        updateUserRole(u.id, "user")
                                      }
                                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    >
                                      <UserCheck className="h-3.5 w-3.5" />
                                      Remove Admin
                                    </button>
                                  )}
                                  <button
                                    onClick={() =>
                                      toggleBan(u.id, u.is_banned)
                                    }
                                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                                  >
                                    <Ban className="h-3.5 w-3.5" />
                                    {u.is_banned ? "Unban User" : "Ban User"}
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-5 py-3">
                <span className="text-xs text-muted-foreground">
                  {total} total users - Page {page + 1} of {totalPages}
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
      </main>
    </div>
  )
}
