import "server-only"

/**
 * Whether a customer must verify their email before reaching the account
 * dashboard. Mirrors the backend (lib/email-verification.ts):
 *   - verified                -> false
 *   - created before cutoff   -> false (grandfathered)
 *   - unknown created_at      -> false (don't risk a lockout)
 *   - otherwise               -> true
 *
 * EMAIL_VERIFICATION_ENFORCED_AFTER must match the backend value (set it to
 * the go-live moment per environment). Empty string gates all unverified.
 * Server-only: read from a server env, never exposed to the client.
 */
const ENFORCED_AFTER =
  process.env.EMAIL_VERIFICATION_ENFORCED_AFTER ?? "2026-05-27T00:00:00Z"

type CustomerLike = {
  created_at?: string | null
  metadata?: Record<string, unknown> | null
} | null | undefined

export function requiresEmailVerification(customer: CustomerLike): boolean {
  if (!customer) return false
  if ((customer.metadata as any)?.email_verified === true) return false

  if (!ENFORCED_AFTER) return true
  const cutoff = new Date(ENFORCED_AFTER).getTime()
  if (Number.isNaN(cutoff)) return true

  const created = customer.created_at
    ? new Date(customer.created_at).getTime()
    : null
  if (created == null || Number.isNaN(created)) return false

  return created >= cutoff
}
