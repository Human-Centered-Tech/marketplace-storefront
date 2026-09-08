"use client"

import { ReportForm, ReportTarget } from "./ReportForm"

/**
 * Report a listing (a product, or a Sacred Exchange / Trade post).
 *
 * Thin wrapper over ReportForm, which does the real work: POST to
 * /api/report-listing → the backend's transactional sender → the support
 * inbox. Before 9/7 this component's onSubmit was `console.log(...)`, so every
 * report a shopper filed was thrown away behind a "Thank you!" panel.
 *
 * `target` is required — a report with no idea what it is about is worthless
 * to whoever reads the inbox.
 */
export const ReportListingForm = ({
  target,
  onClose,
}: {
  target: ReportTarget
  onClose: () => void
}) => (
  <ReportForm target={target} onClose={onClose} submitLabel="Report listing" />
)
