import Link from "next/link"
import { BybitLogo } from "@/components/bybit-logo"

const sections = [
  {
    title: "About",
    links: [
      { label: "About Bybit", href: "/about" },
      { label: "Careers", href: "/about" },
      { label: "Blog", href: "/about" },
      { label: "Community", href: "/about" },
    ],
  },
  {
    title: "Products",
    links: [
      { label: "Spot Trading", href: "/trade" },
      { label: "Derivatives", href: "/trade" },
      { label: "Earn", href: "/earn" },
      { label: "Copy Trading", href: "/trade" },
      { label: "Launchpad", href: "/finance" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Buy Crypto", href: "/buy-crypto" },
      { label: "P2P Trading", href: "/buy-crypto" },
      { label: "Institutional", href: "/finance" },
      { label: "VIP Services", href: "/finance" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/support" },
      { label: "Fees", href: "/terms" },
      { label: "Trading Rules", href: "/terms" },
      { label: "Announcements", href: "/support" },
    ],
  },
]

const socials = [
  { name: "Twitter", href: "#", icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { name: "Telegram", href: "#", icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg> },
  { name: "Discord", href: "#", icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20.317 4.37a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.74 19.74 0 003.677 4.37a.07.07 0 00-.032.028C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.11 13.11 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 01.078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.099.246.198.373.292a.077.077 0 01-.006.127 12.3 12.3 0 01-1.873.892.076.076 0 00-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 00.084.028 19.84 19.84 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.332-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.332-.946 2.418-2.157 2.418z"/></svg> },
  { name: "YouTube", href: "#", icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1400px] px-4 py-10 lg:py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <BybitLogo className="h-5" />
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted-foreground">
              Trade smarter with institutional-grade security, deep liquidity, and lightning-fast execution.
            </p>
            <div className="mt-4 flex items-center gap-2">
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
          <span>&copy; 2026 Bybit. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/cookies" className="hover:text-foreground">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
