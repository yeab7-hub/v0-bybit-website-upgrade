import { redirect } from "next/navigation"

/**
 * There is one canonical signed-in dashboard: the authenticated home page.
 * Keep this legacy route as a redirect so old links remain valid without
 * maintaining a second, divergent dashboard implementation.
 */
export default function DashboardRedirect() {
  redirect("/")
}
