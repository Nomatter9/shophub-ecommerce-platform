import { Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import { CartProvider } from "@/Customer/context/CartContext";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardPage from "./pages/dashboard/DashboardPage";
import CategoriesPage from "./pages/category/CategoriesPage";
import SubcategoriesPage from "./pages/category/SubCategoriesPage";
import ProfilePage from "./pages/profile/ProfilePage";
import ProductPage from "./pages/product/ProductPage";
import AdminUserManagement from "./pages/admin/AdminUserManagement";
import SellerProductManagement from "./pages/product/SellerProductManagement";

import ShopLayout from "@/Customer/layout/ShopLayout";
import HomePage from "./Customer/shop/HomePage";
import ShopPage from "./Customer/shop/ShopPage";
import ProductDetailPage from "./Customer/shop/ProductDetailPage";
import CartPage from "./Customer/shop/CartPage";
import CheckoutPage from "./Customer/shop/CheckoutPage";
import WishlistPage from "./Customer/shop/WishlistPage";
// import AddressesPage from "./Customer/shop/AddressesPage"; 

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const token = localStorage.getItem("token");
  const user = token ? JSON.parse(localStorage.getItem("user") || "{}") : null;
  
  if (!token) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === 'customer') return <Navigate to="/shop" replace />; 
    if (user?.role === 'seller') return <Navigate to="/dashboard/seller/products" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  const user = token ? JSON.parse(localStorage.getItem("user") || "{}") : null;
  
  if (token) {
    if (user?.role === 'customer') return <Navigate to="/shop" replace />; 
    if (user?.role === 'seller') return <Navigate to="/dashboard/seller/products" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <CartProvider>
      <Routes>
        {/* AUTH ROUTES (No Layout) */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />

        {/* SHOP LAYOUT - Customer-facing e-commerce */}
        <Route element={<ShopLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          
          {/* PROTECTED CUSTOMER ROUTES - Still use ShopLayout */}
          <Route path="/checkout" element={<CheckoutPage />} /> {/* ← MOVED HERE - No ProtectedRoute wrapper, CheckoutPage handles auth internally */}
          <Route path="/orders" element={<ProtectedRoute allowedRoles={['customer']}><div className="p-6 text-white">Orders Page - Coming Soon</div></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute allowedRoles={['customer']}><ProfilePage /></ProtectedRoute>} />
            <Route path="/wishlist" element={<WishlistPage />} />

          {/* <Route path="/account/addresses" element={<ProtectedRoute allowedRoles={['customer']}><AddressesPage /></ProtectedRoute>} /> */}
        </Route>

        {/* DASHBOARD LAYOUT - Admin/Seller panel */}
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
        >
          {/* ADMIN ONLY ROUTES */}
          <Route index element={<ProtectedRoute allowedRoles={['admin']}><DashboardPage /></ProtectedRoute>} />
          <Route path="users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUserManagement /></ProtectedRoute>} />
          <Route path="categories" element={<ProtectedRoute allowedRoles={['admin']}><CategoriesPage /></ProtectedRoute>} />
          <Route path="subcategories" element={<ProtectedRoute allowedRoles={['admin']}><SubcategoriesPage /></ProtectedRoute>} />
          <Route path="products" element={<ProtectedRoute allowedRoles={['admin']}><ProductPage /></ProtectedRoute>} />
          
          {/* SELLER ROUTES */}
          <Route path="seller/products" element={<ProtectedRoute allowedRoles={['seller']}><SellerProductManagement /></ProtectedRoute>} />
          
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* CATCH ALL */}
        <Route 
          path="*" 
          element={<Navigate to={token ? "/shop" : "/"} replace />} 
        />
      </Routes>
    </CartProvider>
  );
}
