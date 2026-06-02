import { z } from "zod"

export const registerFormSchema = z.object({
  firstName: z.string().nonempty("Please enter first name"),
  lastName: z.string().nonempty("Please enter last name"),
  email: z.string().nonempty("Please enter email").email("Invalid email"),
  password: z
    .string()
    .nonempty("Please enter password")
    .min(8, "Password must be at least 8 characters long")
    .regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/, {
      message:
        "Password must contain at least one uppercase letter and one special character",
    }),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || /^\+?[\d\s()-]+$/.test(v), {
      message: "Mobile phone must contain digits only",
    }),
  businessName: z.string().optional(),
  agreedToTos: z.boolean().refine((v) => v === true, {
    message: "You must agree to the Terms of Service to continue",
  }),
})

export const vendorRegisterFormSchema = registerFormSchema.extend({
  businessName: z.string().nonempty("Please enter your business name"),
})

export type RegisterFormData = z.infer<typeof registerFormSchema>
