export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth and role check handled by middleware (proxy.ts)
  return <>{children}</>
}
