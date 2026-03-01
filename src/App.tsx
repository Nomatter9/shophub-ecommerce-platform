import { Routes, Route, Navigate } from "react-router-dom";
import React from "react";

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
import { UserProvider } from "@/Customer/context/UserContext";
import AddressesPage from "./Customer/shop/AddressesPage";

const ProtectedRoute = ({ children, allowedRoles }: { 
  children: React.ReactNode; 
  allowedRoles?: string[] 
}) => {
  const rawToken = localStorage.getItem("token");
  const token = rawToken ? JSON.parse(rawToken) : null;
  
  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;
  
  if (!token) return <Navigate to="/login" replace />;
  
  if (allowedRoles && user && !allowedRoles.includes(user?.role)) {
    if (user?.role === 'customer') return <Navigate to="/shop" replace />; 
    if (user?.role === 'seller') return <Navigate to="/dashboard/seller/products" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const rawToken = localStorage.getItem("token");
  const token = rawToken ? JSON.parse(rawToken) : null;
  
  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;
  
  if (token) {
    if (user?.role === 'customer') return <Navigate to="/shop" replace />; 
    if (user?.role === 'seller') return <Navigate to="/dashboard/seller/products" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

export default function App() {
  const rawToken = localStorage.getItem("token");
  const token = rawToken ? JSON.parse(rawToken) : null;

  return (
   
        <Routes>
          {/* AUTH ROUTES */}
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
          <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />

          {/* SHOP LAYOUT */}
          <Route element={<ShopLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route  path="/account/addresses" element={ <ProtectedRoute allowedRoles={['customer']}> <AddressesPage />
              </ProtectedRoute> } />
            <Route path="/wishlist" element={<WishlistPage />} />
            
            {/* Protected Customer Routes */}
            <Route path="/orders" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <div className="p-6 min-h-screen bg-gray-50">
                  <h1 className="text-2xl font-bold text-gray-600">Orders - Coming Soon</h1>
                </div>
              </ProtectedRoute>
            } />
            
               <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['customer','admin', 'seller']}>
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            <Route path="/account/addresses" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <AddressesPage />
              </ProtectedRoute>
            } />
          </Route>

          {/* DASHBOARD LAYOUT */}
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
          >
            <Route index element={<ProtectedRoute allowedRoles={['admin']}><DashboardPage /></ProtectedRoute>} />
            <Route path="users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUserManagement /></ProtectedRoute>} />
            <Route path="categories" element={<ProtectedRoute allowedRoles={['admin']}><CategoriesPage /></ProtectedRoute>} />
            <Route path="subcategories" element={<ProtectedRoute allowedRoles={['admin']}><SubcategoriesPage /></ProtectedRoute>} />
            <Route path="products" element={<ProtectedRoute allowedRoles={['admin']}><ProductPage /></ProtectedRoute>} />
            <Route path="seller/products" element={<ProtectedRoute allowedRoles={['seller']}><SellerProductManagement /></ProtectedRoute>} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* CATCH ALL */}
          <Route 
            path="*" 
            element={<Navigate to={token ? "/shop" : "/"} replace />} 
          />
        </Routes>
   
  );
}