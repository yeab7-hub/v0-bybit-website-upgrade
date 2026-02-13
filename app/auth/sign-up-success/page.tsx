import Link from "next/link"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground">
          Check Your Email
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {"We've sent a confirmation link to your email address. Click it to activate your Tryd account."}
        </p>
        <Link href="/login">
          <Button
            variant="outline"
            className="mt-6 w-full border-border text-foreground hover:bg-secondary"
          >
            Back to Login
          </Button>
        </Link>
        <p className="mt-6 text-[10px] text-muted-foreground/60">
          Tryd&trade; 2026. All rights reserved.
        </p>
      </div>
    </div>
  )
}
