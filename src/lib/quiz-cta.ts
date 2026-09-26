/**
 * The single source of the "Take the Quiz" button look.
 *
 * Two places render that button and Brooke asked (25 Sep 2026) for them to
 * match: the in-page quiz bars that close every section of /sell, and the
 * header CTA at the top right of that same page (ForBusinessLink).
 *
 * Colour and typography only — deliberately no padding, width or font size,
 * so each caller keeps its own sizing (the header button has to stay compact
 * next to the cart and account icons, the in-page bar is a big target).
 * Change the gold here and both move together.
 */
export const QUIZ_CTA_LOOK =
  "font-serif font-bold uppercase bg-[#D6A82B] text-[#001435] hover:bg-[#E8BE45] rounded-sm transition-colors"

/** The wording both buttons use. */
export const QUIZ_CTA_LABEL = "Take the Quiz"
