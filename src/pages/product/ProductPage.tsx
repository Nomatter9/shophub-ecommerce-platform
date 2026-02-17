        import React, { useEffect, useState } from "react";
        import {
        Package,
        Search,
        Eye,
        Plus,
        Star,
        ChevronLeft,
        ChevronRight,
        Trash2,
        Edit,
        } from "lucide-react";
        import { format } from "date-fns";
        import { toast } from "sonner";

        import PermissionGate from "../../components/auth/PermissionGate";
        import { Button } from "../../components/ui/button";
        import { Input } from "../../components/ui/input";
        import { Slider } from "@/components/ui/slider";
        import {
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
        } from "../../components/ui/select";

        import axiosClient from "@/axiosClient";
        import { checkPermission } from "@/lib/data/auth";
        import { useAllProducts } from "@/hooks/useProducts";
        import { Product } from "@/types/Product";
        import { useAllCategories } from "@/hooks/useCategories";
        import { CategorySelect } from "../../components/category/CategorySelect";
        import  ProductDrawer from "@/components/products/ProductDrawer";
        import { cn } from "@/lib/data/utils";

        export default function ProductManagement() {
        const isAdmin = checkPermission(["admin"]);
        const [page, setPage] = useState(1);
        const [limit, setLimit] = useState(20);
        const [searchQuery, setSearchQuery] = useState("");
        const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);


const [isDrawerOpen, setIsDrawerOpen] = useState(false);
const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
        const [selectedItem, setSelectedItem] = useState<Product | null>(null);
        const [selectedCategoryId, setSelectedCategoryId] = useState<string | number>("");
        const { data: categoriesArray, isLoading: catLoading } = useAllCategories(true);
        const { data, isLoading, isError, refetch } = useAllProducts({
        page,
        limit,
        search: searchQuery || undefined,
        categoryId: selectedCategoryId || undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        sortBy: "createdAt",
        order: "DESC",
        });

        const products: Product[] = data?.products || [];
        const pagination = data?.pagination || {
        page: 1,
        totalPages: 1,
        };

      const handleOpenDrawer = (
  mode: "create" | "edit" ,
  item: Product | null = null
) => {
  setSelectedItem(item); 
  setDrawerMode(mode);
  setIsDrawerOpen(true);
};
const [isSaving, setIsSaving] = useState(false);
const handleSave = async (data: FormData | any) => {
  if (!isAdmin) {
    toast.error("Unauthorized action: Admins only.");
    return;
  }
  const catId = data instanceof FormData 
    ? data.get("categoryId") 
    : data.categoryId;
  const selectedCat = categoriesArray?.find((c :any)=> String(c.id) === String(catId));
  const categoryName = selectedCat ? selectedCat.name : "Unknown";
  setIsSaving(true);
  try {
    const isCreate = drawerMode === "create";
    if (!(data instanceof FormData) && data?.id) {
      const isPartialUpdate = Object.keys(data).some((k) =>
        ["isActive", "isFeatured", "sku"].includes(k)
      );

      if (isPartialUpdate) {
        await axiosClient.put(`/products/${data.id}`, data);
        toast.success("Product updated");
        refetch();
        return;
      }
    }

    let payload: FormData | Record<string, any>;
    let headers: Record<string, string> = {};

    if (data instanceof FormData) {
      payload = data;
    } else {
      payload = {
        ...data,
        categoryId: Number(data.categoryId),
      };

      headers = { "Content-Type": "application/json" };
    }

    const id = data instanceof FormData
      ? data.get("id")
      : data.id;

    const url = isCreate || !id
      ? "/products"
      : `/products/${id}`;

    const res = isCreate || !id
      ? await axiosClient.post(url, payload, { headers })
      : await axiosClient.put(url, payload, { headers });

    if (res.status === 200 || res.status === 201) {
      toast.success(
        `Product ${isCreate ? "created" : "updated"} successfully`
      );
      setIsDrawerOpen(false);
      refetch();
    }
  } catch (error: any) {
    const errorData = error?.response?.data;
    toast.error(
      errorData?.errors?.[0]?.msg ||
      errorData?.message ||
      "Failed to save product"
    );
  } finally {
    setIsSaving(false);
  }
};

  const handleDelete = async (id: number) => {
  if (!isAdmin) return toast.error("Unauthorized");
        if (!confirm("Delete this product?")) return;

  try {
   await axiosClient.delete(`/products/${id}`);
        toast.success("Product deleted");
     refetch();
     } catch {
    toast.error("Delete failed");
      }
      };

   if (isLoading)
   return <div className="p-10 text-slate-400">Loading products…</div>;
   if (isError)
   return <div className="p-10 text-red-400">Failed to load products</div>;
