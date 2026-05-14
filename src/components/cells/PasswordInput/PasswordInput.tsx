"use client"

import { useState } from "react"
import { Input } from "@/components/atoms"
import { cn } from "@/lib/utils"
import { FieldError } from "react-hook-form"

type PasswordInputProps = {
  label: string
  error?: FieldError
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">

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
          <span className="material-symbols-outlined text-[18px] align-middle">
            {visible ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>
      {error && <p className="label-sm text-negative">{error.message}</p>}
    </label>
  )
}
