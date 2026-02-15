"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  User,
  Calendar,
  MapPin,
  Clock,
  X,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

interface KYCRecord {
  id: string
  user_id: string
  document_type: string
  document_data: Record<string, string>
  status: string
  created_at: string
  reviewed_at: string | null
  profiles: {
    email: string | null
    full_name: string | null
  } | null
}

export default function AdminKYCPage() {
  const [records, setRecords] = useState<KYCRecord[]>([])
  const [filter, setFilter] = useState("pending")
  const [viewRecord, setViewRecord] = useState<KYCRecord | null>(null)
  const [processing, setProcessing] = useState(false)

  const fetchRecords = useCallback(async () => {
    const supabase = createClient()
    let query = supabase
      .from("kyc_documents")
      .select("*, profiles(email, full_name)")
      .order("created_at", { ascending: false })

    if (filter !== "all") {
      query = query.eq("status", filter)
    }

    const { data } = await query
    if (data) setRecords(data as KYCRecord[])
  }, [filter])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const handleReview = async (
    recordId: string,
    userId: string,
    action: "approved" | "rejected"
  ) => {
    setProcessing(true)
    const supabase = createClient()

    await supabase
      .from("kyc_documents")
      .update({ status: action, reviewed_at: new Date().toISOString() })
      .eq("id", recordId)

    await supabase
      .from("profiles")
      .update({ kyc_status: action })
      .eq("id", userId)

    setViewRecord(null)
    setProcessing(false)
    fetchRecords()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-success bg-success/10"
      case "rejected":
        return "text-destructive bg-destructive/10"
      case "pending":
        return "text-yellow-500 bg-yellow-500/10"
      default:
        return "text-muted-foreground bg-secondary"
    }
  }

  return (
    <div>
      <div className="border-b border-border bg-card/50 px-4 py-5 lg:px-8">
        <h1 className="text-xl font-bold text-foreground">KYC Review</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and approve or reject identity verification submissions
        </p>
      </div>

      <div className="px-4 py-6 lg:px-8">
          {/* Filter tabs */}
          <div className="mb-6 flex items-center gap-2">
            {["pending", "approved", "rejected", "all"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-4 py-2 text-xs font-medium capitalize transition-colors ${
                  filter === f
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* KYC list */}
          <div className="flex flex-col gap-3">
            {records.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-10 text-center">
                <Shield className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No KYC submissions found
                </p>
              </div>
            ) : (
              records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:bg-card/80"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                      {(
                        record.profiles?.full_name ||
                        record.profiles?.email ||
                        "?"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {record.profiles?.full_name || "Unnamed User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.profiles?.email} - {record.document_type.replace("_", " ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-medium capitalize ${getStatusColor(record.status)}`}
                    >
                      {record.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(record.created_at).toLocaleDateString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewRecord(record)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {viewRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                KYC Document Review
              </h2>
              <button
                onClick={() => setViewRecord(null)}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              {/* User info */}
              <div className="rounded-lg border border-border bg-secondary/20 p-4">
                <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  Applicant
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground">Name</span>
                    <p className="text-foreground">
                      {viewRecord.document_data?.first_name}{" "}
                      {viewRecord.document_data?.last_name}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Email</span>
                    <p className="text-foreground">
                      {viewRecord.profiles?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal details */}
              <div className="rounded-lg border border-border bg-secondary/20 p-4">
                <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  Document Details
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" /> Date of Birth
                    </span>
                    <p className="text-foreground">
                      {viewRecord.document_data?.date_of_birth || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> Country
                    </span>
                    <p className="text-foreground">
                      {viewRecord.document_data?.country || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Document Type
                    </span>
                    <p className="capitalize text-foreground">
                      {viewRecord.document_type.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> Submitted
                    </span>
                    <p className="text-foreground">
                      {new Date(viewRecord.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-muted-foreground">
                      Address
                    </span>
                    <p className="text-foreground">
                      {viewRecord.document_data?.address || "N/A"},{" "}
                      {viewRecord.document_data?.city},{" "}
                      {viewRecord.document_data?.postal_code}
                    </p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="rounded-lg border border-border bg-secondary/20 p-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Uploaded Files
                </h3>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">ID Front</span>
                    <span className="text-foreground">
                      {viewRecord.document_data?.id_front || "N/A"}
                    </span>
                  </div>
                  {viewRecord.document_data?.id_back && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">ID Back</span>
                      <span className="text-foreground">
                        {viewRecord.document_data?.id_back}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Selfie</span>
                    <span className="text-foreground">
                      {viewRecord.document_data?.selfie || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            {viewRecord.status === "pending" && (
              <div className="mt-6 flex gap-3">
                <Button
                  onClick={() =>
                    handleReview(
                      viewRecord.id,
                      viewRecord.user_id,
                      "rejected"
                    )
                  }
                  disabled={processing}
                  variant="outline"
                  className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  onClick={() =>
                    handleReview(
                      viewRecord.id,
                      viewRecord.user_id,
                      "approved"
                    )
                  }
                  disabled={processing}
                  className="flex-1 bg-success text-success-foreground hover:bg-success/90"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </div>
            )}

            {viewRecord.status !== "pending" && (
              <div className="mt-6 text-center">
                <span
                  className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize ${getStatusColor(viewRecord.status)}`}
                >
                  {viewRecord.status}
                  {viewRecord.reviewed_at &&
                    ` on ${new Date(viewRecord.reviewed_at).toLocaleDateString()}`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
