"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Shield,
  User,
  FileText,
  Camera,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  AlertCircle,
  Loader2,
  Globe,
  Calendar,
  MapPin,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"

type KYCStep = "info" | "identity" | "selfie" | "review"
type KYCStatus = "none" | "pending" | "approved" | "rejected"

const countries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "South Korea",
  "Singapore",
  "India",
  "Brazil",
  "Mexico",
  "Nigeria",
  "South Africa",
  "UAE",
]

const idTypes = [
  { value: "passport", label: "Passport" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "national_id", label: "National ID Card" },
]

export default function KYCPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<KYCStep>("info")
  const [kycStatus, setKycStatus] = useState<KYCStatus>("none")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Personal info
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [country, setCountry] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")

  // Document
  const [idType, setIdType] = useState("passport")
  const [idFrontName, setIdFrontName] = useState("")
  const [idBackName, setIdBackName] = useState("")

  // Selfie
  const [selfieName, setSelfieName] = useState("")

  const checkKYCStatus = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("kyc_status")
      .eq("id", user.id)
      .single()

    if (profile?.kyc_status && profile.kyc_status !== "none") {
      setKycStatus(profile.kyc_status as KYCStatus)
    }
    setLoading(false)
  }, [supabase, router])

  useEffect(() => {
    checkKYCStatus()
  }, [checkKYCStatus])

  const handleSubmitKYC = async () => {
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/kyc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_type: idType,
          document_data: {
            first_name: firstName,
            last_name: lastName,
            date_of_birth: dateOfBirth,
            country,
            address,
            city,
            postal_code: postalCode,
            id_front: idFrontName,
            id_back: idBackName,
            selfie: selfieName,
          },
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to submit KYC documents")
        setSubmitting(false)
        return
      }

      setKycStatus("pending")
    } catch {
      setError("Network error. Please try again.")
    }

    setSubmitting(false)
  }

  const steps: { key: KYCStep; label: string; icon: React.ElementType }[] = [
    { key: "info", label: "Personal Info", icon: User },
    { key: "identity", label: "Identity Document", icon: FileText },
    { key: "selfie", label: "Selfie Verification", icon: Camera },
    { key: "review", label: "Review & Submit", icon: CheckCircle },
  ]

  const currentStepIndex = steps.findIndex((s) => s.key === step)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // KYC already submitted
  if (kycStatus !== "none") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-md text-center">
            {kycStatus === "pending" && (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  Verification In Progress
                </h1>
                <p className="mt-3 text-muted-foreground">
                  Your documents are being reviewed. This usually takes 1-24
                  hours. We will notify you via email once complete.
                </p>
                <div className="mt-8 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      Under Review
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Estimated Time
                    </span>
                    <span className="text-foreground">1-24 hours</span>
                  </div>
                </div>
              </>
            )}
            {kycStatus === "approved" && (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  Verification Complete
                </h1>
                <p className="mt-3 text-muted-foreground">
                  Your identity has been verified. You now have full access to
                  all Bybit features including deposits and withdrawals.
                </p>
              </>
            )}
            {kycStatus === "rejected" && (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  Verification Rejected
                </h1>
                <p className="mt-3 text-muted-foreground">
                  Your verification was not approved. Please re-submit with
                  clear, valid documents.
                </p>
                <Button
                  onClick={() => {
                    setKycStatus("none")
                    setStep("info")
                  }}
                  className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Re-submit Documents
                </Button>
              </>
            )}
            <Link href="/trade">
              <Button
                variant="outline"
                className="mt-4 w-full border-border text-foreground hover:bg-secondary"
              >
                Back to Trading
              </Button>
            </Link>
            <p className="mt-8 text-[10px] text-muted-foreground/60">
              Bybit&trade; 2026. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Identity Verification
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete KYC to unlock deposits, withdrawals, and higher limits
          </p>
        </div>

        {/* Steps indicator */}
        <div className="mb-10 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.key} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  i < currentStepIndex
                    ? "bg-success text-success-foreground"
                    : i === currentStepIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                }`}
              >
                {i < currentStepIndex ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`hidden text-xs sm:block ${
                  i === currentStepIndex
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={`h-px flex-1 ${
                    i < currentStepIndex ? "bg-success" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Step 1: Personal Info */}
        {step === "info" && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">
                  Personal Information
                </h2>
                <p className="text-xs text-muted-foreground">
                  Must match your government-issued ID
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">
                    First Name
                  </label>
                  <div className="flex items-center rounded-lg border border-border bg-secondary/30 px-3 py-2.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">
                    Last Name
                  </label>
                  <div className="flex items-center rounded-lg border border-border bg-secondary/30 px-3 py-2.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">
                  Date of Birth
                </label>
                <div className="flex items-center rounded-lg border border-border bg-secondary/30 px-3 py-2.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-foreground outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">
                  Country / Region
                </label>
                <div className="flex items-center rounded-lg border border-border bg-secondary/30 px-3 py-2.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                  <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-foreground outline-none"
                  >
                    <option value="" className="bg-card">
                      Select country
                    </option>
                    {countries.map((c) => (
                      <option key={c} value={c} className="bg-card">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">
                  Address
                </label>
                <div className="flex items-center rounded-lg border border-border bg-secondary/30 px-3 py-2.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street address"
                    className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">
                    City
                  </label>
                  <div className="flex items-center rounded-lg border border-border bg-secondary/30 px-3 py-2.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">
                    Postal Code
                  </label>
                  <div className="flex items-center rounded-lg border border-border bg-secondary/30 px-3 py-2.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="12345"
                      className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setStep("identity")}
              disabled={
                !firstName ||
                !lastName ||
                !dateOfBirth ||
                !country ||
                !address
              }
              className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Identity Document */}
        {step === "identity" && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">
                  Identity Document
                </h2>
                <p className="text-xs text-muted-foreground">
                  Upload a clear photo of your government-issued ID
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Document Type
              </label>
              <div className="flex gap-2">
                {idTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setIdType(type.value)}
                    className={`flex-1 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${
                      idType === type.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Front */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">
                  Front of Document
                </label>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/20 py-10 transition-colors hover:border-primary/40 hover:bg-secondary/40">
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {idFrontName || "Click to upload"}
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG or PDF, max 10MB
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) setIdFrontName(file.name)
                    }}
                  />
                </label>
              </div>

              {/* Back */}
              {idType !== "passport" && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">
                    Back of Document
                  </label>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/20 py-10 transition-colors hover:border-primary/40 hover:bg-secondary/40">
                    <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {idBackName || "Click to upload"}
                    </span>
                    <span className="mt-1 text-xs text-muted-foreground">
                      JPG, PNG or PDF, max 10MB
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) setIdBackName(file.name)
                      }}
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("info")}
                className="border-border text-foreground hover:bg-secondary"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={() => setStep("selfie")}
                disabled={!idFrontName}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Selfie */}
        {step === "selfie" && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Camera className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">
                  Selfie Verification
                </h2>
                <p className="text-xs text-muted-foreground">
                  Upload a selfie holding your ID next to your face
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Tips: </strong>
                Make sure your face and ID are clearly visible. Use good
                lighting and ensure the text on your ID is readable.
              </p>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/20 py-14 transition-colors hover:border-primary/40 hover:bg-secondary/40">
              <Camera className="mb-3 h-10 w-10 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {selfieName || "Upload selfie with ID"}
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                JPG or PNG, max 10MB
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setSelfieName(file.name)
                }}
              />
            </label>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("identity")}
                className="border-border text-foreground hover:bg-secondary"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={() => setStep("review")}
                disabled={!selfieName}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === "review" && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">
                  Review & Submit
                </h2>
                <p className="text-xs text-muted-foreground">
                  Confirm your details before submitting
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Personal Info summary */}
              <div className="rounded-lg border border-border bg-secondary/20 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground">Name</span>
                    <p className="text-foreground">
                      {firstName} {lastName}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Date of Birth
                    </span>
                    <p className="text-foreground">{dateOfBirth}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Country
                    </span>
                    <p className="text-foreground">{country}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">City</span>
                    <p className="text-foreground">
                      {city}, {postalCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Documents summary */}
              <div className="rounded-lg border border-border bg-secondary/20 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  Documents
                </h3>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Document Type</span>
                    <span className="text-foreground capitalize">
                      {idType.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Front</span>
                    <span className="text-foreground">{idFrontName}</span>
                  </div>
                  {idBackName && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Back</span>
                      <span className="text-foreground">{idBackName}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Selfie</span>
                    <span className="text-foreground">{selfieName}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs text-muted-foreground">
                  Your personal information is encrypted and stored securely. We
                  only use it for identity verification as required by law.
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("selfie")}
                className="border-border text-foreground hover:bg-secondary"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleSubmitKYC}
                disabled={submitting}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Submit Verification
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-[10px] text-muted-foreground/60">
          Bybit&trade; 2026. All rights reserved.
        </p>
      </div>
    </div>
  )
}
