import Link from "next/link"
import { BybitLogo } from "@/components/bybit-logo"

const sections = [
  {
    title: "About",
    links: [
      { label: "About Bybit", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Announcements", href: "/announcements" },
      { label: "Security", href: "/security-info" },
      { label: "Affiliates", href: "/affiliates" },
    ],
  },
  {
    title: "Products",
    links: [
      { label: "Spot Trading", href: "/trade" },
      { label: "Derivatives", href: "/derivatives" },
      { label: "Copy Trading", href: "/copy-trading" },
      { label: "Trading Bots", href: "/trading-bots" },
      { label: "Earn", href: "/earn" },
      { label: "Launchpad", href: "/launchpad" },
      { label: "Launchpool", href: "/launchpool" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Buy Crypto", href: "/buy-crypto" },
      { label: "P2P Trading", href: "/p2p" },
      { label: "Convert", href: "/convert" },
      { label: "Markets", href: "/markets" },
      { label: "Bybit Card", href: "/card" },
      { label: "Institutional", href: "/institutional" },
      { label: "Web3", href: "/web3" },
      { label: "NFT", href: "/nft" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/support" },
      { label: "Fee Schedule", href: "/fee-schedule" },
      { label: "Trading Rules", href: "/trading-rules" },
      { label: "API Documentation", href: "/api-docs" },
      { label: "Referral Program", href: "/referral" },
      { label: "Rewards Hub", href: "/rewards" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Bybit Learn", href: "/learn" },
      { label: "What is Bitcoin?", href: "/learn" },
      { label: "How to Trade Crypto", href: "/learn" },
      { label: "DeFi Guide", href: "/learn" },
    ],
  },
]

const socials = [
  { name: "Twitter", href: "#", icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { name: "Telegram", href: "#", icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg> },
  { name: "Discord", href: "#", icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20.317 4.37a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.74 19.74 0 003.677 4.37a.07.07 0 00-.032.028C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.11 13.11 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 01.078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.099.246.198.373.292a.077.077 0 01-.006.127 12.3 12.3 0 01-1.873.892.076.076 0 00-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 00.084.028 19.84 19.84 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.332-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.332-.946 2.418-2.157 2.418z"/></svg> },
  { name: "YouTube", href: "#", icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
  { name: "LinkedIn", href: "#", icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
  { name: "Reddit", href: "#", icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg> },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1400px] px-4 py-10 lg:py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <BybitLogo className="h-5" />
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted-foreground">
              Trade smarter with institutional-grade security, deep liquidity, and lightning-fast execution.
            </p>
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-muted-foreground transition-colors hover:text-primary"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {sections.map((sec) => (
            <div key={sec.title}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">{sec.title}</h3>
              <ul className="flex flex-col gap-2">
                {sec.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-xs text-muted-foreground transition-colors hover:text-foreground">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row">
          <span>{"© 2026 Bybit. All rights reserved."}</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/cookies" className="hover:text-foreground">Cookie Policy</Link>
            <Link href="/fee-schedule" className="hover:text-foreground">Fees</Link>
            <Link href="/trading-rules" className="hover:text-foreground">Trading Rules</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
