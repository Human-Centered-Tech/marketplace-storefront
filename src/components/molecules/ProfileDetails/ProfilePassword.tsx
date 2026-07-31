"use client"

import { Button } from "@/components/atoms"
import { Card } from "@/components/atoms/Card/Card"
import { InfoIcon } from "@/icons"
import { Divider, Heading } from "@medusajs/ui"
import { useState } from "react"
import { Modal } from "../Modal/Modal"
// import { ProfilePasswordForm } from "../ProfilePasswordForm/ProfilePasswordForm"
import { HttpTypes } from "@medusajs/types"
import { sendResetPasswordEmail } from "@/lib/data/customer"
import { toast } from "@/lib/helpers/toast"

export const ProfilePassword = ({
  user,
}: {
  user: HttpTypes.StoreCustomer
}) => {
  const [showForm, setShowForm] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSendResetPasswordEmail = async () => {
    // Previously `if (res.success)` with no else and no confirmation: on
    // failure the modal just sat there, and on success it closed with nothing
    // telling the customer to go check their inbox.
    setSending(true)
    const res = await sendResetPasswordEmail(user.email)
    setSending(false)
    if (res?.success) {
      toast.success({
        title: "Reset email sent",
        description: `Check ${user.email} for a link to set a new password.`,
      })
      setShowForm(false)
      return
    }
    toast.error({
      title: "Couldn't send the reset email",
      description: res?.error || "Please try again in a moment.",
    })
  }

  return (
    <>
      <Card className="bg-secondary p-4 flex justify-between items-center mt-8">
        <Heading level="h2" className="heading-sm uppercase">
          Password
        </Heading>
        <Button
          variant="tonal"
          className="uppercase flex items-center gap-2 font-semibold"
          onClick={() => setShowForm(true)}
        >
          Change password
        </Button>
      </Card>
      <Card className="p-0">
        <div className="p-4">
          <p className="label-md text-secondary">Current password</p>
          <p className="label-lg text-primary">****************</p>
        </div>
        <Divider />
        <div className="p-4">
          <p className="label-md text-secondary flex items-center gap-4">
            <InfoIcon size={18} className="text-secondary" />
            Always remember to choose a unique password to protect your account.
          </p>
        </div>
      </Card>
      {showForm && (
        <Modal heading="Change password" onClose={() => setShowForm(false)}>
          <div className="flex p-4 justify-center">
            <Button
              className="uppercase py-3 px-6 !font-semibold"
              onClick={handleSendResetPasswordEmail}
              disabled={sending}
              loading={sending}
            >
              Send reset password email
            </Button>
          </div>
          {/* <ProfilePasswordForm user={user} /> */}
        </Modal>
      )}
    </>
  )
}
