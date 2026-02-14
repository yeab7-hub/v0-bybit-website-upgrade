import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-7 w-7 text-destructive" />
        </div>
        <h1 className="text-xl font-bold text-foreground">
          Authentication Error
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong during sign in. Please try again.
        </p>
        <Link href="/login">
          <Button className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Back to Login
          </Button>
        </Link>
        <p className="mt-6 text-[10px] text-muted-foreground/60">
          Bybit&trade; 2026. All rights reserved.
        </p>
      </div>
    </div>
  )
}
