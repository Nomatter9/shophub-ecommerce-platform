import React, { useState } from "react";
import { Package, Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosClient from "@/axiosClient";
import { useAllProducts } from "@/hooks/useProducts";
import { useAllCategories } from "@/hooks/useCategories";
import { CategorySelect } from "@/components/category/CategorySelect";
import ProductDrawer from "@/components/products/ProductDrawer";
import { Product } from "@/types/Product";

export default function SellerProductManagement() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | number>("");
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);

  const { data: categoriesArray } = useAllCategories(true);
  const { data, isLoading, refetch } = useAllProducts({
    page,
    limit: 20,
    search: searchQuery || undefined,
    categoryId: selectedCategoryId || undefined,
    sortBy: "createdAt",
    order: "DESC",
  });

  const products: Product[] = data?.products || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1 };

  const handleOpenDrawer = (mode: "create" | "edit", item: Product | null = null) => {
    setSelectedItem(item);
    setDrawerMode(mode);
    setIsDrawerOpen(true);
  };

  const handleSave = async (formData: FormData) => {
    try {
      const isCreate = drawerMode === "create";
      const url = isCreate ? "/products" : `/products/${selectedItem?.id}`;
      
      const res = isCreate 
        ? await axiosClient.post(url, formData) 
        : await axiosClient.put(url, formData);

      if (res.status === 200 || res.status === 201) {
        toast.success(`Product ${isCreate ? "created" : "updated"}`);
        setIsDrawerOpen(false);
        refetch();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save product");
    }
  };
  // Add this new function in SellerProductManagement component
const handleToggleStatus = async (id: number, currentStatus: boolean) => {
  try {
    const formData = new FormData();
    formData.append("id", String(id));
    formData.append("isActive", String(!currentStatus));
    
    const res = await axiosClient.put(`/products/${id}`, formData);
    
    if (res.status === 200) {
      toast.success("Product status updated");
      refetch();
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to update status");
  }
};

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await axiosClient.delete(`/products/${id}`);
      toast.success("Product deleted");
      refetch();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0B1224] text-slate-300">
<div className="p-6 border-b border-white/10 space-y-6">
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div className="flex gap-4 items-center">
      <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
        <Package className="w-6 h-6 text-indigo-400" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Product Inventory</h1>
        <p className="text-sm text-slate-500">Manage your shop listings and pricing</p>
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          className="pl-10 bg-slate-900/40 border-white/10 text-white focus:ring-indigo-500 h-10"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
        />
      </div>
      
      <div className="min-w-[180px]">
        <CategorySelect
          categories={Array.isArray(categoriesArray) ? categoriesArray : []}
          value={selectedCategoryId}
          onSelect={(id: any) => { setSelectedCategoryId(id || ""); setPage(1); }}
        />
      </div>

      <Button 
        onClick={() => handleOpenDrawer("create")} 
        className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 px-6 h-10"
      >
        <Plus className="w-5 h-5 mr-2" /> Add Product
      </Button>
    </div>
  </div>
</div>
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-slate-500">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/5 rounded-2xl">
            <Package className="w-12 h-12 text-slate-700 mb-3" />
            <p className="text-slate-500">No products found matching your criteria.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 overflow-hidden bg-white/5">
          <table className="w-full text-left border-collapse">
  <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-slate-400">
    <tr>
      <th className="px-6 py-4 font-semibold">Media</th>
      <th className="px-6 py-4 font-semibold">Name</th>
      <th className="px-6 py-4 font-semibold">Brand</th>
      <th className="px-6 py-4 font-semibold">SKU</th>
      <th className="px-6 py-4 font-semibold">Price</th>
      <th className="px-6 py-4 font-semibold">Stock</th>
      <th className="px-6 py-4 font-semibold text-center">Status</th>
      <th className="px-6 py-4 font-semibold text-right">Actions</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-white/5">
    {products.map((p) => (
      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
        <td className="px-6 py-4">
          <img
            src={p.images?.[0]?.url ? `${import.meta.env.VITE_STATIC_FILE_URL}${p.images[0].url}` : `https://picsum.photos/seed/${p.id}/50`}
            className="w-10 h-10 rounded-lg object-cover bg-slate-800 border border-white/5"
            alt={p.name}
          />
        </td>
        <td className="px-6 py-4">
            <p className="text-sm font-medium text-white line-clamp-1">{p.name}</p>
        </td>
        <td className="px-6 py-4 text-sm text-slate-400">
          {p.brand || <span className="text-slate-600 italic">No Brand</span>}
        </td>
        <td className="px-6 py-4 text-xs font-mono text-slate-500">
          {p.sku || 'N/A'}
        </td>
        <td className="px-6 py-4 text-sm font-bold text-emerald-400">
          ${Number(p.price).toFixed(2)}
        </td>
        <td className="px-6 py-4 text-sm">
          <span className={`${p.stockQuantity <= 5 ? 'text-amber-400 font-bold' : 'text-slate-300'}`}>
            {p.stockQuantity}
          </span>
        </td>
        <td className="px-6 py-4 text-center">
          <button 
  onClick={() => handleToggleStatus(p.id, p.isActive)}
  title={p.isActive ? "Click to Deactivate" : "Click to Activate"}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all duration-200 border ${
              p.isActive 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                : 'bg-slate-500/10 text-slate-500 border-white/5 hover:bg-white/10 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${p.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              {p.isActive ? 'Active' : 'Inactive'}
            </div>
          </button>
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex justify-end gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 border border-white/5 bg-white/5" 
              onClick={() => handleOpenDrawer("edit", p)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 border border-white/5 bg-white/5" 
              onClick={() => handleDelete(p.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>
          </div>
        )}
      </div>
      {pagination.totalPages > 1 && (
        <div className="p-4 border-t border-white/10 flex justify-between items-center bg-slate-900/20">
          <span className="text-xs text-slate-500">Page {pagination.page} of {pagination.totalPages}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="border-white/10 text-white" onClick={() => setPage(page - 1)} disabled={page === 1}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </Button>
            <Button size="sm" variant="outline" className="border-white/10 text-white" onClick={() => setPage(page + 1)} disabled={page === pagination.totalPages}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

     <ProductDrawer
  isOpen={isDrawerOpen}
  onClose={() => setIsDrawerOpen(false)}
  product={selectedItem}
  categories={categoriesArray || []}
  mode={drawerMode}
  onSave={handleSave}
  isUserMode={false}  
/>
    </div>
  );
}