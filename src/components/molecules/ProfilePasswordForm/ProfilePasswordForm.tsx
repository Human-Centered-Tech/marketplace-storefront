"use client"

import { Button, Card } from "@/components/atoms"
import { LabeledInput } from "@/components/cells"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle } from "@medusajs/icons"
import {
  FieldError,
  FieldValues,
  FormProvider,
  useForm,
  useFormContext,
  UseFormReturn,
} from "react-hook-form"
import { ProfilePasswordFormData, profilePasswordSchema } from "./schema"
import { useEffect, useState } from "react"
import { updateCustomerPassword, completePasswordSetup } from "@/lib/data/customer"
import { Heading, toast } from "@medusajs/ui"
import LocalizedClientLink from "../LocalizedLink/LocalizedLink"
import { PasswordValidator } from "@/components/cells/PasswordValidator/PasswordValidator"
import { PasswordInput } from "@/components/cells/PasswordInput/PasswordInput"

export const ProfilePasswordForm = ({
  token,
  setup = false,
}: {
  token?: string
  // setup=true: this is the "add a password to an OAuth-only account" flow —
  // link a NEW email+password login to the existing account (via the custom
  // one-time token), rather than resetting an existing emailpass password.
  setup?: boolean
}) => {
  const form = useForm<ProfilePasswordFormData>({
    resolver: zodResolver(profilePasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })

  return (
    <FormProvider {...form}>
      <Form form={form} token={token} setup={setup} />
    </FormProvider>
  )
}

const Form = ({
  form,
  token,
  setup = false,
}: {
  form: UseFormReturn<ProfilePasswordFormData>
  token?: string
  setup?: boolean
}) => {
  const [success, setSuccess] = useState(false)
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    FieldError | undefined
  >(undefined)
  const [newPasswordError, setNewPasswordError] = useState({
    isValid: false,
    lower: false,
    upper: false,
    "8chars": false,
    symbolOrDigit: false,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useFormContext()

  const updatePassword = async (data: FieldValues) => {
    if (form.getValues("confirmPassword") !== form.getValues("newPassword")) {
      setConfirmPasswordError({
        message: "New password and confirmation do not match",
        type: "custom",
      } as FieldError)
      return
    }

    setConfirmPasswordError(undefined)

    if (newPasswordError.isValid) {
      try {
        // setup flow uses the custom link-a-password token; the normal flow uses
        // Medusa's reset-password token.
        const res = setup
          ? await completePasswordSetup(token!, data.newPassword)
          : await updateCustomerPassword(data.newPassword, token!)
        if (res.success) {
          toast.success(setup ? "Password added" : "Password updated")
          setSuccess(true)
        } else {
          toast.error(res.error || "Something went wrong")
        }
      } catch (err) {
        console.log(err)
        return
      }
    }
  }

  return success ? (
    <div className="p-4">
      <Heading
        level="h1"
        className="uppercase heading-md text-primary text-center"
      >
        {setup ? "Password added" : "Password updated"}
      </Heading>
      <p className="text-center my-8">
        {setup
          ? "Your password is set. You can now sign in with your email and password — or keep using Google. Either works."
          : "Your password has been updated. You can now login with your new password."}
      </p>
      <LocalizedClientLink href="/user">
        <Button
          className="uppercase py-3 px-6 !font-semibold w-full"
          size="large"
        >
          Go to user page
        </Button>
      </LocalizedClientLink>
    </div>
  ) : (
    <form
      className="flex flex-col gap-4 p-4"
      onSubmit={handleSubmit(updatePassword)}
    >
      <Heading
        level="h1"
        className="uppercase heading-md text-primary text-center"
      >
        {setup ? "Add a password" : "Set a new password"}
      </Heading>
      <PasswordInput
        label="New password"
        error={errors.newPassword as FieldError}
        {...register("newPassword")}
      />
      <PasswordValidator
        password={form.watch("newPassword")}
        setError={setNewPasswordError}
      />
      <PasswordInput
        label="Confirm new password"
        error={confirmPasswordError as FieldError}
        {...register("confirmPassword")}
      />
      <Button className="w-full my-4">Set new password</Button>
    </form>
  )
}
