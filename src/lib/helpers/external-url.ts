/**
 * Directory listings store user-entered websites that often lack a
 * protocol ("www.example.com"). Rendered raw in an href, the browser
 * resolves them relative to the current page → /us/directory/www.example.com
 * 404s (Sentry JAVASCRIPT-NEXTJS-4). Prefix https:// unless the value is
 * already absolute or an internal path.
 */
export const normalizeExternalUrl = (
  url: string | null | undefined
): string | null => {
  const trimmed = url?.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith("//")) return `https:${trimmed}`
  if (trimmed.startsWith("/")) return trimmed // internal path
  return `https://${trimmed}`
}
