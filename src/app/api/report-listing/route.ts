import { NextResponse } from "next/server"
import { cookies, headers } from "next/headers"
import { retrieveCustomer } from "@/lib/data/customer"

/**
 * Report a listing / seller / trade post (contracted MVP D11.2, "Report
 * item/account functionality").
 *
 * BEFORE THIS ROUTE EXISTED the report forms' onSubmit was literally
 * `console.log('Form Data:', data)` — the shopper saw a "Thank you!" panel and
 * the report went nowhere. There is no moderation queue and building one is not
 * worth it at this volume, so a report is delivered as EMAIL to the same
 * support inbox the "Contact Support" form uses, through the backend's
 * transactional sender (POST /store/support-requests). The email IS the record,
 * exactly as it is for support requests.
 *
 * Abuse posture — deliberate choices:
 *  - The recipient is NEVER taken from the client. The backend owns it
 *    (SUPPORT_REQUEST_INBOX, default support@catholicowned.com); this route
 *    does not accept, forward, or template any address.
 *  - `reason` is validated against a server-side allowlist, not free text.
 *  - The public link is REBUILT server-side from NEXT_PUBLIC_BASE_URL plus a
 *    validated same-origin path. A client-supplied absolute URL is ignored, so
 *    nobody can mail our support team a phishing link from our own sender.
 *  - Honeypot + hard length caps here; the backend adds the per-IP throttle
 *    (5 per 10 minutes), which is why the real client IP is forwarded.
 *  - The composed body is PLAIN TEXT. The backend HTML-escapes the `question`
 *    field exactly once before putting it in the email, so no reporter markup
 *    is ever echoed as HTML. Do NOT escape here as well — that would
 *    double-escape and mail out visible `&amp;` noise.
 *  - Sign-in is never required. If the visitor happens to be signed in we
 *    attach their identity so support can follow up and spot serial reporters.
 */

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || "https://catholicowned.com").replace(
  /\/+$/,
  ""
)

/**
 * Placeholder "from" address for an anonymous report. The backend's support
 * template requires a valid email and closes with "Reply directly to …"; an
 * unreachable address on our own domain is the honest stand-in, and the body
 * says in words that the reporter left no contact address.
 */
const NO_REPLY = "no-reply@catholicowned.com"

/** Server-side allowlist — the client cannot invent a reason string. */
const REASONS = [
  "Trademark, Copyright or DMCA Violation",
  "Counterfeit or misrepresented item",
  "Prohibited or offensive content",
  "Scam, fraud or suspicious behavior",
  "Something else",
] as const

const ENTITY_LABELS: Record<string, string> = {
  product: "Product listing",
  seller: "Shop / seller",
  trade: "Sacred Exchange (Trade) listing",
}

/**
 * Keep tab / newline / carriage return and everything from space up, minus
 * DEL. Drops the ASCII control characters that show up in header-injection
 * and log-poisoning payloads without mangling a legitimate multi-line
 * comment.
 */
const isPrintable = (code: number): boolean =>
  code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127)

const clean = (value: unknown, max: number): string =>
  String(value ?? "")
    // Strip ASCII control characters (header-injection and log-poisoning
    // shapes) but keep newlines, which a multi-line comment legitimately has.
    .split("")
    .map((ch) => (isPrintable(ch.charCodeAt(0)) ? ch : " "))
    .join("")
    .trim()
    .slice(0, max)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Accept only a same-origin path we produced ourselves. Rejects absolute URLs,
 * protocol-relative "//evil.com", and backslash tricks.
 */
const safePath = (value: unknown): string => {
  const p = clean(value, 300)
  if (!p.startsWith("/") || p.startsWith("//") || p.includes("\\")) return ""
  if (!/^\/[A-Za-z0-9\-._~/%]*$/.test(p)) return ""
  return p
}

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 })
  }

  // Honeypot — a real person never sees this field.
  if (clean(body.website, 10)) {
    // Answer like a success so a bot learns nothing; nothing is sent.
    return NextResponse.json({ ok: true })
  }

  const entityType = clean(body.entity_type, 20).toLowerCase()
  if (!ENTITY_LABELS[entityType]) {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 })
  }

  const reason = clean(body.reason, 120)
  if (!REASONS.includes(reason as (typeof REASONS)[number])) {
    return NextResponse.json(
      { message: "Please choose a reason for the report." },
      { status: 400 }
    )
  }

  const comment = clean(body.comment, 4000)
  if (comment.length < 5) {
    return NextResponse.json(
      { message: "Please tell us a little more about the problem." },
      { status: 400 }
    )
  }

  const entityId = clean(body.entity_id, 120)
  const entityTitle = clean(body.entity_title, 160) || "(untitled)"
  const path = safePath(body.entity_path)
  const link = path ? `${BASE_URL}${path}` : "(no public link available)"

  const providedEmail = clean(body.reporter_email, 200)
  const reporterEmail = EMAIL_RE.test(providedEmail) ? providedEmail : ""

  // Signed-in identity, if there is one. Never required, and a failure here
  // must not block the report. The cookie check first so an anonymous report
  // doesn't spend a guaranteed-401 round trip on /store/customers/me.
  let accountLine = "Not signed in"
  let accountEmail = ""
  try {
    const signedIn = Boolean((await cookies()).get("_medusa_jwt")?.value)
    const customer = signedIn ? await retrieveCustomer() : null
    if (customer) {
      accountEmail = customer.email || ""
      const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ")
      accountLine = `${name || "(no name)"} <${accountEmail || "no email"}> · ${customer.id}`
    }
  } catch {
    accountLine = "Not signed in (identity lookup failed)"
  }

  const replyTo = reporterEmail || accountEmail || ""
  const reporterLabel = replyTo || "Anonymous reporter"

  const question = [
    `A shopper reported a ${ENTITY_LABELS[entityType].toLowerCase()}.`,
    "",
    `What was reported: ${ENTITY_LABELS[entityType]}`,
    `Title: ${entityTitle}`,
    `Id: ${entityId || "(unknown)"}`,
    `Link: ${link}`,
    "",
    `Reason: ${reason}`,
    "",
    "What the reporter wrote:",
    comment,
    "",
    `Reporter contact: ${replyTo || "none given — do not reply to the address above"}`,
    `Signed-in account: ${accountLine}`,
  ].join("\n")

  // The backend's schema is the "Contact Support" one. `name` carries a
  // [REPORT] prefix so support can filter these out of the support inbox by
  // subject, and `business_name` carries what was reported — the subject then
  // reads: "Support request from [REPORT] … (<listing title>)".
  const payload = {
    name: clean(`[REPORT] ${reporterLabel}`, 120),
    business_name: entityTitle,
    email: replyTo || NO_REPLY,
    question,
    context: clean(`Abuse report · ${entityType} · ${entityId}`, 300),
    website: "",
  }

  const forwarded = (await headers()).get("x-forwarded-for") || ""

  try {
    const res = await fetch(`${BACKEND_URL}/store/support-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
        // Let the backend throttle by the real reporter, not by our server.
        "x-forwarded-for": forwarded,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      console.error(`[report-listing] backend ${res.status} for ${entityType} ${entityId}`)
      return NextResponse.json(
        {
          message:
            (data as { message?: string })?.message ||
            "We couldn't send your report. Please try again.",
        },
        { status: res.status }
      )
    }
    console.log(`[report-listing] ${entityType} ${entityId} reported (${reason})`)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[report-listing] forward failed", e)
    return NextResponse.json(
      {
        message:
          "We couldn't reach our support system, so your report was not sent. Please try again in a moment, or email support@catholicowned.com.",
      },
      { status: 502 }
    )
  }
}
