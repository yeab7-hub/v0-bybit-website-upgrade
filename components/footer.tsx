import Link from "next/link"

const footerSections = [
  {
    title: "About",
    links: [
      { label: "About Bybit", href: "/about" },
      { label: "Careers", href: "/about" },
      { label: "Press", href: "/about" },
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
      { label: "API", href: "/about" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/support" },
      { label: "Fees", href: "/terms" },
      { label: "Trading Rules", href: "/terms" },
      { label: "Announcements", href: "/support" },
      { label: "Submit a Request", href: "/support" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f7a600]">
                <span className="text-sm font-bold text-[#0a0e17]">B</span>
              </div>
              <span className="text-xl font-bold text-foreground">Bybit</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Trade smarter with next-generation tools, institutional-grade
              security, and deep liquidity.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">
            Bybit 2026. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/terms"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              href="/cookies"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
