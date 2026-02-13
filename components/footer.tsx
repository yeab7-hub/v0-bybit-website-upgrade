import Link from "next/link"

const footerSections = [
  {
    title: "About",
    links: [
      { label: "About Tryd", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Community", href: "#" },
    ],
  },
  {
    title: "Products",
    links: [
      { label: "Spot Trading", href: "/trade" },
      { label: "Derivatives", href: "/trade" },
      { label: "Earn", href: "#" },
      { label: "Copy Trading", href: "#" },
      { label: "Launchpad", href: "#" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Buy Crypto", href: "#" },
      { label: "P2P Trading", href: "#" },
      { label: "Institutional", href: "#" },
      { label: "VIP Services", href: "#" },
      { label: "API", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Fees", href: "#" },
      { label: "Trading Rules", href: "#" },
      { label: "Announcements", href: "#" },
      { label: "Submit a Request", href: "#" },
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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">T</span>
              </div>
              <span className="text-xl font-bold text-foreground">Tryd</span>
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
            Tryd&trade; 2026. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
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
