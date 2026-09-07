"use client"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { trackButtonClick } from "@/lib/analytics"

/**
 * The "Take the Quiz" button that ends every section of /sell. A client
 * island only so the click can be counted: button_click on the sales page
 * with metadata.button = "take_the_quiz" and metadata.placement = which bar
 * (professionals / local / merchant / enterprise / closing), so we can see
 * which section actually moves people into the quiz.
 */
export function QuizCta({
  href,
  placement,
  className,
  children,
}: {
  href: string
  placement: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <LocalizedClientLink
      href={href}
      className={className}
      onClick={() => trackButtonClick("sales_page", "sell", "take_the_quiz", { placement })}
    >
      {children}
    </LocalizedClientLink>
  )
}
