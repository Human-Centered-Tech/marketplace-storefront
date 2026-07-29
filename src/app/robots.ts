import { MetadataRoute } from "next"

// Crawl-excluded paths (7/28). Every directory listing links to the claim
// funnel with ?claim_listing=<id>; a link-following crawler that executes JS
// walked all ~4,500 of them, and each visit used to mint a claim-intent row.
// These are transactional signup paths with nothing to index anyway — a
// well-behaved crawler stops here, and the funnel's own engagement gate
// handles the ones that don't.
const DISALLOWED = [
  "/sell/onboarding",
  "/user/register",
  "/user/become-vendor",
]

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_BASE_URL
  const rules = [{ userAgent: "*", allow: "/", disallow: DISALLOWED }]

  if (base) {
    return {
      rules,
      sitemap: `${base.replace(/\/$/, "")}/sitemap.xml`,
    }
  }

  return { rules }
}
