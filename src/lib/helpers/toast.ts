import { toast as uiToast } from "@medusajs/ui"

// The app mounts a single <Toaster /> from @medusajs/ui (see src/app/layout.tsx).
// This helper previously dispatched through `sonner` directly, whose toasts the
// @medusajs/ui Toaster never rendered — so every helper-based toast (promo-code
// feedback, add-to-cart, country selector, cart updates) silently no-op'd in
// production. Route through @medusajs/ui's toast so notifications actually show.
// @medusajs/ui applies its own semantic styling per variant, so no className is
// needed.

type ToastArgs = { description?: string; title: string }

export const toast = {
  info: ({ description, title }: ToastArgs) =>
    uiToast.info(title, description ? { description } : undefined),
  success: ({ description, title }: ToastArgs) =>
    uiToast.success(title, description ? { description } : undefined),
  error: ({ description, title }: ToastArgs) =>
    uiToast.error(title, description ? { description } : undefined),
}
