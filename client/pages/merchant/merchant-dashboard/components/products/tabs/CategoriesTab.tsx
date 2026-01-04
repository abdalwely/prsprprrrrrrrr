import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Grid,
  Upload,
  Download,
  Merge,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Category,
  categoryService,
  deleteCategorySafely,
  mergeCategoriesWithValidation,
  exportCategoriesFormatted,
  importCategoriesWithValidation,
  Product,
} from "@/lib/src";

interface CategoriesTabProps {
  currentStore: any;
  localProducts: Product[];
  localCategories: Category[];
  loadInitialData: () => Promise<void>;
}

export default function CategoriesTab({
  currentStore,
  localProducts,
  localCategories,
  loadInitialData,
}: CategoriesTabProps) {
  const { toast } = useToast();
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [categoryDetails, setCategoryDetails] = useState<any[]>([]);

  // Category Form State
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [newCategoryDescription, setNewCategoryDescription] =
    useState<string>("");
  const [newCategoryOrder, setNewCategoryOrder] = useState<number>(0);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState<string | null>(
    null,
  );

  // Delete Dialog State
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"direct" | "move">("direct");
  const [moveToCategoryId, setMoveToCategoryId] = useState<string>("");

  // Merge Dialog State
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [sourceCategoryId, setSourceCategoryId] = useState<string>("");
  const [targetCategoryId, setTargetCategoryId] = useState<string>("");
  const [mergeMoveProducts, setMergeMoveProducts] = useState(true);

  // Export Dialog State
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | "excel">(
    "json",
  );

  // Import Dialog State
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState<string>("");

  // تصفية الفئات
  useEffect(() => {
    if (!localCategories.length) {
      setFilteredCategories([]);
      return;
    }

    let filtered = [...localCategories];
    filtered = filtered.sort((a, b) => a.order - b.order);
    setFilteredCategories(filtered);
  }, [localCategories]);

  // دالة حساب عدد المنتجات في الفئة
  const getProductCount = (categoryId: string) => {
    return localProducts.filter((p) => p.category === categoryId).length;
  };

  // دالة إضافة/تحديث تصنيف
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "خطأ في الإدخال",
        description: "يرجى إدخال اسم التصنيف",
        variant: "destructive",
      });
      return;
    }

    if (!currentStore) {
      toast({
        title: "خطأ في بيانات المتجر",
        description: "يرجى تحديد متجر أولاً",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingCategory(true);

    try {
      const categoryData: any = {
        storeId: currentStore.id,
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim(),
        order: newCategoryOrder,
        isActive: true,
      };

      if (isEditingCategory) {
        // تحديث فئة موجودة
        await categoryService.update(isEditingCategory, {
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim(),
          order: newCategoryOrder,
        });

        toast({
          title: "تم تحديث التصنيف بنجاح",
          description: `تم تحديث تصنيف "${newCategoryName}"`,
        });
      } else {
        // إضافة فئة جديدة
        await categoryService.create(categoryData);

        toast({
          title: "تم إضافة التصنيف بنجاح",
          description: `تم إضافة تصنيف "${newCategoryName}"`,
        });
      }

      await loadInitialData();
      handleResetCategoryForm();
    } catch (error: any) {
      console.error("Error creating/updating category:", error);
      toast({
        title: `خطأ في ${isEditingCategory ? "تحديث" : "إضافة"} الفئة`,
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // دالة لإعادة تعيين نموذج الفئة
  const handleResetCategoryForm = () => {
    setNewCategoryName("");
    setNewCategoryDescription("");
    setNewCategoryOrder(filteredCategories.length);
    setIsEditingCategory(null);
  };

  // دالة لتحميل بيانات الفئة للتعديل
  const handleLoadCategoryForEdit = (category: Category) => {
    setNewCategoryName(category.name);
    setNewCategoryDescription(category.description || "");
    setNewCategoryOrder(category.order);
    setIsEditingCategory(category.id);
  };

  // دالة لتغيير حالة الفئة
  const handleToggleCategoryStatus = async (category: Category) => {
    try {
      await categoryService.toggleCategoryStatus(
        category.id,
        !category.isActive,
      );

      toast({
        title: "تم التحديث",
        description: `تم ${!category.isActive ? "تفعيل" : "تعطيل"} الفئة "${category.name}"`,
      });

      await loadInitialData();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "تعذر تغيير حالة الفئة",
        variant: "destructive",
      });
    }
  };

  // دالة لبدء حذف الفئة
  const handleDeleteCategoryClick = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
  };

  // دالة تنفيذ حذف الفئة
  const handleDeleteCategory = async () => {
    if (!categoryToDelete || !currentStore) return;

    try {
      if (deleteMode === "move" && moveToCategoryId) {
        await deleteCategorySafely(categoryToDelete.id, moveToCategoryId);

        toast({
          title: "تم حذف الفئة",
          description: `تم نقل المنتجات إلى فئة أخرى وحذف "${categoryToDelete.name}"`,
        });
      } else {
        await categoryService.delete(categoryToDelete.id);

        toast({
          title: "تم حذف الفئة",
          description: `تم حذف الفئة "${categoryToDelete.name}"`,
        });
      }

      await loadInitialData();
    } catch (error: any) {
      toast({
        title: "خطأ في الحذف",
        description: error.message || "تعذر حذف الفئة",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setCategoryToDelete(null);
      setDeleteMode("direct");
      setMoveToCategoryId("");
    }
  };

  // دالة لدمج الفئات
  const handleMergeCategories = async () => {
    if (
      !sourceCategoryId ||
      !targetCategoryId ||
      sourceCategoryId === targetCategoryId
    ) {
      toast({
        title: "بيانات غير صالحة",
        description: "يرجى اختيار فئتين مختلفتين للدمج",
        variant: "destructive",
      });
      return;
    }

    try {
      await mergeCategoriesWithValidation({
        sourceCategoryId,
        targetCategoryId,
        moveProducts: mergeMoveProducts,
      });

      toast({
        title: "تم دمج الفئات",
        description: "تم دمج الفئات بنجاح",
      });

      await loadInitialData();
      setShowMergeDialog(false);
    } catch (error: any) {
      toast({
        title: "خطأ في الدمج",
        description: error.message || "تعذر دمج الفئات",
        variant: "destructive",
      });
    }
  };

  // دالة لتصدير الفئات
  const handleExportCategories = async () => {
    if (!currentStore?.id) return;

    try {
      const data = await exportCategoriesFormatted(
        currentStore.id,
        exportFormat,
      );

      if (exportFormat === "json") {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `categories-${currentStore.id}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (exportFormat === "csv") {
        let csvContent = "الاسم,الوصف,عدد المنتجات,الحالة\n";

        if (data.categories && Array.isArray(data.categories)) {
          data.categories.forEach((cat: any) => {
            const row = [
              `"${cat.name || ""}"`,
              `"${cat.description || ""}"`,
              cat.productCount || 0,
              cat.isActive ? "نشطة" : "غير نشطة",
            ].join(",");
            csvContent += row + "\n";
          });
        }

        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `categories-${currentStore.id}-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      toast({
        title: "تم التصدير",
        description: `تم تصدير الفئات بنجاح`,
      });

      setShowExportDialog(false);
    } catch (error: any) {
      toast({
        title: "خطأ في التصدير",
        description: error.message || "تعذر تصدير الفئات",
        variant: "destructive",
      });
    }
  };

  // دالة لاستيراد الفئات
  const handleImportCategories = async () => {
    if (!currentStore?.id || !importData.trim()) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى تعبئة جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    try {
      let parsedData;
      try {
        parsedData = JSON.parse(importData);
      } catch (e) {
        toast({
          title: "خطأ في تنسيق البيانات",
          description: "يجب أن تكون البيانات بتنسيق JSON صحيح",
          variant: "destructive",
        });
        return;
      }

      const categoriesArray = Array.isArray(parsedData)
        ? parsedData
        : parsedData.categories || [];

      await importCategoriesWithValidation(
        currentStore.id,
        categoriesArray.map((cat: any) => ({
          name: cat.name,
          description: cat.description,
          order: cat.order,
          isActive: true,
        })),
      );

      toast({
        title: "تم الاستيراد",
        description: `تم استيراد ${categoriesArray.length} فئة`,
      });

      await loadInitialData();
      setShowImportDialog(false);
      setImportData("");
    } catch (error: any) {
      toast({
        title: "خطأ في الاستيراد",
        description: error.message || "تعذر استيراد الفئات",
        variant: "destructive",
      });
    }
  };

  // دالة لتحديث ترتيب الفئات
  const handleUpdateCategoryOrder = async (
    categoryId: string,
    newOrder: number,
  ) => {
    try {
      const category = localCategories.find((c) => c.id === categoryId);
      if (!category) return;

      await categoryService.update(categoryId, { order: newOrder });

      toast({
        title: "تم التحديث",
        description: "تم تحديث ترتيب الفئة",
      });

      await loadInitialData();
    } catch (error: any) {
      toast({
        title: "خطأ في تحديث الترتيب",
        description: error.message || "تعذر تحديث الترتيب",
        variant: "destructive",
      });
    }
  };

  // دالة إعادة تحميل البيانات
  const reloadData = async () => {
    try {
      await loadInitialData();
      toast({
        title: "تم تحديث البيانات",
        description: "تم تحديث بيانات التصنيفات",
      });
    } catch (error: any) {
      toast({
        title: "خطأ في تحديث البيانات",
        description: error.message || "تعذر تحديث البيانات",
        variant: "destructive",
      });
    }
  };

  // حساب إحصائيات الفئات
  const calculateCategoryStats = () => {
    if (categoryDetails.length > 0) {
      return {
        totalCategories: categoryDetails.length,
        activeCategories: categoryDetails.filter((c) => c.isActive).length,
        totalProducts: categoryDetails.reduce(
          (sum, cat) => sum + cat.productCount,
          0,
        ),
        emptyCategories: categoryDetails.filter((c) => c.productCount === 0)
          .length,
      };
    }

    return {
      totalCategories: filteredCategories.length,
      activeCategories: filteredCategories.filter((c) => c.isActive).length,
      totalProducts: filteredCategories.reduce(
        (sum, cat) => sum + getProductCount(cat.id),
        0,
      ),
      emptyCategories: filteredCategories.filter(
        (cat) => getProductCount(cat.id) === 0,
      ).length,
    };
  };

  const stats = calculateCategoryStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">التصنيفات والخيارات</h2>
          <p className="text-muted-foreground">
            إدارة {localCategories.length} تصنيف في متجرك
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowImportDialog(true)}>
            <Upload className="h-4 w-4 ml-2" />
            استيراد
          </Button>
          <Button variant="outline" onClick={() => setShowExportDialog(true)}>
            <Download className="h-4 w-4 ml-2" />
            تصدير
          </Button>
          <Button variant="outline" onClick={() => setShowMergeDialog(true)}>
            <Merge className="h-4 w-4 ml-2" />
            دمج
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {isEditingCategory ? "تعديل التصنيف" : "إضافة تصنيف جديد"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>اسم التصنيف *</Label>
              <Input
                placeholder="أدخل اسم التصنيف"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                disabled={isCreatingCategory}
              />
            </div>
            <div className="space-y-2">
              <Label>وصف التصنيف</Label>
              <Textarea
                placeholder="أدخل وصف قصير"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                disabled={isCreatingCategory}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>ترتيب العرض</Label>
              <Input
                type="number"
                placeholder="0"
                value={newCategoryOrder}
                onChange={(e) =>
                  setNewCategoryOrder(parseInt(e.target.value) || 0)
                }
                min="0"
                disabled={isCreatingCategory}
              />
              <p className="text-xs text-muted-foreground">
                الفئات ذات الرقم الأقل تظهر أولاً
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddCategory}
                className="flex-1"
                disabled={isCreatingCategory || !newCategoryName.trim()}
              >
                {isCreatingCategory ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : isEditingCategory ? (
                  <>
                    <Edit className="h-4 w-4 ml-2" />
                    تحديث التصنيف
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة التصنيف
                  </>
                )}
              </Button>
              {isEditingCategory && (
                <Button variant="outline" onClick={handleResetCategoryForm}>
                  إلغاء
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>التصنيفات المتاحة</CardTitle>
                <CardDescription>جميع تصنيفات المتجر</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={reloadData}>
                <RefreshCw className="h-4 w-4 ml-2" />
                تحديث
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredCategories.length === 0 ? (
                <div className="text-center py-8">
                  <Grid className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">لا توجد تصنيفات</p>
                  <p className="text-sm text-gray-400 mt-1">
                    لم يتم إضافة أي تصنيفات بعد
                  </p>
                  <Button
                    onClick={() => setNewCategoryName("فئة جديدة")}
                    variant="outline"
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 ml-2" />
                    إنشاء فئة أولى
                  </Button>
                </div>
              ) : (
                filteredCategories.map((category) => {
                  const productCount = getProductCount(category.id);

                  return (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                    >
                      <div className="text-right flex-1">
                        <div className="flex items-center gap-2 justify-end">
                          <p className="font-medium">{category.name}</p>
                          {isEditingCategory === category.id && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-50"
                            >
                              قيد التعديل
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground text-right">
                          {category.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1 justify-end">
                          <span className="text-xs text-gray-500">
                            المنتجات: {productCount}
                          </span>
                          <span className="text-xs text-gray-500">
                            الترتيب: {category.order}
                          </span>
                          <div className="flex items-center gap-1">
                            <Switch
                              checked={category.isActive}
                              onCheckedChange={() =>
                                handleToggleCategoryStatus(category)
                              }
                            />
                            {category.isActive ? (
                              <Badge
                                variant="outline"
                                className="text-xs bg-green-50"
                              >
                                نشط
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-xs bg-gray-50"
                              >
                                غير نشط
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mr-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLoadCategoryForEdit(category)}
                          title="تعديل"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategoryClick(category)}
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              handleUpdateCategoryOrder(
                                category.id,
                                category.order - 1,
                              )
                            }
                            disabled={category.order === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              handleUpdateCategoryOrder(
                                category.id,
                                category.order + 1,
                              )
                            }
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {filteredCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>إحصائيات التصنيفات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">{stats.totalCategories}</p>
                <p className="text-sm text-muted-foreground">
                  إجمالي التصنيفات
                </p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {stats.activeCategories}
                </p>
                <p className="text-sm text-muted-foreground">تصنيفات نشطة</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalProducts}
                </p>
                <p className="text-sm text-muted-foreground">إجمالي المنتجات</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {stats.emptyCategories}
                </p>
                <p className="text-sm text-muted-foreground">فئات فارغة</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <h4 className="font-medium">توزيع المنتجات على الفئات:</h4>
              {filteredCategories
                .filter((cat) => getProductCount(cat.id) > 0)
                .sort((a, b) => getProductCount(b.id) - getProductCount(a.id))
                .slice(0, 5)
                .map((cat) => {
                  const productCount = getProductCount(cat.id);
                  const maxProducts = Math.max(
                    ...filteredCategories.map((c) => getProductCount(c.id)),
                  );
                  const percentage = (productCount / maxProducts) * 100;

                  return (
                    <div key={cat.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{cat.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{productCount} منتج</Badge>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* نافذة حذف الفئة */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الفئة</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                {categoryToDelete && (
                  <>
                    <p className="mb-2">هل أنت متأكد من رغبتك في حذف الفئة:</p>
                    <div className="p-3 bg-gray-100 rounded mb-4">
                      <p className="font-medium">{categoryToDelete.name}</p>
                      {categoryToDelete.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {categoryToDelete.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="delete-direct"
                          checked={deleteMode === "direct"}
                          onChange={() => setDeleteMode("direct")}
                        />
                        <label htmlFor="delete-direct" className="text-sm">
                          حذف مباشر (فقط إذا كانت الفئة فارغة)
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="delete-move"
                          checked={deleteMode === "move"}
                          onChange={() => setDeleteMode("move")}
                        />
                        <label htmlFor="delete-move" className="text-sm">
                          حذف آمن مع نقل المنتجات إلى فئة أخرى
                        </label>
                      </div>

                      {deleteMode === "move" && (
                        <div className="ml-6 mt-2">
                          <Select
                            value={moveToCategoryId}
                            onValueChange={setMoveToCategoryId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الفئة الهدف" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredCategories
                                .filter((cat) => cat.id !== categoryToDelete.id)
                                .map((category) => (
                                  <SelectItem
                                    key={category.id}
                                    value={category.id}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMode === "move" && !moveToCategoryId}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* نافذة دمج الفئات */}
      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>دمج الفئات</DialogTitle>
            <DialogDescription>دمج فئتين في فئة واحدة</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>الفئة المصدر (سيتم حذفها)</Label>
              <Select
                value={sourceCategoryId}
                onValueChange={setSourceCategoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة المصدر" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الفئة الهدف (سيتم الاحتفاظ بها)</Label>
              <Select
                value={targetCategoryId}
                onValueChange={setTargetCategoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة الهدف" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="move-products"
                checked={mergeMoveProducts}
                onChange={(e) => setMergeMoveProducts(e.target.checked)}
              />
              <label htmlFor="move-products" className="text-sm">
                نقل المنتجات من الفئة المصدر إلى الهدف
              </label>
            </div>

            {sourceCategoryId &&
              targetCategoryId &&
              sourceCategoryId === targetCategoryId && (
                <div className="p-2 bg-red-50 text-red-700 text-sm rounded">
                  ⚠️ لا يمكن دمج الفئة مع نفسها
                </div>
              )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMergeDialog(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleMergeCategories}
              disabled={
                !sourceCategoryId ||
                !targetCategoryId ||
                sourceCategoryId === targetCategoryId
              }
            >
              دمج الفئات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة تصدير الفئات */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تصدير الفئات</DialogTitle>
            <DialogDescription>تصدير الفئات إلى ملف</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>التنسيق</Label>
              <Select
                value={exportFormat}
                onValueChange={setExportFormat as any}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded">
              سيتم تصدير جميع الفئات بتنسيق {exportFormat.toUpperCase()}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowExportDialog(false)}
            >
              إلغاء
            </Button>
            <Button onClick={handleExportCategories}>تصدير</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة استيراد الفئات */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>استيراد الفئات</DialogTitle>
            <DialogDescription>استيراد الفئات من ملف JSON</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>بيانات الفئات (JSON)</Label>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder='[
  {"name": "اسم الفئة 1", "description": "وصف الفئة 1"},
  {"name": "اسم الفئة 2", "description": "وصف الفئة 2"}
]'
                rows={10}
                className="w-full border rounded p-2 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                أدخل البيانات بتنسيق JSON صحيح
              </p>
            </div>

            <div className="p-3 bg-amber-50 text-amber-700 text-sm rounded">
              ⚠️ سيتم إنشاء الفئات الجديدة فقط (سيتم تخطي الفئات الموجودة
              مسبقاً)
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowImportDialog(false)}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleImportCategories}
              disabled={!importData.trim()}
            >
              استيراد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
