"use client"

import { useEffect, useState } from "react"
import { DirectoryListingForm } from "@/components/sections/DirectoryManagement/DirectoryListingForm"
import { DirectoryCategory, Parish } from "@/types/directory"
import {
  createDirectoryListing,
  addParishAffiliation,
} from "@/lib/data/directory-actions"
import { retrieveVendorStatus } from "@/lib/data/vendor"

export default function CreateDirectoryListingPage() {
  const [categories, setCategories] = useState<DirectoryCategory[]>([])
  // Parish picks made on the create form before the listing exists. Applied
  // right after the listing is created (see handleSubmit).
  const [selectedParishes, setSelectedParishes] = useState<Parish[]>([])

  useEffect(() => {
    const backendUrl =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    fetch(`${backendUrl}/store/directory/categories`, {
      headers: {
        "x-publishable-api-key":
          process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
      },
    })
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {})
  }, [])

  const handleSubmit = async (data: Record<string, unknown>) => {
    const res = await createDirectoryListing(data)
    if (!res.ok) {
      throw new Error(res.error || "Failed to create listing")
    }

    // Apply any parish picks made on the create form now that the listing
    // exists. Best-effort: the listing is already saved, so a failed
    // affiliation shouldn't block navigation — the merchant can retry from the
    // Edit form (where parish also lives). The create-form limit is 1, which
    // is within every plan's cap, so this normally attaches cleanly.
    for (const parish of selectedParishes) {
      await addParishAffiliation(res.listing.id, parish.id).catch(() => {})
    }

    // Where next depends on WHO created (7/9 fix — this used to bounce
    // everyone to the vendor dashboard):
    //  - Merchants arrive via the setup-checklist handoff; send them back to
    //    the dashboard so the checklist reflects the new listing.
    //  - A plain Business Owner has no vendor login — send them to the
    //    membership picker, the natural next step for a pending listing.
    // Cross-origin nav for the vendor app, so window.location either way.
    const { isVendor } = await retrieveVendorStatus().catch(() => ({
      isVendor: false,
    }))
    if (isVendor) {
      const vendorUrl =
        process.env.NEXT_PUBLIC_VENDOR_URL || "http://localhost:5173"
      window.location.assign(`${vendorUrl}/dashboard`)
    } else {
      const seg = window.location.pathname.split("/").filter(Boolean)
      const locale = seg[0] || "us"
      window.location.assign(`/${locale}/user/directory/subscription`)
    }
  }

  return (
    <main className="container py-8">
      <h1 className="heading-xl uppercase mb-6">Create Directory Listing</h1>
      <div className="max-w-3xl">
        <DirectoryListingForm
          categories={categories}
          onSubmit={handleSubmit}
          submitLabel="Create Listing"
          onParishSelectionsChange={setSelectedParishes}
        />
      </div>
    </main>
  )
}
