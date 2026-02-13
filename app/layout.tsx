import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })
const _jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Tryd - Crypto Exchange & Trading Platform",
  description:
    "Trade Bitcoin, Ethereum, and 500+ cryptocurrencies on the world's leading exchange. Spot, derivatives, and copy trading with institutional-grade security.",
}

export const viewport: Viewport = {
  themeColor: "#0a0e17",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
