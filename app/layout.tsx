export const dynamic = "force-dynamic"

import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { PageLoader } from "@/components/page-loader"
import { SupportChat } from "@/components/support-chat"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: "ByTradeBit — Trading Platform",
  description:
    "Explore crypto markets and trading tools on ByTradeBit. Market availability and trading features depend on configured data and execution integrations.",
}

export const viewport: Viewport = {
  themeColor: "#0a0e17",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} bg-background`}>
      <body className="font-sans antialiased">
        <PageLoader />
        {children}
        <SupportChat />
      </body>
    </html>
  )
}
