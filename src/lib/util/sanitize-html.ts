import DOMPurify from "isomorphic-dompurify"

// Vendor-supplied product descriptions are rendered with dangerouslySetInnerHTML
// (rich text from the admin editor). Without sanitization an approved vendor
// could inject <script> / event handlers that run in the storefront origin for
// every shopper. Run all such HTML through this allowlist first.
//
// isomorphic-dompurify works in both the server components (SSR) and the
// "use client" components that render product copy, so one helper covers both.

// Force every link that opens a new tab to drop window.opener access and not
// leak the referrer — applied once at module load (DOMPurify is a singleton).
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
    node.setAttribute("rel", "noopener noreferrer")
  }
})

const CONFIG = {
  // Formatting tags a product description legitimately needs. Anything not
  // listed (script, iframe, object, embed, form, style, etc.) is stripped.
  ALLOWED_TAGS: [
    "p", "br", "hr", "span", "div",
    "b", "strong", "i", "em", "u", "s", "sub", "sup", "mark", "small",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li",
    "blockquote", "pre", "code",
    "a", "img",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td",
  ],
  ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel", "class"],
  // DOMPurify blocks javascript:/vbscript: and other dangerous URIs by default;
  // this also keeps data: URIs out of href/src (still allowed for inline imgs).
  ALLOW_DATA_ATTR: false,
}

export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return ""
  return DOMPurify.sanitize(dirty, CONFIG)
}
