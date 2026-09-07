"use client"

import { Button } from "@/components/atoms"
import { useState } from "react"
import { Modal } from "../Modal/Modal"
import { ReportListingForm } from "../ReportListingForm/ReportListingForm"
import { ReportTarget } from "../ReportListingForm/ReportForm"

/**
 * "Report listing" on a product page. The target is required so the email that
 * lands in the support inbox says WHICH listing was reported — the old version
 * took no props at all and the form logged to the console.
 */
export const ProductReportButton = ({
  productId,
  productTitle,
  productHandle,
}: {
  productId: string
  productTitle: string
  productHandle: string
}) => {
  const [openModal, setOpenModal] = useState(false)
  const target: ReportTarget = {
    type: "product",
    id: productId,
    title: productTitle,
    path: `/products/${productHandle}`,
  }
  return (
    <>
      <Button
        className="uppercase label-md"
        variant="tonal"
        onClick={() => setOpenModal(true)}
      >
        Report listing
      </Button>
      {openModal && (
        <Modal heading="Report listing" onClose={() => setOpenModal(false)}>
          <ReportListingForm
            target={target}
            onClose={() => setOpenModal(false)}
          />
        </Modal>
      )}
    </>
  )
}
