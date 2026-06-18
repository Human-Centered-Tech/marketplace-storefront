import { z } from "zod"

// The reset flow authenticates with the emailed token (not the old
// password), so only the new password + confirmation are collected.
export const profilePasswordSchema = z.object({
  newPassword: z.string().nonempty(""),
  confirmPassword: z.string().nonempty(""),
})

export type ProfilePasswordFormData = z.infer<typeof profilePasswordSchema>