return(
<div className="flex flex-col h-full overflow-hidden bg-[#0B1224] text-slate-300">
  <div className="flex-none p-4 space-y-4 border-b border-white/10">
    <div className="flex justify-between items-center">
      <div className="flex gap-3 items-center">
        <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
          <Package className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Product Management</h1>
          <p className="text-xs text-slate-500">Inventory, pricing & visibility</p>
        </div>
      </div>
      <PermissionGate allowedRoles={["admin"]}>
        <Button onClick={() => handleOpenDrawer("create")} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </PermissionGate>
    </div>
    <div className="flex flex-wrap items-end gap-4">
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          className="pl-10 bg-slate-900/50 border-white/10 text-white"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] uppercase font-bold text-slate-500 ml-1">Category</span>
        <CategorySelect 
          categories={Array.isArray(categoriesArray) ? categoriesArray : []} 
          value={selectedCategoryId} 
          onSelect={(id:any) => { setSelectedCategoryId(id || ""); setPage(1); }} 
        />
      </div>
      <div className="w-64 space-y-2">
        <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
          <span>Price Range</span>
          <span className="text-emerald-400">${priceRange[0]} - ${priceRange[1]}</span>
        </div>
        <Slider
          min={0}
          max={20000}
          step={100}
          value={priceRange}
          onValueChange={(vals) => { setPriceRange(vals as [number, number]); setPage(1); }}
        />
      </div>
      <div className="w-28">
        <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
          <SelectTrigger className="bg-slate-900/50 border-white/10"><SelectValue placeholder="20" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="20">20 / page</SelectItem>
            <SelectItem value="50">50 / page</SelectItem>
            <SelectItem value="100">100 / page</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
 <div className="flex-1 flex flex-col overflow-hidden">
  <div className="flex-1 overflow-y-auto border border-white/10">
