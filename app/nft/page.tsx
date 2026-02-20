"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Search, Heart, Eye, Filter, Grid3X3, LayoutGrid, TrendingUp, Clock, Diamond } from "lucide-react"
import { Button } from "@/components/ui/button"

const collections = [
  { name: "Pudgy Penguins", floor: "12.4 ETH", volume24h: "892 ETH", change: "+15.2%", items: "8,888", owners: "4,521", image: "PP" },
  { name: "Bored Ape YC", floor: "28.5 ETH", volume24h: "1,240 ETH", change: "-2.1%", items: "10,000", owners: "6,400", image: "BA" },
  { name: "Azuki", floor: "8.2 ETH", volume24h: "456 ETH", change: "+8.7%", items: "10,000", owners: "5,200", image: "AZ" },
  { name: "DeGods", floor: "5.8 ETH", volume24h: "234 ETH", change: "+22.3%", items: "10,000", owners: "4,800", image: "DG" },
  { name: "Milady Maker", floor: "4.1 ETH", volume24h: "189 ETH", change: "+5.4%", items: "10,000", owners: "3,900", image: "MM" },
  { name: "Doodles", floor: "3.2 ETH", volume24h: "145 ETH", change: "-1.8%", items: "10,000", owners: "5,100", image: "DO" },
]

const featuredNFTs = [
  { name: "Penguin #4521", collection: "Pudgy Penguins", price: "14.2 ETH", lastSale: "12.8 ETH", likes: 245, views: 1200, rarity: "Legendary" },
  { name: "Ape #8832", collection: "Bored Ape YC", price: "32.0 ETH", lastSale: "29.5 ETH", likes: 890, views: 4500, rarity: "Epic" },
  { name: "Azuki #1205", collection: "Azuki", price: "9.8 ETH", lastSale: "8.0 ETH", likes: 456, views: 2100, rarity: "Rare" },
  { name: "DeGod #7721", collection: "DeGods", price: "6.5 ETH", lastSale: "5.2 ETH", likes: 312, views: 1800, rarity: "Uncommon" },
  { name: "Milady #3301", collection: "Milady Maker", price: "5.0 ETH", lastSale: "4.5 ETH", likes: 198, views: 950, rarity: "Rare" },
  { name: "Doodle #6600", collection: "Doodles", price: "3.8 ETH", lastSale: "3.5 ETH", likes: 567, views: 2800, rarity: "Epic" },
  { name: "Penguin #2200", collection: "Pudgy Penguins", price: "15.5 ETH", lastSale: "13.0 ETH", likes: 334, views: 1600, rarity: "Legendary" },
  { name: "Ape #1100", collection: "Bored Ape YC", price: "35.0 ETH", lastSale: "30.0 ETH", likes: 1200, views: 6000, rarity: "Legendary" },
]

const categories = ["All", "Art", "PFP", "Gaming", "Photography", "Music", "Utility"]
const rarityColors: Record<string, string> = { Legendary: "text-primary bg-primary/10", Epic: "text-purple-400 bg-purple-400/10", Rare: "text-blue-400 bg-blue-400/10", Uncommon: "text-green-400 bg-green-400/10" }

export default function NFTPage() {
  const [tab, setTab] = useState<"explore" | "collections" | "rankings">("explore")
  const [cat, setCat] = useState("All")
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1400px] px-4 py-8 lg:py-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-primary"><Diamond className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wider">NFT Marketplace</span></div>
                <h1 className="mt-2 text-2xl font-bold text-foreground lg:text-3xl">Discover, Collect, and Trade NFTs</h1>
                <p className="mt-2 text-sm text-muted-foreground">Explore unique digital assets across multiple blockchains.</p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 lg:w-80">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search collections or NFTs..." className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] px-4 py-6">
          {/* Tabs */}
          <div className="mb-6 flex items-center justify-between border-b border-border">
            <div className="flex gap-1">
              {(["explore", "collections", "rankings"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} className={`border-b-2 px-4 py-3 text-sm font-medium capitalize transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
              ))}
            </div>
            <div className="hidden items-center gap-1 lg:flex">
              <button onClick={() => setViewMode("grid")} className={`rounded-md p-1.5 ${viewMode === "grid" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}><Grid3X3 className="h-4 w-4" /></button>
              <button onClick={() => setViewMode("list")} className={`rounded-md p-1.5 ${viewMode === "list" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}><LayoutGrid className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-6 flex gap-1 overflow-x-auto pb-2">
            {categories.map(c => (
              <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${cat === c ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{c}</button>
            ))}
          </div>

          {tab === "explore" && (
            <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 lg:grid-cols-2"}`}>
              {featuredNFTs.map((nft, i) => (
                <div key={i} className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg">
                  <div className="relative aspect-square bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center">
                    <span className="text-4xl font-bold text-muted-foreground/30">{nft.collection.charAt(0)}</span>
                    <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-[10px] backdrop-blur">
                      <Heart className="h-3 w-3" /> {nft.likes}
                    </div>
                    <div className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${rarityColors[nft.rarity] || "bg-secondary text-foreground"}`}>{nft.rarity}</div>
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-muted-foreground">{nft.collection}</div>
                    <div className="mt-0.5 text-sm font-semibold text-foreground">{nft.name}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <div><div className="text-[10px] text-muted-foreground">Price</div><div className="text-sm font-bold text-foreground">{nft.price}</div></div>
                      <div className="text-right"><div className="text-[10px] text-muted-foreground">Last Sale</div><div className="text-xs text-muted-foreground">{nft.lastSale}</div></div>
                    </div>
                    <Button size="sm" className="mt-3 w-full bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity">Buy Now</Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "collections" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((c, i) => (
                <div key={i} className="cursor-pointer rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">{c.image}</div>
                    <div><h3 className="text-sm font-bold text-foreground">{c.name}</h3><p className="text-[10px] text-muted-foreground">{c.items} items &middot; {c.owners} owners</p></div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div><div className="text-[10px] text-muted-foreground">Floor</div><div className="text-sm font-semibold text-foreground">{c.floor}</div></div>
                    <div><div className="text-[10px] text-muted-foreground">24h Vol</div><div className="text-sm font-semibold text-foreground">{c.volume24h}</div></div>
                    <div><div className="text-[10px] text-muted-foreground">24h</div><div className={`text-sm font-semibold ${c.change.startsWith("+") ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>{c.change}</div></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "rankings" && (
            <div className="overflow-x-auto">
              <table className="w-full"><thead><tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="pb-3 font-medium">#</th><th className="pb-3 font-medium">Collection</th><th className="pb-3 font-medium">Floor</th><th className="pb-3 font-medium">24h Volume</th><th className="pb-3 font-medium">24h Change</th><th className="pb-3 font-medium">Items</th><th className="pb-3 font-medium">Owners</th>
              </tr></thead><tbody>
                {collections.map((c, i) => (
                  <tr key={i} className="border-b border-border hover:bg-secondary/30 cursor-pointer">
                    <td className="py-3 text-sm text-muted-foreground">{i + 1}</td>
                    <td className="py-3"><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">{c.image}</div><span className="text-sm font-medium text-foreground">{c.name}</span></div></td>
                    <td className="py-3 text-sm text-foreground">{c.floor}</td>
                    <td className="py-3 text-sm text-foreground">{c.volume24h}</td>
                    <td className={`py-3 text-sm font-medium ${c.change.startsWith("+") ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>{c.change}</td>
                    <td className="py-3 text-sm text-muted-foreground">{c.items}</td>
                    <td className="py-3 text-sm text-muted-foreground">{c.owners}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
