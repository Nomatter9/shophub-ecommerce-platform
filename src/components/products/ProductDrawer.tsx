import React, { useEffect, useState, useRef } from "react";
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
import { X, UploadCloud, User } from "lucide-react";
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
  
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const selectedCategoryName = categories.find(
    (c) => String(c.id) === String(formData.categoryId)
  )?.name || "Unassigned";

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (mode === "edit" && product) {
        setFormData({
          // Product mapping
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
          // User mapping
          firstName: product.firstName || "",
          lastName: product.lastName || "",
          email: product.email || "",
          phone: product.phone || "",
          role: product.role || "customer",
          isVerified: product.isVerified !== undefined ? Boolean(product.isVerified) : false,
        });

        if (isUserView) {
          setProfilePreview(product.profilePicture || null);
          setProfilePicture(null);
        } else {
          const existingImages = product.images?.map((img: any) => ({
            //@ts-ignore
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
        setProfilePicture(null);
        setProfilePreview(null);
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

  // const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     if (!file.type.startsWith('image/')) {
  //       toast.error('Please select an image file');
  //       return;
  //     }
  //     if (file.size > 5 * 1024 * 1024) {
  //       toast.error('File size must be less than 5MB');
  //       return;
  //     }
  //     setProfilePicture(file);
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setProfilePreview(reader.result as string);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePreview(null);
    if (profileInputRef.current) {
      profileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
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
    setErrors({});
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

    selectedFiles.forEach((file) => {
      data.append("images", file);
    });

    onSave(data);
  };
                  
const isEditingSelf = isUserView && String(product?.id) === String(user.id);
const canEditRole = user.role === 'admin' && !isEditingSelf;
  return (
<Sheet
  open={isOpen}
  onOpenChange={(open) => {
    if (!open) onClose();
  }}
>
      <SheetContent 
        side="right" 
        className="flex flex-col h-full w-[400px] sm:w-[540px] bg-[#0B1224] border-white/10 text-white p-0 overflow-hidden"
      >
        <SheetHeader className="p-6 border-b border-white/5 flex-none">
          <SheetTitle className="text-white text-xl">
            {isUserView ? "Manage User" : (mode === "create" ? "Add New Product" : "Edit Product")}
          </SheetTitle>
          {mode === "edit" && product?.updatedAt && (
            <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-wider">
              Last Updated: {new Date(product.updatedAt).toLocaleString()}
            </p>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar"> 
                    {isUserView && product?.stats && (
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Account Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Total Spent</p>
                  <p className="text-xl font-semibold text-emerald-400">R {product.stats.totalSpent}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Total Orders</p>
                  <p className="text-xl font-semibold text-indigo-400">{product.stats.totalOrders}</p>
                </div>
              </div>
            </section>
          )}

          {isUserView ? (
            <div className="space-y-6">
              <section className="space-y-4">
                {/* <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest">Profile Picture</h3> */}
                {/* <div className="flex items-center gap-4"> */}
                  {/* <div className="flex-shrink-0">
                    {profilePreview ? (
                      <img
                        src={profilePreview}
                        alt="Profile preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-white/10"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold">
                        {formData.firstName?.[0]}{formData.lastName?.[0]}
                      </div>
                    )}
                  </div> */}
                  {/* <div className="flex flex-col gap-2">
                    <input
                      ref={profileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                      id="profile-picture-upload"
                    />
                    <label
                      htmlFor="profile-picture-upload"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors text-sm font-medium text-center"
                    >
                      Upload Photo
                    </label>
                    {profilePreview && (
                      <button
                        type="button"
                        onClick={removeProfilePicture}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div> */}
                {/* </div> */}
                {/* <p className="text-xs text-slate-500">
                  JPG, PNG or GIF. Max size 5MB.
                </p> */}
              </section>
              <section className="space-y-4">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">User Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-slate-300">First Name</Label>
                    <Input 
                      value={formData.firstName} 
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                      className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-slate-300">Last Name</Label>
                    <Input 
                      value={formData.lastName} 
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                      className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-slate-300">Email</Label>
                  <Input 
                    type="email"
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-slate-300">Phone</Label>
                  <Input 
                    type="tel"
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600"
                  />
                </div>
              </section>
         <section className="space-y-4">
  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Permissions</h3>
  <div className="grid gap-2">
    <Label className="text-slate-300">User Role</Label>
    
    {canEditRole ? (
      <select 
        value={formData.role} 
        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        className="w-full bg-slate-900/50 border border-white/10 text-white rounded-md p-2 outline-none focus:border-indigo-500 transition-colors"
      >
        <option value="customer" className="bg-[#0B1224]">Customer</option>
        <option value="seller" className="bg-[#0B1224]">Seller</option>
        <option value="admin" className="bg-[#0B1224]">Admin</option>
      </select>
    ) : (
      <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
        <span className="text-sm font-medium text-slate-400 capitalize">{formData.role}</span>
        {isEditingSelf && (
          <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
            Cannot change own role
          </span>
        )}
      </div>
    )}
  </div>

  <div className="flex items-center justify-between h-12 px-3 rounded-md border transition-colors bg-slate-900/30 border-white/10">
    <span className="text-[10px] font-bold text-slate-300 uppercase">
      Verification Status ({formData.isVerified ? 'Verified' : 'Unverified'})
    </span>
    <Switch 
      disabled={isEditingSelf}
      checked={formData.isVerified} 
      onCheckedChange={(c) => setFormData({...formData, isVerified: c})} 
    />
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
                  <Label className="flex justify-between text-slate-300">
                    Name {errors.name && <span className="text-rose-400 text-[10px]">{errors.name}</span>}
                  </Label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    className={`bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600 ${errors.name ? 'border-rose-500/50' : ''}`} 
                  />
                </div>
              <div className="grid gap-2">
                <Label className="flex justify-between text-slate-300">
                  Description 
                  <span className="text-[10px] text-slate-500 uppercase">Markdown supported</span>
                </Label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Describe the product features, materials, etc..."
                  className="w-full bg-slate-900/50 border border-white/10 rounded-md p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none custom-scrollbar"
                />
              </div>
                <div className="grid gap-2">
                  <Label className="flex justify-between text-slate-300">
                    Category {errors.categoryId && <span className="text-rose-400 text-[10px]">{errors.categoryId}</span>}
                  </Label>
                  <CategorySelect 
                    categories={categories} 
                    value={formData.categoryId} 
                    onSelect={(id:any) => setFormData({ ...formData, categoryId: id })} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-slate-300">Brand</Label>
                    <Input value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="bg-slate-900/50 border-white/10 text-white" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-slate-300">SKU</Label>
                    <Input value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} className="bg-slate-900/50 border-white/10 text-white" />
                  </div>
                </div>
              </section>
              <section className="space-y-4">
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest">Media ({previews.length})</h3>
                <div className="grid grid-cols-3 gap-3">
                  {previews.map((item, index) => (
                    <div key={index} className="relative aspect-square rounded-lg border border-white/10 bg-slate-900/50 overflow-hidden group">
                      <img src={item.url} alt="Preview" className="w-full h-full object-cover" />
                      <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-rose-500/80 p-1 rounded-md">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-white/10 hover:border-indigo-500/50 cursor-pointer bg-white/5">
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
                  {!isSeller && (
                    <div className="grid gap-2">
                      <Label className="text-slate-400 text-xs">Cost</Label>
                      <Input type="number" value={formData.costPrice} onChange={(e) => setFormData({...formData, costPrice: Number(e.target.value)})} className="bg-slate-900/50 border-white/10 text-white" />
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label className="text-slate-400 text-xs">Compare</Label>
                    <Input type="number" value={formData.compareAtPrice} onChange={(e) => setFormData({...formData, compareAtPrice: Number(e.target.value)})} className="bg-slate-900/50 border-white/10 text-white" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-slate-400 text-xs">Stock</Label>
                    <Input type="number" value={formData.stockQuantity} onChange={(e) => setFormData({...formData, stockQuantity: Number(e.target.value)})} className="bg-slate-900/50 border-white/10 text-white" />
                  </div>
                </div>
              </section>
              <section className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Settings</h3>
                <div className={`grid ${isSeller ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                  <div className={`flex items-center justify-between h-12 px-3 rounded-md border transition-colors ${formData.isActive ? "bg-emerald-500/5 border-emerald-500/20" : "bg-rose-500/5 border-rose-500/20"}`}>
                    <span className="text-[10px] font-bold text-slate-300 uppercase">Status ({formData.isActive ? 'Active' : 'Inactive'})</span>
                    <Switch checked={formData.isActive} onCheckedChange={(c) => setFormData({...formData, isActive: c})} />
                  </div>
                  {!isSeller && (
                    <div className={`flex items-center justify-between h-12 px-3 rounded-md border transition-colors ${formData.isFeatured ? "bg-amber-500/5 border-amber-500/20" : "bg-slate-900/30 border-white/10"}`}>
                      <span className="text-[10px] font-bold text-slate-300 uppercase">Featured</span>
                      <Switch checked={formData.isFeatured} onCheckedChange={(c) => setFormData({...formData, isFeatured: c})} className="data-[state=checked]:bg-amber-500" />
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>

        <SheetFooter className="p-6 bg-[#0B1224] border-t border-white/10 flex-none">
          <div className="flex w-full gap-3">
            <Button variant="ghost" onClick={onClose} className="flex-1 text-slate-400 hover:text-white hover:bg-white/5">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
              {isUserView ? "Update User" : (mode === "create" ? "Add Product" : "Save Changes")}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}