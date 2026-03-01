import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CategorySelect } from "../category/CategorySelect";
import { X, UploadCloud, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface PreviewItem {
  url: string;
  isExisting: boolean;
  id?: string | number;
  file?: File;
}

interface ProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  product?: any | null;
  categories: any[];
  mode: "create" | "edit";
  isUserMode?: boolean; 
}

export default function ProductDrawer({ 
  isOpen, 
  onClose, 
  onSave, 
  product, 
  categories, 
  mode,
  isUserMode = false 
}: ProductDrawerProps) {
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isSeller = user.role === 'seller';
  const isUserView = isUserMode; 

  const initialState = {
    name: "", 
    description: "",
    sku: "",
    brand: "",
    price: 0,
    costPrice: 0,
    compareAtPrice: 0, 
    stockQuantity: 0,
    lowStockThreshold: 5,
    weight: 0,
    categoryId: "",
    isActive: false, 
    isFeatured: false,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "customer",
    isVerified: false
  };

  const [formData, setFormData] = useState(initialState);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const selectedCategoryName = categories.find(
    (c) => String(c.id) === String(formData.categoryId)
  )?.name || "Unassigned";

  // Navigation Logic
  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPreviewIndex((prev) => (prev !== null && prev < previews.length - 1 ? prev + 1 : 0));
  }, [previews.length]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPreviewIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : previews.length - 1));
  }, [previews.length]);

  // Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (previewIndex === null) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") setPreviewIndex(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewIndex, handleNext, handlePrev]);

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (mode === "edit" && product) {
        setFormData({
          name: product.name || "",
          description: product.description || "",
          sku: product.sku || "",
          brand: product.brand || "",
          price: Number(product.price) || 0,
          costPrice: Number(product.costPrice) || 0,
          compareAtPrice: Number(product.compareAtPrice) || 0,
          stockQuantity: Number(product.stockQuantity) || 0,
          lowStockThreshold: Number(product.lowStockThreshold) || 5,
          weight: Number(product.weight) || 0,
          categoryId: product.categoryId?.toString() || "",
          isActive: product.isActive !== undefined ? Boolean(product.isActive) : false,
          isFeatured: product.isFeatured !== undefined ? Boolean(product.isFeatured) : false,
          firstName: product.firstName || "",
          lastName: product.lastName || "",
          email: product.email || "",
          phone: product.phone || "",
          role: product.role || "customer",
          isVerified: product.isVerified !== undefined ? Boolean(product.isVerified) : false,
        });

        if (!isUserView) {
          const existingImages = product.images?.map((img: any) => ({
            url: img.url.startsWith('http') ? img.url : `${import.meta.env.VITE_STATIC_FILE_URL}${img.url}`,
            isExisting: true,
            id: img.id
          })) || [];
          setPreviews(existingImages);
        }
        setSelectedFiles([]);
      } else {
        setFormData(initialState);
        setPreviews([]);
        setSelectedFiles([]);
      }
    }
  }, [isOpen, product, mode, isUserView]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      const newPreviews = filesArray.map((file) => ({
        url: URL.createObjectURL(file),
        isExisting: false,
        file: file
      }));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const itemToRemove = previews[index];
    if (!itemToRemove.isExisting && itemToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(itemToRemove.url);
    }
    if (!itemToRemove.isExisting && itemToRemove.file) {
      setSelectedFiles((prev) => prev.filter((f) => f !== itemToRemove.file));
    }
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (isUserView) {
      onSave({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        isVerified: formData.isVerified,
      });
      return;
    }
    const catId = String(formData.categoryId || "").trim();
    if (!catId || catId === "" || catId === "all-categories") {
      toast.error("Please select a specific category");
      setErrors(prev => ({ ...prev, categoryId: "Required" }));
      return;
    }
    
    const data = new FormData();
    if (product?.id) data.append("id", String(product.id));
    const sellerId = isSeller ? user.id : (product?.sellerId || "");
    data.append("sellerId", String(sellerId));
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("categoryId", catId); 
    data.append("sku", formData.sku);
    data.append("brand", formData.brand);
    data.append("price", String(formData.price));
    data.append("costPrice", String(formData.costPrice));
    data.append("compareAtPrice", String(formData.compareAtPrice));
    data.append("stockQuantity", String(formData.stockQuantity));
    data.append("lowStockThreshold", String(formData.lowStockThreshold));
    data.append("weight", String(formData.weight));
    data.append("isActive", String(formData.isActive));
    data.append("isFeatured", String(formData.isFeatured));

    selectedFiles.forEach((file) => data.append("images", file));
    onSave(data);
  };
                  
  const isEditingSelf = isUserView && String(product?.id) === String(user.id);
  const canEditRole = user.role === 'admin' && !isEditingSelf;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        side="right" 
        className="flex flex-col h-full w-[400px] sm:w-[540px] bg-[#0B1224] border-white/10 text-white p-0 overflow-hidden"
      >
        <SheetHeader className="p-6 border-b border-white/5 flex-none">
          <SheetTitle className="text-white text-xl">
            {isUserView ? "Manage User" : (mode === "create" ? "Add New Product" : "Edit Product")}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar"> 
          {isUserView ? (
            <div className="space-y-6">
              <section className="space-y-4">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">User Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-slate-300">First Name</Label>
                    <Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="bg-slate-900/50 border-white/10 text-white" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-slate-300">Last Name</Label>
                    <Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="bg-slate-900/50 border-white/10 text-white" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-slate-300">Email</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-slate-900/50 border-white/10 text-white" />
                </div>
              </section>
            </div>
          ) : (
            <div className="grid gap-8">
              <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Identity</h3>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Category: <span className="text-indigo-400">{selectedCategoryName}</span>
                  </span>
                </div>
                <div className="grid gap-2">
                  <Label className="text-slate-300">Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-slate-900/50 border-white/10 text-white" />
                </div>
                <div className="grid gap-2">
                    <Label className="text-slate-300">Category</Label>
                    <CategorySelect categories={categories} value={formData.categoryId} onSelect={(id:any) => setFormData({ ...formData, categoryId: id })} />
                </div>
              </section>
              <section className="space-y-4">
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest">Media ({previews.length})</h3>
                <div className="grid grid-cols-3 gap-3">
                  {previews.map((item, index) => (
                    <div key={index} className="relative aspect-square rounded-lg border border-white/10 bg-slate-900/50 overflow-hidden group">
                      <img src={item.url} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setPreviewIndex(index)}
                          className="p-2 bg-indigo-600 rounded-full hover:bg-indigo-500 transition-colors"
                          title="Preview Image"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={(e) => removeImage(index, e)} 
                          className="p-2 bg-rose-600 rounded-full hover:bg-rose-500 transition-colors"
                          title="Remove Image"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-white/10 hover:border-indigo-500/50 cursor-pointer bg-white/5 transition-colors">
                    <UploadCloud className="text-slate-500 mb-1" size={20} />
                    <span className="text-[10px] uppercase font-bold text-slate-500">Upload</span>
                    <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
              </section>
                <section className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Pricing & Inventory</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-slate-400 text-xs">Price</Label>
                    <Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="bg-slate-900/50 border-white/10 text-white" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-slate-400 text-xs">Stock</Label>
                    <Input type="number" value={formData.stockQuantity} onChange={(e) => setFormData({...formData, stockQuantity: Number(e.target.value)})} className="bg-slate-900/50 border-white/10 text-white" />
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        <SheetFooter className="p-6 bg-[#0B1224] border-t border-white/10 flex-none">
          <div className="flex w-full gap-3">
            <Button variant="ghost" onClick={onClose} className="flex-1 text-slate-400 hover:text-white">Cancel</Button>
            <Button onClick={handleSubmit} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              {isUserView ? "Update User" : (mode === "create" ? "Add Product" : "Save Changes")}
            </Button>
          </div>
        </SheetFooter>


        {previewIndex !== null && previews.length > 0 && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setPreviewIndex(null)}
          >
            <button 
              disabled={previewIndex === 0}
              onClick={handlePrev}
              className={`absolute left-4 sm:left-8 p-4 rounded-full border border-white/10 transition-all z-[110]
                ${previewIndex === 0 
                  ? "opacity-10 cursor-not-allowed text-slate-600" 
                  : "bg-white/5 hover:bg-white/10 text-white"}`}
            >
              <ChevronLeft size={32} />
            </button>
            <div 
              className="relative max-w-[85%] max-h-[85vh] flex flex-col items-center gap-6" 
              onClick={(e) => e.stopPropagation()} 
            >
              <button 
                onClick={() => setPreviewIndex(null)}
                className="absolute -top-4 -right-4 z-[120] p-2 rounded-full bg-indigo-600 text-white shadow-xl hover:bg-indigo-500 hover:scale-110 transition-all border-2 border-[#0B1224]"
                title="Close Preview"
              >
                <X size={12} />
              </button>

              <img 
                src={previews[previewIndex].url} 
                alt="Full Preview" 
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10" 
              />
              <div className="flex flex-col items-center gap-1 bg-black/40 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/5">
                <p className="text-white font-medium text-lg">
                  Image {previewIndex + 1} of {previews.length}
                </p>
                <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-mono">
                  {previews[previewIndex].isExisting ? 'Cloud Storage' : 'Local Draft'}
                </p>
              </div>
            </div>
            <button 
              disabled={previewIndex === previews.length - 1}
              onClick={handleNext}
              className={`absolute right-4 sm:right-8 p-4 rounded-full border border-white/10 transition-all z-[110]
                ${previewIndex === previews.length - 1 
                  ? "opacity-10 cursor-not-allowed text-slate-600" 
                  : "bg-white/5 hover:bg-white/10 text-white"}`}
            >
              <ChevronRight size={32} />
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}