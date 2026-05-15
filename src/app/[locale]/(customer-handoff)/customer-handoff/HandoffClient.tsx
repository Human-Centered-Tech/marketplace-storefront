"use client"

import { acceptCustomerHandoff } from "@/lib/data/customer"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function HandoffClient() {
  const router = useRouter()
  const [error, setError] = useState(false)

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "")
    if (!hash) {
      setError(true)
      return
    }

    const params = new URLSearchParams(hash)
    const token = params.get("handoff")
    if (!token) {
      setError(true)
      return
    }

    // Same-origin path only — never an absolute URL — so callers can't
    // weaponize the handoff into an open-redirect.
    const rawReturnTo = params.get("return_to")
    const returnTo =
      rawReturnTo && rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//")
        ? rawReturnTo
        : "/"

    window.history.replaceState(null, "", window.location.pathname)

    acceptCustomerHandoff(token)
      .then(() => {
        router.replace(returnTo)
      })
      .catch(() => {
        setError(true)
      })
  }, [router])

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-gray-600">
          Unable to sign you in automatically.
        </p>
        <a href="/user" className="text-sm font-medium text-blue-600 hover:underline">
          Go to login
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      <p className="text-sm text-gray-600">Signing you in...</p>
    </div>
  )
}
