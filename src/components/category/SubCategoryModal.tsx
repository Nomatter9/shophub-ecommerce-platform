// components/category/SubCategoryModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

export default function SubCategoryModal({ open, subCategory, categories, mode, onClose }: any) {
  

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-bg-card text-white max-w-2xl border border-border-subtle">
        <DialogHeader className="border-b border-border-subtle pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl"></DialogTitle>
            <button  className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Sub Category Image</label>
            <div className="flex items-center gap-4">
                <img src={subCategory.image} alt="Sub Category" className="w-24 h-24 rounded-lg object-cover" />       
               <Button variant="outline" size="sm">Upload Image</Button>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Parent Category *</label>
            <select
              disabled
              className="w-full px-3 py-2 bg-bg-soft border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select parent category</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Sub Category Name *</label>
            <Input
              placeholder="Enter sub category name"
              disabled
              className="bg-bg-soft border-gray-700"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Description</label>
            <textarea
              placeholder="Enter sub category description"
              disabled
              rows={4}
              className="w-full px-3 py-2 bg-bg-soft border border-gray-700 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Sort Order</label>
            <Input
              type="number"
              placeholder="Enter sort order"
              disabled
              className="bg-bg-soft border-gray-700"
            />
          </div>
            <div className="flex gap-3 pt-4 border-t border-border-subtle">
              <Button onClick={onClose} variant="outline" className="flex-1">Cancel</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90"></Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}