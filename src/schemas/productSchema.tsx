import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Product name is required"),
  slug: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  brand: z.string().min(1, "Brand is required"),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  compareAtPrice: z.coerce.number().min(0).optional(),
  costPrice: z.coerce.number().min(0).optional(),
  stockQuantity: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0),
  weight: z.coerce.number().min(0),
  categoryId: z.string().min(1, "Please select a category"),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export type ProductFormData = z.infer<typeof ProductSchema>;