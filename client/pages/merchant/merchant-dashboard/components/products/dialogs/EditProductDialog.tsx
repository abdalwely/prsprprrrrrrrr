import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Image as ImageIcon,
  Plus,
  X,
  Loader2,
  Upload,
  RefreshCw,
  Save,
} from "lucide-react";
import { Product, Category, ProductStatus, productService } from "@/lib/src";

// استيراد خدمة رفع الصور
import { uploadService } from "@/lib/src/services/upload/upload.service";

interface EditProductFormData {
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  category: string;
  status: ProductStatus;
  inventory: {
    quantity: number;
    lowStockThreshold: number;
    trackInventory: boolean;
    backorders: boolean;
  };
  images: string[];
  tags: string[];
  featured: boolean;
  reviewsEnabled: boolean;
}

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productToEdit: Product | null;
  localCategories: Category[];
  currentStore: any;
  toast: any;
  setLocalProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  loadInitialData: () => Promise<void>;
}

export default function EditProductDialog({
  open,
  onOpenChange,
  productToEdit,
  localCategories,
  currentStore,
  toast,
  setLocalProducts,
  loadInitialData,
}: EditProductDialogProps) {
  const [editProductForm, setEditProductForm] = useState<EditProductFormData>({
    name: "",
    description: "",
    price: 0,
    comparePrice: 0,
    category: "",
    status: ProductStatus.ACTIVE,
    inventory: {
      quantity: 0,
      lowStockThreshold: 5,
      trackInventory: true,
      backorders: false,
    },
    images: [],
    tags: [],
    featured: false,
    reviewsEnabled: true,
  });
  const [originalProductData, setOriginalProductData] =
    useState<EditProductFormData | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isSavingBasic, setIsSavingBasic] = useState(false);
  const [isSavingInventory, setIsSavingInventory] = useState(false);
  const [isSavingAdvanced, setIsSavingAdvanced] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const [newTagInput, setNewTagInput] = useState<string>("");

  // Refs لمدخلات الملفات
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );

  // تهيئة النموذج عند فتح النافذة
  useEffect(() => {
    if (productToEdit && open) {
      const initialData = {
        name: productToEdit.name || "",
        description: productToEdit.description || "",
        price: productToEdit.price || 0,
        comparePrice: productToEdit.comparePrice || 0,
        category: productToEdit.category || "",
        status: productToEdit.status || ProductStatus.ACTIVE,
        inventory: {
          quantity: productToEdit.inventory?.quantity || 0,
          lowStockThreshold: productToEdit.inventory?.lowStockThreshold || 5,
          trackInventory: productToEdit.inventory?.trackInventory !== false,
          backorders: productToEdit.inventory?.backorders || false,
        },
        images: productToEdit.images || [],
        tags: productToEdit.tags || [],
        featured: productToEdit.featured || false,
        reviewsEnabled: productToEdit.reviewsEnabled !== false,
      };

      setEditProductForm(initialData);
      setOriginalProductData(initialData);
    }
  }, [productToEdit, open]);

  // التحقق إذا كانت هناك تغييرات في التبويب الأساسي
  const hasBasicChanges = () => {
    if (!originalProductData) return false;

    return (
      editProductForm.name !== originalProductData.name ||
      editProductForm.description !== originalProductData.description ||
      editProductForm.price !== originalProductData.price ||
      editProductForm.comparePrice !== originalProductData.comparePrice ||
      editProductForm.category !== originalProductData.category ||
      editProductForm.status !== originalProductData.status
    );
  };

  // التحقق إذا كانت هناك تغييرات في المخزون والصور
  const hasInventoryChanges = () => {
    if (!originalProductData) return false;

    return (
      editProductForm.inventory.quantity !==
        originalProductData.inventory.quantity ||
      editProductForm.inventory.lowStockThreshold !==
        originalProductData.inventory.lowStockThreshold ||
      editProductForm.inventory.trackInventory !==
        originalProductData.inventory.trackInventory ||
      editProductForm.inventory.backorders !==
        originalProductData.inventory.backorders ||
      JSON.stringify(editProductForm.images) !==
        JSON.stringify(originalProductData.images)
    );
  };

  // التحقق إذا كانت هناك تغييرات في الإعدادات المتقدمة
  const hasAdvancedChanges = () => {
    if (!originalProductData) return false;

    return (
      editProductForm.featured !== originalProductData.featured ||
      editProductForm.reviewsEnabled !== originalProductData.reviewsEnabled ||
      JSON.stringify(editProductForm.tags) !==
        JSON.stringify(originalProductData.tags)
    );
  };

  // دالة رفع صورة من الجهاز (تخزن مؤقتاً فقط)
  const handleUploadImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !currentStore?.id || !productToEdit?.id) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد صورة",
        variant: "destructive",
      });
      return;
    }

    // التحقق من نوع الملف
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "نوع ملف غير مدعوم",
        description: "يرجى اختيار صورة بصيغة JPG, PNG, WebP, GIF, أو SVG",
        variant: "destructive",
      });
      return;
    }

    // التحقق من حجم الملف (5MB كحد أقصى)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "حجم الملف كبير جداً",
        description: "الحد الأقصى لحجم الصورة هو 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      // رفع الصورة إلى Firebase Storage باستخدام uploadService
      const imageUrl = await uploadService.uploadImage(
        file,
        `stores/${currentStore.id}/products/${productToEdit.id}`,
      );

      // إضافة الصورة إلى القائمة (تخزين مؤقت فقط)
      setEditProductForm((prev) => ({
        ...prev,
        images: [...prev.images, imageUrl],
      }));

      toast({
        title: "تم رفع الصورة",
        description: "تم رفع الصورة بنجاح. سيتم حفظها عند حفظ التغييرات",
      });

      // مسح مدخل الملف
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("❌ خطأ في رفع الصورة:", error);
      toast({
        title: "خطأ في رفع الصورة",
        description: error.message || "تعذر رفع الصورة",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  // دالة تغيير صورة موجودة (تخزن مؤقتاً فقط)
  const handleReplaceImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !currentStore?.id || !productToEdit?.id || index === null) {
      return;
    }

    // التحقق من نوع الملف
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "نوع ملف غير مدعوم",
        description: "يرجى اختيار صورة بصيغة JPG, PNG, WebP, GIF, أو SVG",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "حجم الملف كبير جداً",
        description: "الحد الأقصى لحجم الصورة هو 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      // رفع الصورة الجديدة
      const newImageUrl = await uploadService.uploadImage(
        file,
        `stores/${currentStore.id}/products/${productToEdit.id}`,
      );

      // إنشاء نسخة جديدة من الصور مع استبدال الصورة المحددة (تخزين مؤقت)
      const updatedImages = [...editProductForm.images];
      updatedImages[index] = newImageUrl;

      setEditProductForm((prev) => ({
        ...prev,
        images: updatedImages,
      }));

      toast({
        title: "تم تغيير الصورة",
        description: "تم تغيير الصورة بنجاح. سيتم حفظها عند حفظ التغييرات",
      });

      // مسح مدخل الملف
      if (replaceFileInputRef.current) {
        replaceFileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("❌ خطأ في تغيير الصورة:", error);
      toast({
        title: "خطأ في تغيير الصورة",
        description: error.message || "تعذر تغيير الصورة",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
      setSelectedImageIndex(null);
    }
  };

  // دالة حفظ البيانات الأساسية
  // دالة حفظ البيانات الأساسية
  const handleSaveBasicData = async () => {
    if (!productToEdit || !currentStore?.id) {
      toast({
        title: "خطأ",
        description: "لم يتم تحديد منتج للتعديل",
        variant: "destructive",
      });
      return;
    }

    if (!editProductForm.name.trim()) {
      toast({
        title: "خطأ في الإدخال",
        description: "يرجى إدخال اسم المنتج",
        variant: "destructive",
      });
      return;
    }

    if (editProductForm.price <= 0) {
      toast({
        title: "خطأ في الإدخال",
        description: "يرجى إدخال سعر صحيح",
        variant: "destructive",
      });
      return;
    }

    setIsSavingBasic(true);
    try {
      // تحضير بيانات التحديث للبيانات الأساسية فقط
      const updateData: Partial<Product> = {
        name: editProductForm.name.trim(),
        description: editProductForm.description.trim(),
        price: editProductForm.price,
        comparePrice:
          editProductForm.comparePrice && editProductForm.comparePrice > 0
            ? editProductForm.comparePrice
            : undefined,
        category: editProductForm.category,
        status: editProductForm.status, // ⭐ تأكد من إرسال الحالة
        updatedAt: new Date(),
      };

      // ⭐ ⭐ ⭐ **التعديل المهم: إضافة preserveStatus**
      await productService.update(productToEdit.id, updateData, {
        preserveStatus: true, // ⭐ هذا يحفظ حالة المنتج
      });

      // تحديث البيانات المحلية
      setLocalProducts((prev) =>
        prev.map((p) =>
          p.id === productToEdit.id ? { ...p, ...updateData } : p,
        ),
      );

      // تحديث البيانات الأصلية للجزء المحفوظ
      setOriginalProductData((prev) =>
        prev
          ? {
              ...prev,
              name: editProductForm.name,
              description: editProductForm.description,
              price: editProductForm.price,
              comparePrice: editProductForm.comparePrice,
              category: editProductForm.category,
              status: editProductForm.status, // ⭐ تحديث الحالة
            }
          : null,
      );

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ البيانات الأساسية",
      });
    } catch (error: any) {
      console.error("❌ خطأ في حفظ البيانات الأساسية:", error);
      toast({
        title: "خطأ في الحفظ",
        description: error.message || "تعذر حفظ البيانات الأساسية",
        variant: "destructive",
      });
    } finally {
      setIsSavingBasic(false);
    }
  };

  // دالة حفظ المخزون والصور
  const handleSaveInventoryData = async () => {
    if (!productToEdit || !currentStore?.id) {
      toast({
        title: "خطأ",
        description: "لم يتم تحديد منتج للتعديل",
        variant: "destructive",
      });
      return;
    }

    setIsSavingInventory(true);
    try {
      // تحضير بيانات التحديث للمخزون والصور فقط
      const updateData: Partial<Product> = {
        inventory: {
          ...productToEdit.inventory,
          quantity: editProductForm.inventory.quantity,
          lowStockThreshold: editProductForm.inventory.lowStockThreshold,
          trackInventory: editProductForm.inventory.trackInventory,
          backorders: editProductForm.inventory.backorders,
        },
        images: editProductForm.images,
        updatedAt: new Date(),
      };

      // تحديث في Firestore
      await productService.update(productToEdit.id, updateData);

      // تحديث البيانات المحلية
      setLocalProducts((prev) =>
        prev.map((p) =>
          p.id === productToEdit.id
            ? {
                ...p,
                inventory: updateData.inventory,
                images: updateData.images,
              }
            : p,
        ),
      );

      // تحديث البيانات الأصلية للجزء المحفوظ
      setOriginalProductData((prev) =>
        prev
          ? {
              ...prev,
              inventory: editProductForm.inventory,
              images: editProductForm.images,
            }
          : null,
      );

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ بيانات المخزون والصور",
      });
    } catch (error: any) {
      console.error("❌ خطأ في حفظ بيانات المخزون والصور:", error);
      toast({
        title: "خطأ في الحفظ",
        description: error.message || "تعذر حفظ بيانات المخزون والصور",
        variant: "destructive",
      });
    } finally {
      setIsSavingInventory(false);
    }
  };

  // دالة حفظ الإعدادات المتقدمة
  const handleSaveAdvancedData = async () => {
    if (!productToEdit || !currentStore?.id) {
      toast({
        title: "خطأ",
        description: "لم يتم تحديد منتج للتعديل",
        variant: "destructive",
      });
      return;
    }

    setIsSavingAdvanced(true);
    try {
      // تحضير بيانات التحديث للإعدادات المتقدمة فقط
      const updateData: Partial<Product> = {
        featured: editProductForm.featured,
        reviewsEnabled: editProductForm.reviewsEnabled,
        tags: editProductForm.tags,
        updatedAt: new Date(),
      };

      // تحديث في Firestore
      await productService.update(productToEdit.id, updateData);

      // تحديث البيانات المحلية
      setLocalProducts((prev) =>
        prev.map((p) =>
          p.id === productToEdit.id
            ? {
                ...p,
                featured: updateData.featured,
                reviewsEnabled: updateData.reviewsEnabled,
                tags: updateData.tags,
              }
            : p,
        ),
      );

      // تحديث البيانات الأصلية للجزء المحفوظ
      setOriginalProductData((prev) =>
        prev
          ? {
              ...prev,
              featured: editProductForm.featured,
              reviewsEnabled: editProductForm.reviewsEnabled,
              tags: editProductForm.tags,
            }
          : null,
      );

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ الإعدادات المتقدمة",
      });
    } catch (error: any) {
      console.error("❌ خطأ في حفظ الإعدادات المتقدمة:", error);
      toast({
        title: "خطأ في الحفظ",
        description: error.message || "تعذر حفظ الإعدادات المتقدمة",
        variant: "destructive",
      });
    } finally {
      setIsSavingAdvanced(false);
    }
  };

  // دالة إضافة صورة عبر URL (تخزين مؤقت)
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) {
      toast({
        title: "خطأ في الإدخال",
        description: "يرجى إدخال رابط الصورة",
        variant: "destructive",
      });
      return;
    }

    if (!newImageUrl.startsWith("http")) {
      toast({
        title: "رابط غير صالح",
        description: "يرجى إدخال رابط صحيح يبدأ بـ http:// أو https://",
        variant: "destructive",
      });
      return;
    }

    setEditProductForm((prev) => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()],
    }));

    setNewImageUrl("");
    toast({
      title: "تمت الإضافة",
      description: "تم إضافة الصورة. سيتم حفظها عند حفظ التغييرات",
    });
  };

  // دالة حذف صورة (تخزين مؤقت)
  const handleRemoveImage = (index: number) => {
    const updatedImages = editProductForm.images.filter((_, i) => i !== index);

    setEditProductForm((prev) => ({
      ...prev,
      images: updatedImages,
    }));

    toast({
      title: "تم الحذف",
      description: "تم حذف الصورة. سيتم حفظ التغيير عند حفظ التعديلات",
    });
  };

  // دالة إضافة وسم (تخزين مؤقت)
  const handleAddTag = () => {
    if (!newTagInput.trim()) {
      toast({
        title: "خطأ في الإدخال",
        description: "يرجى إدخال وسم",
        variant: "destructive",
      });
      return;
    }

    const newTag = newTagInput.trim();
    if (!editProductForm.tags.includes(newTag)) {
      setEditProductForm((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));

      setNewTagInput("");
      toast({
        title: "تمت الإضافة",
        description: `تم إضافة الوسم "${newTag}". سيتم حفظه عند حفظ التغييرات`,
      });
    } else {
      toast({
        title: "الوسم موجود مسبقاً",
        description: `الوسم "${newTag}" موجود بالفعل`,
        variant: "destructive",
      });
    }
  };

  // دالة حذف وسم (تخزين مؤقت)
  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = editProductForm.tags.filter(
      (tag) => tag !== tagToRemove,
    );

    setEditProductForm((prev) => ({
      ...prev,
      tags: updatedTags,
    }));

    toast({
      title: "تم الحذف",
      description: `تم حذف الوسم "${tagToRemove}". سيتم حفظ التغيير عند حفظ التعديلات`,
    });
  };

  if (!productToEdit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            تعديل المنتج
          </DialogTitle>
          <DialogDescription>
            {productToEdit && `تعديل المنتج: ${productToEdit.name}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="basic">البيانات الأساسية</TabsTrigger>
              <TabsTrigger value="inventory">المخزون والصور</TabsTrigger>
              <TabsTrigger value="advanced">إعدادات متقدمة</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اسم المنتج *</Label>
                  <Input
                    value={editProductForm.name}
                    onChange={(e) =>
                      setEditProductForm({
                        ...editProductForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="أدخل اسم المنتج"
                  />
                </div>

                <div className="space-y-2">
                  <Label>التصنيف</Label>
                  <Select
                    value={editProductForm.category}
                    onValueChange={(value) =>
                      setEditProductForm({
                        ...editProductForm,
                        category: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر تصنيف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uncategorized">غير مصنف</SelectItem>
                      {localCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>وصف المنتج</Label>
                <Textarea
                  value={editProductForm.description}
                  onChange={(e) =>
                    setEditProductForm({
                      ...editProductForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="أدخل وصف المنتج"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>السعر *</Label>
                  <Input
                    type="number"
                    value={editProductForm.price}
                    onChange={(e) =>
                      setEditProductForm({
                        ...editProductForm,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="أدخل السعر"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label>سعر المقارنة (اختياري)</Label>
                  <Input
                    type="number"
                    value={editProductForm.comparePrice || ""}
                    onChange={(e) =>
                      setEditProductForm({
                        ...editProductForm,
                        comparePrice: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="السعر الأصلي قبل الخصم"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select
                  value={editProductForm.status}
                  onValueChange={(value) =>
                    setEditProductForm({
                      ...editProductForm,
                      status: value as ProductStatus,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ProductStatus.ACTIVE}>نشط</SelectItem>
                    <SelectItem value={ProductStatus.INACTIVE}>
                      غير نشط
                    </SelectItem>
                    <SelectItem value={ProductStatus.DRAFT}>مسودة</SelectItem>
                    <SelectItem value={ProductStatus.UNDER_REVIEW}>
                      قيد المراجعة
                    </SelectItem>
                    <SelectItem value={ProductStatus.SUSPENDED}>
                      موقوف
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* زر حفظ البيانات الأساسية */}
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={handleSaveBasicData}
                  disabled={isSavingBasic || !hasBasicChanges()}
                >
                  {isSavingBasic ? (
                    <>
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 ml-2" />
                      حفظ البيانات الأساسية
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الكمية المتاحة</Label>
                  <Input
                    type="number"
                    value={editProductForm.inventory.quantity}
                    onChange={(e) =>
                      setEditProductForm({
                        ...editProductForm,
                        inventory: {
                          ...editProductForm.inventory,
                          quantity: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    placeholder="الكمية"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>حد الإنذار للمخزون المنخفض</Label>
                  <Input
                    type="number"
                    value={editProductForm.inventory.lowStockThreshold}
                    onChange={(e) =>
                      setEditProductForm({
                        ...editProductForm,
                        inventory: {
                          ...editProductForm.inventory,
                          lowStockThreshold: parseInt(e.target.value) || 5,
                        },
                      })
                    }
                    placeholder="الحد الأدنى"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <Label className="text-sm">تتبع المخزون</Label>
                    <p className="text-xs text-muted-foreground">
                      تتبع الكمية تلقائياً
                    </p>
                  </div>
                  <Switch
                    checked={editProductForm.inventory.trackInventory}
                    onCheckedChange={(checked) =>
                      setEditProductForm({
                        ...editProductForm,
                        inventory: {
                          ...editProductForm.inventory,
                          trackInventory: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <Label className="text-sm">السماح بالطلبات المؤجلة</Label>
                    <p className="text-xs text-muted-foreground">
                      السماح بالطلب عند نفاذ المخزون
                    </p>
                  </div>
                  <Switch
                    checked={editProductForm.inventory.backorders}
                    onCheckedChange={(checked) =>
                      setEditProductForm({
                        ...editProductForm,
                        inventory: {
                          ...editProductForm.inventory,
                          backorders: checked,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  صور المنتج
                </Label>

                <div className="space-y-4">
                  {/* زر إضافة صورة من الجهاز */}
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleUploadImage}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      disabled={isUploadingImage}
                      className="w-full"
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                          جاري الرفع...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 ml-2" />
                          إضافة صورة من الجهاز
                        </>
                      )}
                    </Button>
                  </div>

                  {/* إضافة صورة عبر URL */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="أدخل رابط الصورة"
                        className="flex-1"
                      />
                      <Button onClick={handleAddImageUrl} type="button">
                        <Plus className="h-4 w-4 ml-2" />
                        إضافة عبر الرابط
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      أدخل رابط الصورة الكامل يبدأ بـ http:// أو https://
                    </p>
                  </div>

                  {/* معرض الصور */}
                  {editProductForm.images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                      {editProductForm.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`صورة ${index + 1}`}
                            className="h-24 w-full object-cover rounded border"
                          />
                          <div className="absolute top-1 right-1 flex flex-col gap-1">
                            <Button
                              size="icon"
                              variant="destructive"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <input
                              type="file"
                              ref={replaceFileInputRef}
                              onChange={(e) => handleReplaceImage(e, index)}
                              accept="image/*"
                              className="hidden"
                              key={`replace-${index}`}
                            />
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                setSelectedImageIndex(index);
                                replaceFileInputRef.current?.click();
                              }}
                              disabled={isUploadingImage}
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">لم يتم إضافة صور بعد</p>
                    </div>
                  )}
                </div>
              </div>

              {/* زر حفظ المخزون والصور */}
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={handleSaveInventoryData}
                  disabled={isSavingInventory || !hasInventoryChanges()}
                >
                  {isSavingInventory ? (
                    <>
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 ml-2" />
                      حفظ المخزون والصور
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <Label className="text-sm">منتج مميز</Label>
                    <p className="text-xs text-muted-foreground">
                      عرض في القسم المميز
                    </p>
                  </div>
                  <Switch
                    checked={editProductForm.featured}
                    onCheckedChange={(checked) =>
                      setEditProductForm({
                        ...editProductForm,
                        featured: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <Label className="text-sm">السماح بالتعليقات</Label>
                    <p className="text-xs text-muted-foreground">
                      السماح للعملاء بالتقييم
                    </p>
                  </div>
                  <Switch
                    checked={editProductForm.reviewsEnabled}
                    onCheckedChange={(checked) =>
                      setEditProductForm({
                        ...editProductForm,
                        reviewsEnabled: checked,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>الوسوم</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      placeholder="أدخل وسم واضغط Enter أو زر الإضافة"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button onClick={handleAddTag} type="button">
                      إضافة
                    </Button>
                  </div>

                  {editProductForm.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editProductForm.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {tag}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-4 w-4"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      لم تتم إضافة وسوم بعد
                    </p>
                  )}
                </div>
              </div>

              {/* زر حفظ الإعدادات المتقدمة */}
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={handleSaveAdvancedData}
                  disabled={isSavingAdvanced || !hasAdvancedChanges()}
                >
                  {isSavingAdvanced ? (
                    <>
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 ml-2" />
                      حفظ الإعدادات المتقدمة
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
