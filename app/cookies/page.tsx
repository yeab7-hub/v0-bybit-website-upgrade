import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const cookieTypes = [
  {
    name: "Essential Cookies",
    required: true,
    desc: "These cookies are necessary for the Platform to function properly. They enable core functionality such as security, session management, and accessibility. You cannot opt out of essential cookies.",
    examples: ["Session authentication", "Security tokens (CSRF protection)", "Load balancing", "Cookie consent preferences"],
  },
  {
    name: "Performance Cookies",
    required: false,
    desc: "These cookies help us understand how visitors interact with the Platform by collecting and reporting information anonymously. They help us improve the Platform's performance.",
    examples: ["Page load times", "Error tracking", "Feature usage analytics", "Server response times"],
  },
  {
    name: "Functional Cookies",
    required: false,
    desc: "These cookies enable enhanced functionality and personalization, such as remembering your preferences, language, and region settings.",
    examples: ["Language preferences", "Theme preferences (dark/light mode)", "Trading pair preferences", "Dashboard layout settings"],
  },
  {
    name: "Analytics Cookies",
    required: false,
    desc: "These cookies collect information about how you use the Platform to help us improve our services and user experience.",
    examples: ["Number of visitors", "Pages visited", "Time spent on pages", "Navigation patterns"],
  },
]

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12 lg:px-6 lg:py-20">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground lg:text-4xl">Cookie Policy</h1>
          <p className="mt-2 text-muted-foreground">Last updated: February 14, 2026</p>
        </div>

        <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            This Cookie Policy explains how Tryd uses cookies and similar technologies to recognize you
            when you visit our platform. It explains what these technologies are and why we use them,
            as well as your rights to control our use of them.
          </p>
        </div>

        <div className="space-y-8">
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-3 text-lg font-bold text-foreground">What Are Cookies?</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Cookies are small text files that are placed on your device when you visit a website.
              They are widely used to make websites work more efficiently, provide reporting information,
              and assist with personalizing the user experience. Cookies set by the website owner are
              called &quot;first-party cookies&quot;. Cookies set by parties other than the website owner are
              called &quot;third-party cookies&quot;.
            </p>
          </section>

          {/* Cookie types */}
          <div>
            <h2 className="mb-4 text-2xl font-bold text-foreground">Types of Cookies We Use</h2>
            <div className="space-y-4">
              {cookieTypes.map((ct) => (
                <div key={ct.name} className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="text-lg font-bold text-foreground">{ct.name}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      ct.required ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                    }`}>
                      {ct.required ? "Required" : "Optional"}
                    </span>
                  </div>
                  <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{ct.desc}</p>
                  <div className="rounded-lg bg-secondary/30 p-3">
                    <span className="mb-2 block text-xs font-medium text-muted-foreground">Examples:</span>
                    <ul className="space-y-1">
                      {ct.examples.map((ex) => (
                        <li key={ex} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="h-1 w-1 rounded-full bg-primary" />{ex}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-3 text-lg font-bold text-foreground">Managing Cookies</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Most web browsers allow you to control cookies through their settings. You can set your
              browser to refuse cookies, delete existing cookies, or alert you when a website tries to
              set a cookie. Please note that disabling cookies may affect the functionality of the Platform.
              Essential cookies cannot be disabled as they are necessary for the Platform to operate.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-3 text-lg font-bold text-foreground">Updates to This Policy</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We may update this Cookie Policy from time to time to reflect changes in technology,
              legislation, or our business practices. Any changes will be posted on this page with an
              updated revision date. We encourage you to check this page periodically for the latest
              information on our cookie practices.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
