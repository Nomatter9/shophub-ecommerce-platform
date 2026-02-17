import { useEffect, useState } from "react";
import { Layers, Package, Calendar, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Category } from "@/types/category"; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UniversalModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit" | "view";
  item: any | null; // This is the 'item' the error complained about
  type: "product" | "category"; // This is the 'type' the error complained about
  onSave: (formData: any) => void | Promise<any>; 
  category?: Category | null;
}

export default function UniversalModal({
  isOpen,
  onClose,
  mode,
  item,
  onSave,
  type
}: UniversalModalProps) {
  const isView = mode === "view";
  const [formData, setFormData] = useState<any>({});

  // SYNC DATA ON OPEN
  useEffect(() => {
    if (isOpen) {
      if (item && mode !== "create") {
        setFormData({ ...item });
      } else {
        // DEFAULT INITIAL STATE
        setFormData({
          name: "",
          // slug: "",
          description: "",
          isActive: true,
          image: "",
          // Category Specific
          parentId: null,
          sortOrder: 0,
          // Product Specific
          price: 0,
          sku: "",
          stock: 0,
          brand: ""
        });
      }
    }
  }, [item, isOpen, mode]);

  const handleSubmit = () => {
    if (!formData.name) return alert("Name is required");
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0B1224] text-white max-w-2xl border border-white/10 shadow-2xl overflow-hidden custom-scrollbar max-h-[90vh] overflow-y-auto">
        
        <DialogHeader className="border-b border-white/5 pb-4">
          <DialogTitle className="text-xl font-bold tracking-tight text-indigo-400 flex items-center gap-2">
            {type === "category" ? <Layers className="w-5 h-5" /> : <Package className="w-5 h-5" />}
            {mode === "create" ? `Create New ${type}` : mode === "edit" ? `Edit ${type}` : `${type} Info`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="flex flex-col gap-4 items-center sm:flex-row">
            <div className="w-24 h-24 rounded-2xl bg-[#071025] border border-white/10 flex items-center justify-center overflow-hidden">
              {formData.image ? (
                <img src={formData.image} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-8 h-8 text-slate-600" />
              )}
            </div>
            <div className="flex-1 w-full space-y-2">
              <Label className="text-slate-400 text-[10px] uppercase font-bold">Image URL</Label>
              <Input
                disabled={isView}
                value={formData.image || ""}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="bg-[#071025] border-white/10"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-400 text-[10px] uppercase font-bold">Name</Label>
              <Input
                disabled={isView}
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-[#071025] border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400 text-[10px] uppercase font-bold">Slug</Label>
              <Input
                disabled={isView}
                value={formData.slug || ""}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="bg-[#071025] border-white/10"
              />
            </div>
          </div>

          {type === "product" && (
            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
              <div className="space-y-2">
                <Label className="text-slate-400 text-[10px] uppercase font-bold">Price ($)</Label>
                <Input
                  type="number"
                  disabled={isView}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="bg-[#071025] border-white/10 text-indigo-400 font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 text-[10px] uppercase font-bold">SKU</Label>
                <Input
                  disabled={isView}
                  value={formData.sku || ""}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="bg-[#071025] border-white/10"
                />
              </div>
            </div>
          )}

          {type === "category" && (
            <div className="space-y-2 border-t border-white/5 pt-4">
              <Label className="text-slate-400 text-[10px] uppercase font-bold">Sort Order</Label>
              <Input
                type="number"
                disabled={isView}
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                className="bg-[#071025] border-white/10"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-slate-400 text-[10px] uppercase font-bold">Description</Label>
            <textarea
              disabled={isView}
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full rounded-md bg-[#071025] border border-white/10 p-3 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {(mode !== "create" && formData.createdAt) && (
            <div className="flex gap-4 pt-4 border-t border-white/5 text-[10px] text-slate-500 font-bold">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> CREATED: {format(new Date(formData.createdAt), "dd MMM yyyy")}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
            <Button variant="ghost" onClick={onClose} className="text-slate-400">
              {isView ? "Close" : "Cancel"}
            </Button>
            {!isView && (
              <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">
                {mode === "create" ? "Create Now" : "Save Changes"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}