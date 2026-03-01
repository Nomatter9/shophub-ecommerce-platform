import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().min(1, 'Label is required').max(50, 'Label too long'),
  recipientName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  phone: z.string()
    .min(10, 'Phone must be at least 10 digits')
    .max(15, 'Phone too long')
    .regex(/^[0-9+\s()-]+$/, 'Invalid phone format'),
  streetAddress: z.string().min(5, 'Street address is required').max(200, 'Address too long'),
  addressLine2: z.string().max(200, 'Address too long').optional(),
  suburb: z.string().max(100, 'Suburb too long').optional(),
  city: z.string().min(2, 'City is required').max(100, 'City too long'),
  province: z.string().min(1, 'Province is required'),
  postalCode: z.string()
    .min(4, 'Postal code is required')
    .max(10, 'Postal code too long')
    .regex(/^[0-9]+$/, 'Postal code must be numbers only'),
  country: z.string(),
  isDefault: z.boolean(),
  type: z.enum(['shipping', 'billing', 'both'])
});

export type AddressFormData = z.infer<typeof addressSchema>;