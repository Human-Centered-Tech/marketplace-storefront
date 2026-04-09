"use client"

import { useEffect, useRef } from "react"

type ConfirmDialogProps = {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "danger" | "default"
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onCancel()
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#001435]/40 backdrop-blur-sm" />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95">
        <h3 className="font-serif text-xl text-navy-dark mb-2">{title}</h3>
        <p className="text-sm text-secondary mb-8 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="border border-navy-dark text-navy-dark px-5 py-2.5 rounded-lg text-xs uppercase font-medium tracking-wider hover:bg-gray-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-lg text-xs uppercase font-medium tracking-wider transition-colors ${
              variant === "danger"
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-navy-dark text-white hover:bg-navy"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
