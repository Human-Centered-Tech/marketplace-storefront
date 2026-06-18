"use client"

import { Button } from "@/components/atoms"
import { LabeledInput } from "@/components/cells"
import { sendResetPasswordEmail } from "@/lib/data/customer"
import { Heading } from "@medusajs/ui"
import { useState } from "react"
import {
  FieldError,
  FieldValues,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import LocalizedClientLink from "../LocalizedLink/LocalizedLink"

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
})
type RequestResetFormData = z.infer<typeof schema>

// Shown on /reset-password when there is no token in the URL — i.e. the
// "Forgot Password?" entry point. Collects the email and triggers the reset
// email; the email links back to /reset-password?token=… where the new
// password is actually set (see ProfilePasswordForm).
export const RequestPasswordResetForm = () => {
  const methods = useForm<RequestResetFormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  })

  return (
    <FormProvider {...methods}>
      <Form />
    </FormProvider>
  )
}

const Form = () => {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useFormContext()

  const submit = async (data: FieldValues) => {
    // Always show the same confirmation regardless of whether the address has
    // an account, so we don't reveal which emails are registered.
    await sendResetPasswordEmail(data.email).catch(() => {})
    setSubmittedEmail(data.email)
  }

  if (submittedEmail) {
    return (
      <div className="p-4 text-center">
        <Heading level="h1" className="uppercase heading-md text-primary">
          Check your email
        </Heading>
        <p className="my-8">
          If an account exists for <strong>{submittedEmail}</strong>, we&apos;ve
          sent a link to reset your password.
        </p>
        <LocalizedClientLink href="/user">
          <Button
            className="uppercase py-3 px-6 !font-semibold w-full"
            size="large"
          >
            Back to sign in
          </Button>
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <form className="flex flex-col gap-4 p-4" onSubmit={handleSubmit(submit)}>
      <Heading
        level="h1"
        className="uppercase heading-md text-primary text-center"
      >
        Reset your password
      </Heading>
      <p className="text-center text-secondary">
        Enter the email associated with your account and we&apos;ll send you a
        link to reset your password.
      </p>
      <LabeledInput
        label="Email Address"
        placeholder="your@example.com"
        type="email"
        error={errors.email as FieldError}
        {...register("email")}
      />
      <Button className="w-full my-2" disabled={isSubmitting}>
        Send reset link
      </Button>
      <LocalizedClientLink
        href="/user"
        className="text-center text-[13px] text-action hover:underline"
      >
        Back to sign in
      </LocalizedClientLink>
    </form>
  )
}
