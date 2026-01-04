import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Info, Image as ImageIcon } from "lucide-react";
import { Product, Category } from "@/lib/src";

interface ProductDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productForDetails: Product | null;
  localCategories: Category[];
}

export default function ProductDetailsDialog({
  open,
  onOpenChange,
  productForDetails,
  localCategories,
}: ProductDetailsDialogProps) {
  // دالة الحصول على اسم التصنيف من ID
  const getCategoryNameById = (categoryId: string): string => {
    if (!categoryId) return "غير مصنف";
    const category = localCategories.find((cat) => cat.id === categoryId);
    return category?.name || categoryId || "غير مصنف";
  };

  if (!productForDetails) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            تفاصيل المنتج
          </DialogTitle>
          <DialogDescription>
            {productForDetails && `معلومات المنتج: ${productForDetails.name}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-2">
                <Label className="text-gray-500">اسم المنتج</Label>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="font-medium">
                    {productForDetails.name || "غير محدد"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label className="text-gray-500">الوصف</Label>
                <div className="p-3 bg-gray-50 rounded border max-h-40 overflow-y-auto">
                  <p className="whitespace-pre-line">
                    {productForDetails.description || "لا يوجد وصف"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-gray-500">السعر</Label>
                  <div className="p-3 bg-gray-50 rounded border">
                    <p className="font-medium">
                      {productForDetails.price?.toLocaleString() || 0} ريال
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-500">سعر المقارنة</Label>
                  <div className="p-3 bg-gray-50 rounded border">
                    <p
                      className={
                        productForDetails.comparePrice
                          ? "font-medium line-through text-red-600"
                          : "text-gray-400"
                      }
                    >
                      {productForDetails.comparePrice?.toLocaleString() ||
                        "لا يوجد"}{" "}
                      ريال
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="space-y-2">
                <Label className="text-gray-500">التصنيف</Label>
                <div className="p-3 bg-gray-50 rounded border">
                  <Badge variant="outline">
                    {getCategoryNameById(productForDetails.category || "")}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label className="text-gray-500">الحالة</Label>
                <div className="p-3 bg-gray-50 rounded border">
                  <Badge
                    variant={
                      productForDetails.status === "active"
                        ? "default"
                        : productForDetails.status === "inactive"
                          ? "secondary"
                          : productForDetails.status === "draft"
                            ? "outline"
                            : productForDetails.status === "under_review"
                              ? "warning"
                              : "destructive"
                    }
                  >
                    {productForDetails.status === "active"
                      ? "نشط"
                      : productForDetails.status === "inactive"
                        ? "غير نشط"
                        : productForDetails.status === "draft"
                          ? "مسودة"
                          : productForDetails.status === "under_review"
                            ? "قيد المراجعة"
                            : "موقوف"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-gray-500">المخزون</Label>
                  <div className="p-3 bg-gray-50 rounded border">
                    <p className="font-medium">
                      {productForDetails.inventory?.quantity || 0} وحدة
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-500">حد الإنذار</Label>
                  <div className="p-3 bg-gray-50 rounded border">
                    <p className="font-medium">
                      {productForDetails.inventory?.lowStockThreshold || 5} وحدة
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-500">الوسوم</Label>
            <div className="p-3 bg-gray-50 rounded border">
              {productForDetails.tags && productForDetails.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {productForDetails.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">لا توجد وسوم</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-500">الصور</Label>
            <div className="p-3 bg-gray-50 rounded border">
              {productForDetails.images &&
              productForDetails.images.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {productForDetails.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`صورة ${index + 1}`}
                        className="h-24 w-full object-cover rounded"
                      />
                      <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400">لا توجد صور</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-500">تاريخ الإنشاء</Label>
              <div className="p-3 bg-gray-50 rounded border">
                <p>
                  {productForDetails.createdAt
                    ? new Date(productForDetails.createdAt).toLocaleString(
                        "ar-SA",
                      )
                    : "غير محدد"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-500">تاريخ التحديث</Label>
              <div className="p-3 bg-gray-50 rounded border">
                <p>
                  {productForDetails.updatedAt
                    ? new Date(productForDetails.updatedAt).toLocaleString(
                        "ar-SA",
                      )
                    : "غير محدد"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>إغلاق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
