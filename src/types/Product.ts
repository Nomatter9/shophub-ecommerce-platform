export interface ProductImage {
  id: number;
  url: string;
  isPrimary: boolean;
}

export interface Product {
  id: number;
  name: string;
  userId: string | number;
  slug: string;
  description?: string;
  shortDescription?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  categoryId: number;
  category?: { name: string; slug: string };
  stockQuantity: number;
  lowStockThreshold: number;
   brand?: string;
  isActive: boolean;
  isFeatured: boolean;
  isApproved: boolean;    
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  image?: string; // for fallback
  images?: ProductImage[];
}