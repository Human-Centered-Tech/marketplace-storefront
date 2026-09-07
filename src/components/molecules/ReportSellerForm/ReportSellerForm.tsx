"use client"

import { ReportForm } from "../ReportListingForm/ReportForm"

/**
 * Report a shop / seller ("Report account" half of contracted MVP D11.2).
 *
 * Same story as ReportListingForm: this used to `console.log` the report and
 * show a thank-you. It now goes through /api/report-listing to the support
 * inbox, and only claims success once the server confirms delivery.
 */
export const ReportSellerForm = ({
  seller,
  onClose,
}: {
  seller: { id: string; name: string; handle: string }
  onClose: () => void
}) => (
  <ReportForm
    target={{
      type: "seller",
      id: seller.id,
      title: seller.name,
      path: `/sellers/${seller.handle}`,
    }}
    onClose={onClose}
    submitLabel="Report seller"
  />
)
