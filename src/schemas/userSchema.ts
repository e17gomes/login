import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["USER","ADM"]).optional()
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters long")
})

export type UserLoginType = z.infer<typeof loginSchema>