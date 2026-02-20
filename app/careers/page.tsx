"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MapPin, Briefcase, ChevronRight, Search, Users, Globe, Zap, Heart } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

const departments = ["All", "Engineering", "Product", "Design", "Marketing", "Operations", "Legal", "Finance", "Customer Support"]
const locations = ["All Locations", "Dubai", "Singapore", "Hong Kong", "London", "Remote"]

const jobs = [
  { title: "Senior Blockchain Engineer", dept: "Engineering", location: "Singapore", type: "Full-time" },
  { title: "Smart Contract Developer", dept: "Engineering", location: "Remote", type: "Full-time" },
  { title: "Product Manager - Trading", dept: "Product", location: "Dubai", type: "Full-time" },
  { title: "Senior UX Designer", dept: "Design", location: "Singapore", type: "Full-time" },
  { title: "Growth Marketing Manager", dept: "Marketing", location: "Dubai", type: "Full-time" },
  { title: "DevOps Engineer", dept: "Engineering", location: "Remote", type: "Full-time" },
  { title: "Compliance Officer", dept: "Legal", location: "Hong Kong", type: "Full-time" },
  { title: "Frontend Engineer - React", dept: "Engineering", location: "Singapore", type: "Full-time" },
  { title: "Data Analyst", dept: "Product", location: "London", type: "Full-time" },
  { title: "Customer Support Lead - APAC", dept: "Customer Support", location: "Hong Kong", type: "Full-time" },
  { title: "Treasury Analyst", dept: "Finance", location: "Dubai", type: "Full-time" },
  { title: "Backend Engineer - Rust", dept: "Engineering", location: "Remote", type: "Full-time" },
  { title: "Content Strategist", dept: "Marketing", location: "Remote", type: "Full-time" },
  { title: "Operations Manager", dept: "Operations", location: "Singapore", type: "Full-time" },
  { title: "Mobile Engineer - iOS", dept: "Engineering", location: "Singapore", type: "Full-time" },
]

const perks = [
  { icon: Zap, title: "Cutting-Edge Tech", desc: "Work with blockchain, distributed systems, and real-time trading infrastructure." },
  { icon: Globe, title: "Global Team", desc: "Collaborate with talented people across 10+ countries worldwide." },
  { icon: Heart, title: "Wellness Benefits", desc: "Comprehensive health insurance, mental health support, and fitness stipend." },
  { icon: Users, title: "Growth Culture", desc: "Learning budget, conference attendance, and clear career progression." },
]

export default function CareersPage() {
  const [dept, setDept] = useState("All")
  const [loc, setLoc] = useState("All Locations")
  const [search, setSearch] = useState("")

  const filtered = jobs.filter(j =>
    (dept === "All" || j.dept === dept) &&
    (loc === "All Locations" || j.location === loc) &&
    (search === "" || j.title.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1200px] px-4 py-12 text-center lg:py-20">
            <h1 className="text-3xl font-bold tracking-tight lg:text-5xl">Build the Future of Finance</h1>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground lg:text-base">Join a world-class team shaping the next generation of crypto trading and digital asset services.</p>
            <div className="mt-4 text-sm font-semibold text-primary">{jobs.length} Open Positions</div>
          </div>
        </section>

        {/* Perks */}
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-4 px-4 py-10 lg:grid-cols-4">
            {perks.map((p) => (
              <div key={p.title} className="rounded-xl border border-border bg-card p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <p.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Jobs */}
        <div className="mx-auto max-w-[1200px] px-4 py-8 lg:py-12">
          <h2 className="mb-6 text-xl font-bold">Open Positions</h2>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder="Search positions..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            </div>
            <select value={dept} onChange={(e) => setDept(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none">
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={loc} onChange={(e) => setLoc(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none">
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            {filtered.map((j) => (
              <Link key={j.title} href="/careers" className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30">
                <div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary">{j.title}</h3>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{j.dept}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{j.location}</span>
                    <span>{j.type}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
              </Link>
            ))}
            {filtered.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">No positions match your criteria.</div>}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
