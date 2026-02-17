import * as z from 'zod';

export const resetPasswordFormSchema = z.object({
 newPassword: z.string().min(8, { message: "New password must be at least 8 characters" })
  .regex(/[!@#$%^&*(),.?":{}|<>]/, {
    message: "Password must contain at least one special character",
  }), 
   newPasswordConfirmation: z.string().min(8, { message: "Confirm password is required" })
}).refine(data => data.newPassword === data.newPasswordConfirmation, {
    message: "Passwords don't match", 
    path: ["newPasswordConfirmation"]
   })


export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;


export const defaultResetPasswordValues:ResetPasswordFormValues = {

  newPasswordConfirmation: '',
  newPassword: '',
};