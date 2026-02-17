import { useState } from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PermissionGate from "@/components/auth/PermissionGate"; 
import { useAllCategories } from "@/hooks/useCategories";
import { Category } from "@/types/category";
import { toast } from "sonner";
import axiosClient from "@/axiosClient";
import { checkPermission } from "@/lib/data/auth";
import UniversalModal from "@/components/category/UniversalModal";

export default function SubcategoriesPage() {
  const { data, isLoading, isError, refetch } = useAllCategories();
  const isAdmin = checkPermission(["admin"]);

 const categories: Category[] = Array.isArray(data) 
    ? data 
    : (data?.categories || []);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const subcategories = categories.filter((c) => c.parentId !== null && c.parentId !== 0);

  const handleAction = (mode: "create" | "edit" | "view", category: Category | null = null) => {
    setModalMode(mode);
    setSelectedCategory(category);
    setModalOpen(true);
  };

  const handleSave = async (formData: Category) => {
    if (!isAdmin) return toast.error("Unauthorized action");

    const url = modalMode === "create" ? "/categories" : `/categories/${formData.id}`;
    
    try {
      if (modalMode === "create") {
        await axiosClient.post(url, formData);
      } else {
        await axiosClient.put(url, formData);
      }
      
      toast.success(`Subcategory ${modalMode === "create" ? "created" : "updated"} successfully`);
      refetch();
      setModalOpen(false);
     } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!isAdmin) return toast.error("Unauthorized action");

    if (!confirm("Are you sure? You want to delete the subcategory.")) return;

    try {
      await axiosClient.delete(`/categories/${id}`);
      toast.success("Subcategory deleted");
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  if (isLoading) return <div className="p-10 text-center text-slate-400 font-medium">Loading subcategories...</div>;
  if (isError) return <div className="p-10 text-center text-red-400">Error loading data.</div>;

  return (
    <div className="w-full space-y-6 animate-in animate-fade-in duration-500">
      <div className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-3xl font-bold text-white">Subcategories</h1>
          <p className="text-slate-400 text-sm">Manage categories and their associations.</p>
        </div>
        
        <PermissionGate allowedRoles={["admin"]}>
          <Button 
            onClick={() => handleAction("create")} 
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Subcategory
          </Button>
        </PermissionGate>
      </div>

      <div className="w-full rounded-2xl border border-white/[0.05] bg-[#0B1632]/50 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.05] text-slate-500 text-[11px] uppercase tracking-widest">
                <th className="px-6 py-5 font-bold">ID</th>
                <th className="px-6 py-5 font-bold">Name</th>
                <th className="px-6 py-5 font-bold">Slug</th>
                <th className="px-6 py-5 font-bold text-center">Parent ID</th>
                <th className="px-6 py-5 font-bold">Status</th>
                <th className="px-6 py-5 font-bold text-center">Sort</th>
                <th className="px-6 py-5 font-bold">Timestamps</th>
                <th className="px-6 py-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {subcategories.length > 0 ? (
                subcategories.map((category) => (
                  <tr key={category.id} className="group hover:bg-white/[0.01] transition-all">
                    <td className="px-6 py-6 text-slate-500 font-mono text-xs">#{category.id}</td>
                    <td className="px-6 py-6 font-bold text-white text-base">{category.name}</td>
                    <td className="px-6 py-6">
                      <span className="bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded text-xs font-mono">
                        {category.slug}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className="bg-white/5 text-indigo-300 border border-indigo-500/20 px-2 py-1 rounded text-[10px] font-bold">
                        PID: {category.parentId}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <Select defaultValue={category.isActive ? "active" : "inactive"} disabled={!isAdmin}>
                        <SelectTrigger className="h-8 w-[110px] bg-transparent border-white/10 text-[11px] font-bold uppercase text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0B1632] border-white/10 text-white">
                          <SelectItem value="active">Active</SelectItem>
                     <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-6 text-center font-bold text-white">{category.sortOrder}</td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex flex-col text-[11px] gap-1">
            <span className="text-slate-500">Created: <b className="text-slate-300">{category.createdAt ? format(new Date(category.createdAt), "dd MMM yy") : "—"}</b></span>
                        <span className="text-slate-500">Updated: <b className="text-slate-300">{category.updatedAt ? format(new Date(category.updatedAt), "dd MMM yy") : "—"}</b></span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleAction("view", category)} className="h-8 w-8 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10">
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        <PermissionGate allowedRoles={["admin"]}>
                          <Button size="icon" variant="ghost" onClick={() => handleAction("edit", category)} className="h-8 w-8 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(category.id!)} className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </PermissionGate>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-slate-500">No subcategories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UniversalModal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  mode={modalMode}
  item={selectedCategory} 
  type="category"
  onSave={handleSave}
/>
    </div>
  );
} 