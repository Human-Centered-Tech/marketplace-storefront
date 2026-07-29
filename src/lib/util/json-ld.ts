/**
 * Serialize a value for embedding inside a `<script type="application/ld+json">`
 * block.
 *
 * `JSON.stringify` alone is NOT safe here. It escapes quotes and backslashes,
 * but it does not touch `<` or `>` — so any string in the payload can close the
 * script element and start live markup. Our JSON-LD carries vendor-supplied
 * product titles, which means an approved vendor could name a product
 *
 *     </script><img src=x onerror=…>
 *
 * and get stored XSS on the storefront origin for every shopper who loads a page
 * that product appears on. (Security review 2026-07-28, finding S-H1.)
 *
 * The escapes below keep the output valid JSON — `\\u003c` parses back to `<` — so
 * Google and other structured-data consumers still read the intended values. The
 * HTML parser, which does not interpret JSON escapes, never sees a closing tag.
 *
 * U+2028 / U+2029 are escaped too: they are legal inside a JSON string but are
 * line terminators in JavaScript source, so an unescaped one truncates the
 * script block. They are matched via `\\u2028` escapes rather than the literal
 * characters — a regex literal containing a raw line terminator does not even
 * parse ("Unterminated regular expression").
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029")
}
