import Link from "next/link"
import { ArrowUpIcon } from "@/icons"
import { Metadata } from "next"
import { NotFoundReporter } from "@/components/sections/Analytics/NotFoundReporter"

export const metadata: Metadata = {
  title: "404",
  description: "Something went wrong",
}

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center py-24">
      <NotFoundReporter />
      <h1 className="text-2xl-semi text-ui-fg-base">Page not found</h1>
      <p className="text-small-regular text-ui-fg-base">
        The page you tried to access does not exist.
      </p>
      {/* Root not-found renders OUTSIDE the [locale] segment, so the locale
          param is undefined here — LocalizedClientLink would build "/undefined/"
          and dead-end on another 404. Link straight to the default-region home. */}
      <Link className="flex gap-x-1 items-center group" href="/us">
        Go to frontpage
        <ArrowUpIcon
          className="group-hover:rotate-45 ease-in-out duration-150"
          color="var(--fg-interactive)"
        />
      </Link>
    </div>
  )
}
