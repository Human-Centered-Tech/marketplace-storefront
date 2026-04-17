"use client"

import { useSearchParams } from "next/navigation"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

const TIER_NAMES: Record<string, string> = {
  verified: "Verified",
  featured: "Featured",
  enterprise: "Enterprise",
}

export default function DirectorySuccessPage() {
  const searchParams = useSearchParams()
  const tier = searchParams.get("tier") || "verified"
  const tierName = TIER_NAMES[tier] || "Verified"

  return (
    <main className="container py-16">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <span
            className="material-symbols-outlined text-green-600 text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>

        <h1 className="font-serif text-3xl lg:text-4xl font-bold text-navy-dark mb-3">
          Welcome to Catholic Owned!
        </h1>
        <p className="text-secondary text-lg mb-2">
          Your <span className="font-medium text-primary">{tierName}</span>{" "}
          subscription is now active.
        </p>
        <p className="text-secondary mb-12">
          You&apos;re all set to start listing your business and products in the
          marketplace.
        </p>

        {/* Next Steps */}
        <div className="text-left bg-[#FAF9F5] rounded-xl p-8 mb-10">
          <h2 className="text-[10px] font-bold text-gold-dark tracking-[0.2em] uppercase mb-6">
            Next Steps
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-navy-dark text-white flex items-center justify-center text-sm font-bold shrink-0">
                1
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-navy-dark mb-1">
                  Complete Your Directory Listing
                </h3>
                <p className="text-sm text-secondary mb-3">
                  Add your business details, hours, owner interview, and
                  devotional image to make your listing stand out.
                </p>
                <LocalizedClientLink
                  href="/user/directory/edit"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-gold-dark hover:text-navy-dark transition-colors"
                >
                  Edit Your Listing
                  <span className="material-symbols-outlined text-base">
                    arrow_forward
                  </span>
                </LocalizedClientLink>
              </div>
            </div>

            <div className="border-t border-gray-200" />

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-navy-dark text-white flex items-center justify-center text-sm font-bold shrink-0">
                2
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-navy-dark mb-1">
                  Add Your First Product
                </h3>
                <p className="text-sm text-secondary mb-3">
                  Head to your vendor dashboard to add products, set pricing, and
                  configure shipping.
                </p>
                <a
                  href="/api/vendor-handoff"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-gold-dark hover:text-navy-dark transition-colors"
                >
                  Open Vendor Dashboard
                  <span className="material-symbols-outlined text-base">
                    arrow_forward
                  </span>
                </a>
              </div>
            </div>

            <div className="border-t border-gray-200" />

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-navy-dark/20 text-navy-dark flex items-center justify-center text-sm font-bold shrink-0">
                3
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-navy-dark mb-1">
                  Add Parish Affiliation
                </h3>
                <p className="text-sm text-secondary mb-3">
                  Connect your business to your parish community. Your{" "}
                  {tierName.toLowerCase()} plan supports{" "}
                  {tier === "enterprise"
                    ? "up to 10"
                    : tier === "featured"
                    ? "up to 3"
                    : "1"}{" "}
                  parish affiliation{tier !== "verified" ? "s" : ""}.
                </p>
                <LocalizedClientLink
                  href="/user/directory"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-gold-dark hover:text-navy-dark transition-colors"
                >
                  Manage Listing
                  <span className="material-symbols-outlined text-base">
                    arrow_forward
                  </span>
                </LocalizedClientLink>
              </div>
            </div>
          </div>
        </div>

        <LocalizedClientLink
          href="/"
          className="text-sm text-secondary hover:text-primary transition-colors"
        >
          ← Back to Catholic Owned
        </LocalizedClientLink>
      </div>
    </main>
  )
}
