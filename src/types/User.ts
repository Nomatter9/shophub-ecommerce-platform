export type UserProfile = {
  id: number;
  name: string;
  email: string;
  avatar?: string; 
};
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePicture?: string | null;  // ← Add this
  role: 'customer' | 'admin' | 'seller';
  isVerified: boolean;
  createdAt: string;
  updatedAt?: string;  // ← Add this (optional)
  stats?: {
    totalOrders: number;
    totalSpent: string;
    addressCount?: number;
  };
}

export interface UserResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}