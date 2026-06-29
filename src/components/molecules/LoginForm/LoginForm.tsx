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
import { SocialSignIn } from "./SocialSignIn"

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
    // includes("/user/") matches both /user/foo and /<locale>/user/foo —
    // requires the trailing slash so /user (the dashboard itself) falls through.
    if (pathname && pathname.includes("/user/")) {
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

    const dest = resolveReturnTo()
    // Merchants with no specific destination land in their vendor dashboard,
    // not the consumer /user page. login() sets the readable `_is_vendor`
    // cookie when seller auth succeeds; route those through /api/vendor-handoff,
    // which already holds the freshly-minted vendor token (clean handoff, no
    // loop — non-vendors that reach it just bounce to /user). Only the bare
    // /user default is overridden — an explicit return_to or an embedded
    // /user/* page (e.g. the directory-edit recovery's
    // return_to=/user/directory/edit) is intentional and respected.
    const isVendor =
      typeof document !== "undefined" &&
      document.cookie.split("; ").some((c) => c === "_is_vendor=true")
    if (dest === "/user" && isVendor) {
      window.location.href = "/api/vendor-handoff"
      return
    }
    router.push(dest)
  }

  // Used by register link to carry the return_to forward.
  // Also propagates the current /user/* path so signup → register → return works.
  const registerHref = (() => {
    const fromQuery = searchParams.get("return_to")
    const queryTarget =
      fromQuery && fromQuery.startsWith("/") ? fromQuery : null
    const pathTarget =
      pathname && pathname.includes("/user/") ? pathname : null
    const target = queryTarget ?? pathTarget
    if (!target) return "/user/register"
    return `/user/register?return_to=${encodeURIComponent(target)}`
  })()


  // Flash shown when the user lands here from the email-verification link on a
  // device where they weren't signed in: verification already succeeded from
  // the token (no login wall) — they just sign in once here to continue.
  const emailVerified = searchParams.get("email_verified")

  return (
    <main className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-[rgba(var(--neutral-0))] rounded-sm border border-[rgba(var(--neutral-100))] p-8 lg:p-10 shadow-sm">
          {emailVerified === "1" && (
            <div className="mb-6 rounded-sm border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
              Your email is verified. Please sign in to continue.
            </div>
          )}
          {emailVerified === "error" && (
            <div className="mb-6 rounded-sm border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              We couldn&rsquo;t verify that link — it may have expired. Sign in
              and we&rsquo;ll send a fresh verification email.
            </div>
          )}
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
          <SocialSignIn />

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