<table className="w-full border-collapse table-fixed bg-transparent">
<thead className="sticky top-0 z-30 bg-[#0B1224] border-b border-white/10">
<tr className="text-[11px] uppercase text-slate-500 tracking-wider">
<th className="px-6 py-4 w-[120px] text-left">Author</th>
<th className="px-6 py-4 w-[80px] text-left">Media</th>
<th className="px-6 py-4 w-[240px] text-left">Name</th>
<th className="px-6 py-4 w-[300px] text-left">Description</th>
<th className="px-6 py-4 w-[120px] text-left">Category</th>
<th className="px-6 py-4 w-[100px] text-left">SKU</th>
<th className="px-6 py-4 w-[120px] text-left">Price</th>
<th className="px-6 py-4 w-[120px] text-center">Status</th>
<th className="px-6 py-4 w-[100px] text-center">Featured</th>
<th className="px-6 py-4 w-[120px] text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-white/5">
{products.map((p) => (
<tr key={p.id} className="hover:bg-white/5">
  <td className="px-6 py-4 text-xs text-slate-400">
    {p.userId ? `User #${p.userId}` : <span className="text-indigo-400/50 italic">Admin</span>}
  </td>
  <td className="px-6 py-4">
  <div className="relative w-10 h-10 group">
    <img
      src={
        (() => {
          const primaryImage =
            p.images?.find((img: any) => img.isPrimary) || p.images?.[0];
          return primaryImage
          //@ts-ignore
            ? `${import.meta.env.VITE_STATIC_FILE_URL}${primaryImage.url}`
            : `https://picsum.photos/seed/${p.id}/50`;
        })()
      }
      className="w-10 h-10 rounded-lg object-cover ring-1 ring-white/10"
      alt={p.name}
    />
    
    {p.images?.some((img: any) => img.isPrimary) && (
      <div className="absolute -top-1.5 -right-1.5 bg-amber-500 rounded-full p-0.5 shadow-lg border border-[#0B1224] z-10">
        <Star className="w-2.5 h-2.5 text-white fill-white" />
      </div>
    )}
  </div>
  </td>
  <td className="px-6 py-4 text-sm font-medium text-white truncate">
    {p.name}
  </td> 
  <td className="px-6 py-4">
  <div className="text-xs text-slate-400 line-clamp-2 max-w-[280px] leading-relaxed">
    {p.description || <span className="text-slate-600 italic">No description provided</span>}
  </div>
</td>
<td className="px-6 py-4 text-xs">
{p.category?.name || <span className="text-slate-500 italic">Uncategorized</span>}
</td>     
<td className="px-6 py-4 text-xs font-mono text-indigo-300">
    {p.sku || "N/A"}
  </td>  
 <td className="px-6 py-4 font-bold text-emerald-400 text-sm">${Number(p.price).toLocaleString()}</td>
<td className="px-6 py-4 text-center">
  <Select value={p.isActive ? "active" : "inactive"} onValueChange={(val) => handleSave({ id: p.id, isActive: val === "active" })}>
    <SelectTrigger className={`w-[100px] h-8 bg-slate-900/50 border-white/10 text-[10px] font-bold uppercase ${p.isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent className="bg-slate-900 border-white/10 text-white">
      <SelectItem value="active">Active</SelectItem>
      <SelectItem value="inactive">Inactive</SelectItem>
    </SelectContent>
  </Select>
</td>
<td className="px-6 py-4 text-center">
  <Select value={p.isFeatured !== false ? "on" : "off"} onValueChange={(val) => handleSave({ id: p.id, isFeatured: val === "on" })}>
    <SelectTrigger className={`w-[80px] h-8 bg-slate-900/50 border-white/10 text-[10px] font-bold uppercase transition-all shadow-sm ${p.isFeatured !== false ? 'text-emerald-400 border-emerald-500/30' : 'text-rose-400 border-slate-500/30'}`}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent className="bg-slate-900 border-white/10 text-white">
      <SelectItem value="on">On</SelectItem>
      <SelectItem value="off">Off</SelectItem>
    </SelectContent>
  </Select>
</td>
<td className="px-6 py-4 text-right">
  <div className="flex justify-end gap-1">
    <Button variant="ghost" size="icon" onClick={() => handleOpenDrawer("edit", p)}>
      <Edit className="w-4 h-4 text-blue-400" />
    </Button>
    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
      <Trash2 className="w-4 h-4 text-rose-400" />
    </Button>
  </div>
</td>
</tr>
))}
</tbody>
</table>
  </div>
  <div className="flex-none flex justify-between items-center px-6 py-3 border-t border-white/10 bg-[#0B1224]">
    <span className="text-xs text-slate-500">
      Showing {products.length} products — Page {pagination.page} of {pagination.totalPages}
    </span>
    <div className="flex gap-2">
      <Button size="sm" variant="outline" className="bg-slate-900/50 border-white/10 hover:bg-slate-800/50 text-white" onClick={() => setPage(page - 1)} disabled={page === 1}>
        <ChevronLeft className="w-4 h-4 mr-1" /> Prev
      </Button>
      <Button size="sm" variant="outline" className="bg-slate-900/50 border-white/10 hover:bg-slate-800/50 text-white" onClick={() => setPage(page + 1)} disabled={page === pagination.totalPages}>
        Next <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  </div>
</div>
 <ProductDrawer
    isOpen={isDrawerOpen}
    onClose={() => setIsDrawerOpen(false)}
    product={selectedItem}
    categories={categoriesArray} 
    mode={drawerMode}
    onSave={handleSave}
  />
</div>
)} 