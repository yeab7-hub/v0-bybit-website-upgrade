"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Code2, Zap, Shield, Globe, BookOpen, ChevronRight, Copy, Check, Terminal } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

const sdks = [
  { name: "Python", icon: "py", color: "bg-blue-500/10 text-blue-400" },
  { name: "JavaScript", icon: "js", color: "bg-yellow-500/10 text-yellow-400" },
  { name: "Go", icon: "go", color: "bg-cyan-500/10 text-cyan-400" },
  { name: "Java", icon: "jv", color: "bg-red-500/10 text-red-400" },
  { name: "C#", icon: "c#", color: "bg-purple-500/10 text-purple-400" },
  { name: "Rust", icon: "rs", color: "bg-orange-500/10 text-orange-400" },
]

const endpoints = [
  { method: "GET", path: "/v5/market/tickers", desc: "Get latest market tickers for all symbols", auth: false },
  { method: "GET", path: "/v5/market/orderbook", desc: "Get order book depth for a symbol", auth: false },
  { method: "GET", path: "/v5/market/kline", desc: "Get kline/candlestick data", auth: false },
  { method: "POST", path: "/v5/order/create", desc: "Place a new order", auth: true },
  { method: "POST", path: "/v5/order/cancel", desc: "Cancel an active order", auth: true },
  { method: "GET", path: "/v5/order/realtime", desc: "Get real-time active orders", auth: true },
  { method: "GET", path: "/v5/position/list", desc: "Get current positions", auth: true },
  { method: "GET", path: "/v5/account/wallet-balance", desc: "Get wallet balance", auth: true },
  { method: "GET", path: "/v5/asset/transfer/list", desc: "Get transfer history", auth: true },
  { method: "WS", path: "wss://stream.bybit.com/v5/public", desc: "Public WebSocket stream (tickers, order book, trades)", auth: false },
  { method: "WS", path: "wss://stream.bybit.com/v5/private", desc: "Private WebSocket stream (orders, positions, wallet)", auth: true },
]

const rateLimits = [
  { tier: "Regular", rest: "10 req/s", ws: "20 sub/conn", connections: "100" },
  { tier: "VIP 1-2", rest: "20 req/s", ws: "40 sub/conn", connections: "200" },
  { tier: "VIP 3+", rest: "50 req/s", ws: "100 sub/conn", connections: "500" },
]

const codeExample = `import requests
import hmac
import hashlib
import time

API_KEY = "your_api_key"
API_SECRET = "your_api_secret"
BASE_URL = "https://api.bybit.com"

def get_ticker(symbol="BTCUSDT"):
    endpoint = "/v5/market/tickers"
    params = {"category": "spot", "symbol": symbol}
    response = requests.get(BASE_URL + endpoint, params=params)
    return response.json()

# Get BTC/USDT ticker
ticker = get_ticker()
print(ticker["result"]["list"][0]["lastPrice"])`

export default function ApiDocsPage() {
  const [copied, setCopied] = useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(codeExample)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1200px] px-4 py-12 text-center lg:py-20">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Code2 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">API Documentation</h1>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">Build powerful trading applications with our REST and WebSocket APIs. Low-latency, reliable, and fully documented.</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link href="/account/api-management"><button className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground">Get API Keys</button></Link>
              <a href="#endpoints"><button className="h-10 rounded-lg border border-border px-5 text-sm font-semibold text-foreground">View Endpoints</button></a>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-4 px-4 py-10 lg:grid-cols-4">
            {[
              { icon: Zap, title: "Low Latency", desc: "Sub-10ms response times with co-located infrastructure." },
              { icon: Shield, title: "Secure", desc: "HMAC SHA256 authentication with IP whitelisting." },
              { icon: Globe, title: "Global CDN", desc: "Distributed endpoints across major regions." },
              { icon: BookOpen, title: "Well Documented", desc: "Comprehensive guides, examples, and SDKs." },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-4">
                <f.icon className="mb-2 h-5 w-5 text-primary" />
                <h3 className="text-xs font-semibold">{f.title}</h3>
                <p className="mt-1 text-[10px] text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SDKs */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1200px] px-4 py-8">
            <h2 className="mb-4 text-sm font-semibold">Official SDKs</h2>
            <div className="flex flex-wrap gap-2">
              {sdks.map((s) => (
                <div key={s.name} className={`flex items-center gap-2 rounded-lg border border-border px-4 py-2 ${s.color}`}>
                  <span className="text-xs font-bold uppercase">{s.icon}</span>
                  <span className="text-xs font-medium text-foreground">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Code Example */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1200px] px-4 py-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2"><Terminal className="h-4 w-4 text-primary" /> Quick Start (Python)</h2>
              <button onClick={copyCode} className="flex items-center gap-1 rounded-md bg-secondary px-3 py-1.5 text-xs text-secondary-foreground hover:text-foreground">
                {copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
              </button>
            </div>
            <pre className="overflow-x-auto rounded-xl border border-border bg-[#0d0d0d] p-4 text-xs leading-relaxed text-green-400">
              <code>{codeExample}</code>
            </pre>
          </div>
        </section>

        {/* Endpoints */}
        <section id="endpoints" className="border-b border-border">
          <div className="mx-auto max-w-[1200px] px-4 py-8 lg:py-12">
            <h2 className="mb-6 text-lg font-bold">API Endpoints</h2>
            <div className="flex flex-col gap-2">
              {endpoints.map((e) => (
                <div key={e.path} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${e.method === "GET" ? "bg-green-500/10 text-green-400" : e.method === "POST" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"}`}>{e.method}</span>
                    <code className="text-xs font-medium text-foreground">{e.path}</code>
                  </div>
                  <div className="hidden items-center gap-3 md:flex">
                    <span className="text-xs text-muted-foreground">{e.desc}</span>
                    {e.auth && <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">Auth Required</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Rate Limits */}
        <section>
          <div className="mx-auto max-w-[1200px] px-4 py-8 lg:py-12">
            <h2 className="mb-6 text-lg font-bold">Rate Limits</h2>
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full text-left text-xs">
                <thead><tr className="border-b border-border text-muted-foreground">
                  <th className="p-4 font-medium">Tier</th>
                  <th className="p-4 font-medium">REST</th>
                  <th className="p-4 font-medium">WebSocket</th>
                  <th className="p-4 font-medium">Connections</th>
                </tr></thead>
                <tbody>{rateLimits.map((r) => (
                  <tr key={r.tier} className="border-b border-border/50">
                    <td className="p-4 font-semibold text-foreground">{r.tier}</td>
                    <td className="p-4 text-secondary-foreground">{r.rest}</td>
                    <td className="p-4 text-secondary-foreground">{r.ws}</td>
                    <td className="p-4 text-secondary-foreground">{r.connections}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
