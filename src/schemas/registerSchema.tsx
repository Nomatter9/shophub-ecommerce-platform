import * as z from 'zod';

export const registerFormSchema = z.object({
 firstName: z.string().min(1, { message: "Please enter your first name" }),
 lastName: z.string().min(1, { message: "Please enter your last name" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional()
  .refine((val) => !val || /^27\d{9}$/.test(val), {
    message: "Phone number must start with 27 followed by 9 digits (e.g., 27695124059)",
  }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" })
  .regex(/[!@#$%^&*(),.?":{}|<>]/, {
    message: "Password must contain at least one special character",
  }),
  role: z.enum(["user", "seller"]),
 
});


export type RegisterFormValues = z.infer<typeof registerFormSchema>;


export const defaultRegisterValues: RegisterFormValues = {
firstName: '',
 lastName: '',
  email: '',
  phone: '',
  password: '',
  role : "user"
};