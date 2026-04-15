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
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { LabeledInput } from "@/components/cells"
import { loginFormSchema, LoginFormData } from "./schema"
import { useState } from "react"
import { login } from "@/lib/data/customer"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

export const LoginForm = () => {
  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
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
  const [error, setError] = useState("")
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useFormContext()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Where to send the user after login. Priority:
  //   1. ?return_to= query param (set by mid-shopping login triggers)
  //   2. Any previously-browsed path stashed in sessionStorage
  //   3. /user (default — the account dashboard)
  // Per 3/31 decision: if login is triggered mid-shopping, return to where
  // they were, not the routing/account screen.
  const resolveReturnTo = () => {
    const fromQuery = searchParams.get("return_to")
    if (fromQuery && fromQuery.startsWith("/")) return fromQuery
    if (typeof window !== "undefined") {
      const stashed = window.sessionStorage.getItem("post_login_return_to")
      if (stashed && stashed.startsWith("/")) {
        window.sessionStorage.removeItem("post_login_return_to")
        return stashed
      }
    }
    // If LoginForm is embedded on a protected /user/* subpage, return
    // the user there after login instead of the /user dashboard.
    if (pathname && pathname.startsWith("/user/") && pathname !== "/user") {
      return pathname
    }
    return "/user"
  }

  const submit = async (data: FieldValues) => {
    const formData = new FormData()
    formData.append("email", data.email)
    formData.append("password", data.password)

    const res = await login(formData)
    if (res) {
      setError(res)
      return
    }
    setError("")
    router.push(resolveReturnTo())
  }

  // Used by register link to carry the return_to forward.
  const registerHref = (() => {
    const fromQuery = searchParams.get("return_to")
    const target = fromQuery && fromQuery.startsWith("/") ? fromQuery : null
    if (!target) return "/user/register"
    return `/user/register?return_to=${encodeURIComponent(target)}`
  })()


  return (
    <main className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-[rgba(var(--neutral-0))] rounded-sm border border-[rgba(var(--neutral-100))] p-8 lg:p-10 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold text-primary mb-2">
              Welcome Back
            </h1>
            <p className="text-[14px] text-secondary italic">
              Building the New Catholic Economy®
            </p>
          </div>
          <form onSubmit={handleSubmit(submit)} className="space-y-5">
            <LabeledInput
              label="Email Address"
              placeholder="your@example.com"
              error={errors.email as FieldError}
              {...register("email")}
            />
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label-md font-medium text-primary">
                  Password
                </label>
                <LocalizedClientLink
                  href="/reset-password"
                  className="text-[12px] text-action hover:underline"
                >
                  Forgot Password?
                </LocalizedClientLink>
              </div>
              <LabeledInput
                placeholder="••••••••"
                type="password"
                error={errors.password as FieldError}
                {...register("password")}
              />
            </div>
            {error && <p className="label-md text-negative">{error}</p>}
            <Button
              className="w-full bg-navy text-white hover:bg-navy-dark py-3 uppercase tracking-[0.1em] text-[13px] font-semibold"
              disabled={isSubmitting}
            >
              Sign In to the Economy →
            </Button>
          </form>
          <p className="text-center text-[14px] text-secondary mt-6">
            Don&apos;t have an account?{" "}
            <LocalizedClientLink
              href={registerHref}
              className="font-semibold text-primary hover:underline"
            >
              Sign Up
            </LocalizedClientLink>
          </p>
        </div>
      </div>
    </main>
  )
}
