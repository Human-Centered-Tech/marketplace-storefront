import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import footerLinks from "@/data/footerLinks"

// Footer links are mostly in-app (locale-prefixed). External/contact paths
// (mailto:, tel:, http) must render as a plain <a> — routing them through
// LocalizedClientLink would produce "/us/mailto:…" and break them.
const isExternalPath = (p: string) => /^(mailto:|tel:|https?:\/\/)/.test(p)

function FooterLink({ path, label }: { path: string; label: string }) {
  const className =
    "block text-[14px] text-white/80 hover:text-white transition-colors"
  if (isExternalPath(path)) {
    const newTab = /^https?:\/\//.test(path)
    return (
      <a
        href={path}
        className={className}
        {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {label}
      </a>
    )
  }
  return (
    <LocalizedClientLink href={path} className={className}>
      {label}
    </LocalizedClientLink>
  )
}

export function Footer() {
  return (
    <footer className="bg-navy-dark text-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <h2 className="font-serif text-xl font-semibold mb-3">
              Catholic Owned<span className="text-[0.7em] align-top ml-[1px]">&reg;</span>
            </h2>
            <p className="text-[14px] leading-relaxed text-white/70 max-w-sm">
              Promoting holiness through commerce by connecting faithful merchants
              with intentional consumers.
            </p>
          </div>

          {/* Marketplace Column */}
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] mb-4 text-white/50">
              Marketplace
            </h3>
            <nav className="space-y-2.5" aria-label="Marketplace navigation">
              {footerLinks.marketplace.map(({ label, path }) => (
                <FooterLink key={label} path={path} label={label} />
              ))}
            </nav>
          </div>

          {/* For Businesses Column */}
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] mb-4 text-white/50">
              For Businesses
            </h3>
            <nav className="space-y-2.5" aria-label="For Businesses navigation">
              {footerLinks.forBusinesses.map(({ label, path }) => (
                <FooterLink key={label} path={path} label={label} />
              ))}
            </nav>
          </div>

          {/* Connect Column */}
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] mb-4 text-white/50">
              Connect
            </h3>
            <nav className="space-y-2.5" aria-label="Connect navigation">
              {footerLinks.connect.map(({ label, path }) => (
                <FooterLink key={label} path={path} label={label} />
              ))}
            </nav>
          </div>

          {/* Legal Column (moved to last) */}
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] mb-4 text-white/50">
              Legal
            </h3>
            <nav className="space-y-2.5" aria-label="Legal navigation">
              {footerLinks.legal.map(({ label, path }) => (
                <FooterLink key={label} path={path} label={label} />
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10">
          <p className="text-[13px] text-white/40 text-center">
            &copy; {new Date().getFullYear()} Catholic Owned, PBC
          </p>
        </div>
      </div>
    </footer>
  )
}
