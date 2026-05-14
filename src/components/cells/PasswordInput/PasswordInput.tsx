"use client"

import { useState } from "react"
import { Input } from "@/components/atoms"
import { cn } from "@/lib/utils"
import { FieldError } from "react-hook-form"

type PasswordInputProps = {
  label: string
  error?: FieldError
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">

// Inline SVGs so this component is self-contained and works on any
// route. The earlier `material-symbols-outlined` version rendered the
// literal text "visibility" / "visibility_off" on pages that don't
// preload the Google font (e.g. /user/become-vendor).
const EyeIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
)

/**
 * Drop-in replacement for LabeledInput specifically for password fields.
 * Renders an eye toggle on the right that flips the input between
 * type="password" and type="text". Keeps the same label/error markup
 * shape so existing form schemas continue to work.
 */
export const PasswordInput = ({
  label,
  error,
  className,
  ...props
}: PasswordInputProps) => {
  const [visible, setVisible] = useState(false)
  return (
    <label className={cn("label-sm block", className)}>
      <p className={cn(error && "text-negative")}>{label}</p>
      <div className="relative">
        <Input
          {...props}
          type={visible ? "text" : "password"}
          className={cn("pr-10", error && "border-negative")}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-primary p-1 leading-none"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && <p className="label-sm text-negative">{error.message}</p>}
    </label>
  )
}
