import { z } from "zod"

export const registerFormSchema = z.object({
  firstName: z.string().nonempty("Please enter first name"),
  lastName: z.string().nonempty("Please enter last name"),
  email: z.string().nonempty("Please enter email").email("Invalid email"),
  password: z
    .string()
    .nonempty("Please enter password")
    .min(8, "Password must be at least 8 characters long")
    // Keep this in lock-step with PasswordValidator's checklist: lowercase +
    // uppercase + one special character from the SAME set (! @ # $ % ^ & *).
    // A digit does NOT satisfy the special-character rule — the old message
    // said "number or symbol", so users typed e.g. "Password1", saw every
    // checklist row go green, and were then rejected here. Both the checklist
    // and this message now name the special-character requirement explicitly.
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/, {
      message:
        "Password must include a lowercase letter, an uppercase letter, and a special character (! @ # $ % ^ & *)",
    }),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || /^\+?[\d\s()-]+$/.test(v), {
      message: "Mobile phone must contain digits only",
    }),
  businessName: z.string().optional(),
  // "How did you hear about us?" — optional to keep signup friction low; the
  // free-text subsource is a follow-up detail (e.g. which podcast / influencer).
  marketingSource: z.string().optional(),
  marketingSubsource: z.string().optional(),
  agreedToTos: z.boolean().refine((v) => v === true, {
    message: "You must agree to the Terms of Service to continue",
  }),
})

export const vendorRegisterFormSchema = registerFormSchema.extend({
  businessName: z.string().nonempty("Please enter your business name"),
})

export type RegisterFormData = z.infer<typeof registerFormSchema>
