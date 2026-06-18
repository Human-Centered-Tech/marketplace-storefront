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
import { updateCustomerPassword } from "@/lib/data/customer"
import { Heading, toast } from "@medusajs/ui"
import LocalizedClientLink from "../LocalizedLink/LocalizedLink"
import { PasswordValidator } from "@/components/cells/PasswordValidator/PasswordValidator"
import { PasswordInput } from "@/components/cells/PasswordInput/PasswordInput"

export const ProfilePasswordForm = ({ token }: { token?: string }) => {
  const form = useForm<ProfilePasswordFormData>({
    resolver: zodResolver(profilePasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })

  return (
    <FormProvider {...form}>
      <Form form={form} token={token} />
    </FormProvider>
  )
}

const Form = ({
  form,
  token,
}: {
  form: UseFormReturn<ProfilePasswordFormData>
  token?: string
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
        const res = await updateCustomerPassword(data.newPassword, token!)
        if (res.success) {
          toast.success("Password updated")
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
        Password updated
      </Heading>
      <p className="text-center my-8">
        Your password has been updated. You can now login with your new
        password.
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
        Set a new password
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
