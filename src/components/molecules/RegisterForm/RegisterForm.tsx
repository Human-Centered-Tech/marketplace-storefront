"use client"
import {
  FieldError,
  FieldValues,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form"
import { Button } from "@/components/atoms"
import { zodResolver } from "@hookform/resolvers/zod"
import { LabeledInput } from "@/components/cells"
import { registerFormSchema, RegisterFormData } from "./schema"
import { signup } from "@/lib/data/customer"
import { useState } from "react"
import Link from "next/link"
import { PasswordValidator } from "@/components/cells/PasswordValidator/PasswordValidator"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

export const RegisterForm = () => {
  const methods = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
    },
  })

  return (
    <FormProvider {...methods}>
      <Form />
    </FormProvider>
  )
}

const Form = () => {
  const [passwordError, setPasswordError] = useState({
    isValid: false,
    lower: false,
    upper: false,
    "8chars": false,
    symbolOrDigit: false,
  })
  const [error, setError] = useState()
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors, isSubmitting },
  } = useFormContext()

  const submit = async (data: FieldValues) => {
    const formData = new FormData()
    formData.append("email", data.email)
    formData.append("password", data.password)
    formData.append("first_name", data.firstName)
    formData.append("last_name", data.lastName)
    formData.append("phone", data.phone)

    const res = passwordError.isValid && (await signup(formData))

    if (res && !res?.id) setError(res)
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-[rgba(var(--neutral-0))] rounded-sm border border-[rgba(var(--neutral-100))] p-8 lg:p-10 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold text-primary mb-2">
              Building the New
              <br />
              Catholic Economy®
            </h1>
            <p className="text-[14px] text-secondary">
              Create your account to start shopping or selling with faithful
              Catholic businesses.
            </p>
          </div>

          <form onSubmit={handleSubmit(submit)} className="space-y-4">
            <LabeledInput
              label="Full Name"
              placeholder="John Doe"
              error={errors.firstName as FieldError}
              {...register("firstName")}
            />
            <LabeledInput
              label="Email Address"
              placeholder="john@example.com"
              error={errors.email as FieldError}
              {...register("email")}
            />
            <div className="flex flex-col md:flex-row gap-4">
              <LabeledInput
                className="md:w-1/2"
                label="Password"
                placeholder="••••••••"
                type="password"
                error={errors.password as FieldError}
                {...register("password")}
              />
              <LabeledInput
                className="md:w-1/2"
                label="Phone (optional)"
                placeholder="+1 (555) 000-0000"
                error={errors.phone as FieldError}
                {...register("phone")}
              />
            </div>
            <PasswordValidator
              password={watch("password")}
              setError={setPasswordError}
            />

            {error && <p className="label-md text-negative">{error}</p>}

            <div className="flex items-start gap-2 mt-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 accent-[rgba(var(--brand-800))]"
              />
              <label htmlFor="terms" className="text-[13px] text-secondary">
                Agree to the{" "}
                <LocalizedClientLink href="#" className="underline text-primary">
                  Terms of Service
                </LocalizedClientLink>{" "}
                &amp; Faithful Catholic Standards of the community.
              </label>
            </div>

            <Button
              className="w-full bg-navy text-white hover:bg-navy-dark py-3.5 uppercase tracking-[0.1em] text-[13px] font-semibold mt-4"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Create Account ✝
            </Button>
          </form>

          <p className="text-center text-[14px] text-secondary mt-6">
            Already have an account?{" "}
            <Link
              href="/user"
              className="font-semibold text-primary hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
