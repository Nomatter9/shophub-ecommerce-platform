      import { useEffect, useState } from "react";
      import { Eye, Pencil, Plus, Trash2, Calendar, Search, Package } from "lucide-react";
      import { format } from "date-fns"; 

      import { Button } from "@/components/ui/button";
      import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
      } from "@/components/ui/select";

      import { useAllCategories } from "@/hooks/useCategories";
      import { Category } from "@/types/category";
      import { toast } from "sonner";
      import axiosClient from "@/axiosClient";
      import PermissionGate from "@/components/auth/PermissionGate";
      import { checkPermission } from "@/lib/data/auth";
     import UniversalModal from "@/components/category/UniversalModal";

      export default function CategoriesPage() {
      const { data: categoriesData, isLoading, isError, refetch } = useAllCategories(true);

      const categories = categoriesData?.categories || categoriesData || [];  
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
      const [selectedItem, setSelectedItem] = useState<Category | null>(null);
      const isAdmin = checkPermission(["admin"]);
        const [searchQuery, setSearchQuery] = useState("");
      
const mainCategories = categories?.filter((category: any)=> category.parentId == null)
        const filteredCategories = mainCategories.filter((category: any)=> 
    category.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.id?.toString().includes(searchQuery)
  );
      const handleOpenModal = (mode: "create" | "edit" | "view", category: Category | null = null) => {
      setModalMode(mode);
      setSelectedItem(category);
      setIsModalOpen(true);
      };

      const handleSave = async (formData: Category) => {
      if (!isAdmin) return toast.error("Unauthorized action");
      const url = modalMode === "create" 
      ? "/categories" 
      : `/categories/${formData.id}`;

      try {
      let res;
      if (modalMode === "create") {
      res = await axiosClient.post(url, formData);
      } else {
      res = await axiosClient.put(url, formData);
      }
      if (res.status === 200 || res.status === 201) {
      toast.success(`Category ${modalMode === "create" ? "created" : "updated"}!`);
      refetch(); 
      setIsModalOpen(false);
      }
      } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Operation failed";
      toast.error(errorMessage);
      console.error("Save Error:", error);
      }
      };

      const handleDelete = async (category: any) => {
      if (!isAdmin) return toast.error("Unauthorized action");
      if (!category) {
      toast.error("Invalid Category ID");
      return;
      }
      if (category.subcategories.length > 0) {
      toast.error(`You cannot delete ${category.name} because it has ${category.subcategories.length} subcategories`);
      return;
      }
      if (!confirm("Are you sure? This will delete the category permanently.")) return;
      try {
      const res = await axiosClient.delete(`/categories/${category.id}`);
      if (res.status === 200) {
      toast.success("Category deleted");
      refetch(); 
      }
      } catch (error: any) {
      const message = error.response?.data?.message || "Delete failed";
      toast.error(message);
      console.error("Delete Error details:", error.response);
      }
      };

   const handleStatusChange = async (id: number, newValue: string) => {
  const isActive = newValue === "active";
  try {
    await axiosClient.patch(`/categories/${id}/status`, { isActive });
    toast.success("Status updated");
    refetch();
  } catch (error) {
    toast.error("Update failed");
  }
};

      if (isLoading) return <div className="p-10 text-center text-slate-400">Loading categories...</div>;
      if (isError) return <div className="p-10 text-center text-red-400">Error loading categories.</div>;

      return (
      <div className="w-full space-y-6">
          <div className="flex-1 max-w-md px-4 hidden sm:block">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full bg-[#071025] border border-white/10 rounded-lg py-2 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            placeholder="Search Categories..."
             value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center justify-between px-2">
      <div>
      <h1 className="text-3xl font-bold text-white">Category Management</h1>
      <p className="text-slate-400 text-sm">Detailed overview of all system categories.</p>
      </div>
        <PermissionGate allowedRoles={["admin"]}>
      <Button onClick={() => handleOpenModal("create")}
      className="bg-indigo-600 hover:bg-indigo-500 px-6">
      <Plus className="w-4 h-4 mr-2" /> New Category
      </Button>
      </PermissionGate>
      </div>

      <div className="w-full rounded-2xl border border-white/[0.05] bg-[#0B1632]/50 overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse">
      <thead>
      <tr className="bg-white/[0.02] border-b border-white/[0.05] text-slate-500 text-[11px] uppercase tracking-widest">
      <th className="px-6 py-5 font-bold">ID</th>
      <th className="px-6 py-5 font-bold text-center">Media</th>
      <th className="px-6 py-5 font-bold">Name</th>
      <th className="px-6 py-5 font-bold">Slug</th>
      <th className="px-6 py-5 font-bold">Description</th>
      <th className="px-6 py-5 font-bold">Status</th>
      <th className="px-6 py-5 font-bold text-center">Sort</th>
      <th className="px-6 py-5 font-bold text-center">Sub Cats</th>
      <th className="px-6 py-5 font-bold">Timestamps</th>
      <th className="px-6 py-5 font-bold text-right">Actions</th>
      </tr>
      </thead>
      <tbody className="divide-y divide-white/[0.05]">
      {filteredCategories.map((category: Category) => (
      <tr key={category.id} className="group hover:bg-white/[0.01] transition-all">
      <td className="px-6 py-6 text-slate-500 font-mono text-xs">#{category.id}</td>
       <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-white/10 flex items-center justify-center overflow-hidden">
            {category.image ? (
              <img src={category.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <Package className="w-5 h-5 text-indigo-400" />
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-6 font-bold text-white text-base">{category.name}</td>
      <td className="px-6 py-6">
        <span className="bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded text-xs font-mono">
          {category.slug}
        </span>
      </td>
      <td className="px-6 py-6 text-slate-400 text-sm max-w-[250px] truncate">
        {category.description || "—"}
      </td>
     <td className="px-6 py-6">
  <Select 
    value={category.isActive ? "active" : "inactive"} 
    onValueChange={(val) => handleStatusChange(category.id, val)}
      disabled={!isAdmin}
     >
    <SelectTrigger 
      className={`h-8 w-[110px] border-none text-[11px] font-black uppercase transition-all shadow-sm
        ${category.isActive 
          ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" 
          : "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20"
        }`}
    >
      <SelectValue />
    </SelectTrigger>
    <SelectContent className="bg-[#0B1632] border-white/10 text-white">
      <SelectItem value="active">Active</SelectItem>
      <SelectItem value="inactive">Inactive</SelectItem>
    </SelectContent>
  </Select>
</td>
      <td className="px-6 py-6 text-center font-bold text-white">{category.sortOrder}</td>
      <td className="px-6 py-6 text-center font-bold text-white">{category.subcategories?.length || 0}</td>
      <td className="px-6 py-6 whitespace-nowrap">
        <div className="flex flex-col text-[11px]">
          <span className="text-slate-500">Created: <b className="text-slate-300">{category.createdAt ? format(new Date(category.createdAt), "dd MMM yy") : "N/A"}</b></span>
          <span className="text-slate-500">Updated: <b className="text-slate-300">{category.updatedAt ? format(new Date(category.updatedAt), "dd MMM yy") : "N/A"}</b></span>
        </div>
      </td>
      <td className="px-6 py-6 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button onClick={() => handleOpenModal("view", category)}
            size="icon" variant="ghost" className="h-8 w-8 text-green-400 hover:bg-green-400/10">
            <Eye className="w-4 h-4" />
          </Button>
          <PermissionGate allowedRoles={["admin"]}>
          <Button onClick={() => handleOpenModal("edit", category)}
            size="icon" variant="ghost" className="h-8 w-8 text-blue-400 hover:bg-blue-400/10">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button onClick={() => handleDelete(category)}
            size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:bg-red-400/10">
            <Trash2 className="w-4 h-4" />
          </Button>
          </PermissionGate>
        </div>
      </td>
      </tr>
      ))}
      </tbody>
      </table>
      </div>
      </div>

    <UniversalModal 
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    mode={modalMode}
    item={selectedItem}
    onSave={handleSave}
    type="category" 
    />
      </div>
      );
      }