// Free-form social links: merchants paste any URL and we detect the platform
// from its host to show the right brand logo (see SocialIcon). Up to 3 links.

export type SocialKey =
  | "instagram"
  | "facebook"
  | "x"
  | "linkedin"
  | "youtube"
  | "tiktok"
  | "pinterest"
  | "threads"
  | "whatsapp"
  | "telegram"
  | "link"

const RULES: { key: SocialKey; label: string; test: RegExp }[] = [
  { key: "instagram", label: "Instagram", test: /instagram\.com/i },
  {
    key: "facebook",
    label: "Facebook",
    test: /(facebook\.com|fb\.com|fb\.me)/i,
  },
  { key: "x", label: "X (Twitter)", test: /(twitter\.com|x\.com)/i },
  { key: "linkedin", label: "LinkedIn", test: /linkedin\.com/i },
  { key: "youtube", label: "YouTube", test: /(youtube\.com|youtu\.be)/i },
  { key: "tiktok", label: "TikTok", test: /tiktok\.com/i },
  { key: "pinterest", label: "Pinterest", test: /pinterest\./i },
  { key: "threads", label: "Threads", test: /threads\.(net|com)/i },
  { key: "whatsapp", label: "WhatsApp", test: /(whatsapp\.com|wa\.me)/i },
  { key: "telegram", label: "Telegram", test: /(t\.me|telegram\.(me|org))/i },
]

// Detect the platform (and a human label) from a URL. Unknown hosts fall back
// to a generic "link" so a niche platform still renders something.
export function socialFromUrl(url: string): { key: SocialKey; label: string } {
  const u = (url || "").trim()
  for (const r of RULES)
    if (r.test.test(u)) return { key: r.key, label: r.label }
  return { key: "link", label: "Link" }
}

// Normalize stored social_links into a flat array of URLs. Handles the new
// shape ({ links: [...] } or a bare array) AND the legacy keyed object
// ({ facebook, instagram, twitter, linkedin }) so existing listings keep
// working with no data migration.
export function socialLinksToArray(social: unknown): string[] {
  if (!social) return []
  const keep = (arr: unknown[]) =>
    arr.filter((s): s is string => typeof s === "string" && s.trim().length > 0)
  if (Array.isArray(social)) return keep(social)
  const obj = social as Record<string, unknown>
  if (Array.isArray(obj.links)) return keep(obj.links)
  return keep(
    ["facebook", "instagram", "twitter", "linkedin"].map((k) => obj[k])
  )
}
