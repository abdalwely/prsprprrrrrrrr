import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  EyeOff,
  RefreshCw,
  Plus,
  Search,
  Tag,
  ShieldAlert,
  AlertCircle,
  Edit,
  Eye,
  Package,
  ShoppingBag,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Product,
  Category,
  ProductStatus,
  ComplianceStatus,
  productService,
  getComplianceFlags,
  optimizationTipsService,
  getStoreCategoriesByStoreId,
  getAllCategoriesWithDetails,
} from "@/lib/src";
import { StatusBadge } from "../../shared/StatusBadge";

interface ProductsManagementTabProps {
  currentStore: any;
  localProducts: Product[];
  localCategories: Category[];
  navigate: (path: string) => void;
  loadInitialData: () => Promise<void>;
  setProductToEdit: (product: Product) => void;
  setShowEditProductDialog: (open: boolean) => void;
  setProductForDetails: (product: Product) => void;
  setShowProductDetailsDialog: (open: boolean) => void;
  setProductForComplianceDetails: (product: Product) => void;
  setShowComplianceDetailsDialog: (open: boolean) => void;
  handleFixMissingCreatedAt: () => Promise<void>;
}

export default function ProductsManagementTab({
  currentStore,
  localProducts,
  localCategories,
  navigate,
  loadInitialData,
  setProductToEdit,
  setShowEditProductDialog,
  setProductForDetails,
  setShowProductDetailsDialog,
  setProductForComplianceDetails,
  setShowComplianceDetailsDialog,
  handleFixMissingCreatedAt,
}: ProductsManagementTabProps) {
  const { toast } = useToast();
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [complianceFlags, setComplianceFlags] = useState<any[]>([]);
  const [optimizationTips, setOptimizationTips] = useState<any>(null);
  const [categoryDetails, setCategoryDetails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  // تحميل البيانات الإضافية
  useEffect(() => {
    const loadAdditionalData = async () => {
      if (!currentStore?.id) return;

      try {
        // تحميل بيانات الامتثال
        const flags = await getComplianceFlags(currentStore.id, "pending", 20);
        setComplianceFlags(flags);

        // تحميل نصائح التحسين
        const tips = await optimizationTipsService.getOptimizationDashboard(
          currentStore.id,
        );
        setOptimizationTips(tips);

        // تحميل تفاصيل الفئات
        const details = await getAllCategoriesWithDetails(currentStore.id);
        setCategoryDetails(details);
      } catch (error) {
        console.warn("⚠️ خطأ في تحميل البيانات الإضافية:", error);
      }
    };

    loadAdditionalData();
  }, [currentStore?.id]);

  // دالة للحصول على شارة حالة الامتثال
  const getComplianceBadge = (product: Product) => {
    const semantics = product._semantics;

    if (!semantics) {
      return (
        <Badge variant="outline" className="bg-gray-50">
          <Clock className="h-3 w-3 ml-1" />
          قيد الكشف
        </Badge>
      );
    }

    const status = semantics.complianceStatus;
    const shadowActions = semantics.shadowActions;

    switch (status) {
      case ComplianceStatus.COMPLIANT:
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <CheckCircle className="h-3 w-3 ml-1" />
            متوافق
          </Badge>
        );

      case ComplianceStatus.NON_COMPLIANT:
        if (shadowActions?.hideFromSearch) {
          return (
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-700 border-amber-200"
            >
              <EyeOff className="h-3 w-3 ml-1" />
              مخفي من البحث
            </Badge>
          );
        }
        if (product.status === ProductStatus.UNDER_REVIEW) {
          return (
            <Badge
              variant="outline"
              className="bg-yellow-50 text-yellow-700 border-yellow-200"
            >
              <AlertTriangle className="h-3 w-3 ml-1" />
              يحتاج مراجعة
            </Badge>
          );
        }
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            <XCircle className="h-3 w-3 ml-1" />
            غير متوافق
          </Badge>
        );

      case ComplianceStatus.PENDING_REVIEW:
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            <Clock className="h-3 w-3 ml-1" />
            قيد المراجعة
          </Badge>
        );

      case ComplianceStatus.EXEMPTED:
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            <ShieldAlert className="h-3 w-3 ml-1" />
            معفى
          </Badge>
        );

      default:
        return (
          <Badge variant="outline" className="bg-gray-50">
            <Clock className="h-3 w-3 ml-1" />
            قيد الكشف
          </Badge>
        );
    }
  };

  // دالة للحصول على تحذير الامتثال
  const getComplianceWarning = (product: Product) => {
    const semantics = product._semantics;
    if (!semantics) return null;

    if (semantics.validationFlags && semantics.validationFlags.length > 0) {
      return {
        type: "warning" as const,
        message: semantics.validationFlags[0],
        flags: semantics.validationFlags,
      };
    }

    if (semantics.complianceStatus === ComplianceStatus.NON_COMPLIANT) {
      return {
        type: "error" as const,
        message: "المنتج غير متوافق مع نشاط المتجر",
      };
    }

    if (semantics.shadowActions?.hideFromSearch) {
      return {
        type: "info" as const,
        message: "المنتج مخفي من نتائج البحث",
      };
    }

    return null;
  };

  // دالة للحصول على اسم التصنيف من المنتج
  const getProductCategoryName = (product: Product): string => {
    if (!product.category) return "غير مصنف";

    const category = filteredCategories.find(
      (cat) => cat.id === product.category || cat.name === product.category,
    );
    return category?.name || product.category || "غير مصنف";
  };

  // دالة للحصول على ID التصنيف من المنتج
  const getProductCategoryId = (product: Product): string => {
    if (!product.category) return "";

    const category = filteredCategories.find(
      (cat) => cat.id === product.category || cat.name === product.category,
    );
    return category?.id || product.category || "";
  };

  // تصفية المنتجات حسب التصنيف والبحث
  const getFilteredProducts = () => {
    let filtered = [...localProducts];

    // التصفية حسب التصنيف
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => getProductCategoryId(product) === selectedCategory,
      );
    }

    // التصفية حسب البحث
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(term) ||
          product.description?.toLowerCase().includes(term) ||
          getProductCategoryName(product).toLowerCase().includes(term) ||
          (product._semantics?.detectedActivity &&
            product._semantics.detectedActivity.toLowerCase().includes(term)) ||
          (product._semantics?.productTypeId &&
            product._semantics.productTypeId.toLowerCase().includes(term)) ||
          product.tags?.some((tag) => tag.toLowerCase().includes(term)) ||
          false,
      );
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  // دالة إعادة تحميل البيانات
  const reloadData = async () => {
    if (!currentStore?.id) {
      toast({
        title: "لا يوجد متجر",
        description: "يرجى تحديد متجر أولاً",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await loadInitialData();
      toast({
        title: "تم تحديث البيانات",
        description: `تم تحديث ${localProducts.length} منتج`,
      });
    } catch (error: any) {
      toast({
        title: "خطأ في تحديث البيانات",
        description: error.message || "تعذر تحديث البيانات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // دالة لفتح نافذة تعديل المنتج
  const handleOpenEditProduct = (product: Product) => {
    setProductToEdit(product);
    setShowEditProductDialog(true);
  };

  // دالة لفتح نافذة تفاصيل المنتج
  const handleOpenProductDetails = (product: Product) => {
    setProductForDetails(product);
    setShowProductDetailsDialog(true);
  };

  // دالة لفتح نافذة تفاصيل الامتثال
  const handleOpenComplianceDetails = (product: Product) => {
    setProductForComplianceDetails(product);
    setShowComplianceDetailsDialog(true);
  };

  // دالة إصلاح المنتجات الزراعية
  const handleFixAgricultureProducts = async () => {
    setIsLoading(true);
    try {
      const fixedCount = await productService.fixAgricultureProductsCompliance(
        currentStore.id,
      );
      toast({
        title: fixedCount > 0 ? "تم الإصلاح" : "لا حاجة للإصلاح",
        description:
          fixedCount > 0
            ? `تم إصلاح ${fixedCount} منتج زراعي`
            : "جميع المنتجات متوافقة",
      });
      await reloadData();
    } catch (error) {
      toast({
        title: "خطأ في الإصلاح",
        description: "تعذر إصلاح المنتجات الزراعية",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // التحقق إذا كان المتجر زراعي
  const isAgricultureStore =
    currentStore.businessActivities?.subActivities?.includes("agriculture") ||
    (currentStore.customization &&
      "primaryBusinessType" in currentStore.customization &&
      (currentStore.customization as any).primaryBusinessType ===
        "agriculture");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-right">
          <h2 className="text-2xl font-bold">إدارة المنتجات</h2>
          <p className="text-muted-foreground">
            إدارة {filteredProducts.length} منتج من أصل {localProducts.length}{" "}
            في {currentStore?.name || "متجرك"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={reloadData} disabled={isLoading}>
            <RefreshCw
              className={`h-4 w-4 ml-2 ${isLoading ? "animate-spin" : ""}`}
            />
            تحديث
          </Button>
        </div>
      </div>

      {/* زر إصلاح المنتجات الزراعية */}
      {isAgricultureStore && (
        <Button
          variant="outline"
          onClick={handleFixAgricultureProducts}
          disabled={isLoading}
        >
          <ShieldAlert className="h-4 w-4 ml-2" />
          إصلاح المنتجات الزراعية
        </Button>
      )}

      {/* {complianceFlags.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <h3 className="font-medium text-amber-900">
                  هناك {complianceFlags.length} مخالفة تحتاج مراجعة
                </h3>
                <p className="text-sm text-amber-700">
                  بعض المنتجات تحتاج إلى مراجعة الامتثال
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                عرض المخالفات
              </Button>
            </div>
          </CardContent>
        </Card>
      )} */}

      {/* {optimizationTips?.recommendations &&
        optimizationTips.recommendations.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-blue-900">
                      نصائح لتحسين المتجر
                    </h3>
                    <p className="text-sm text-blue-700">
                      {optimizationTips.recommendations.length} نصيحة متاحة
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {optimizationTips.recommendations
                    .filter((r: any) => r.priority === "high")
                    .slice(0, 2)
                    .map((rec: any, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-blue-300 text-blue-700 hover:bg-blue-100 cursor-pointer"
                      >
                        {rec.title}
                      </Badge>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )} */}

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4" />
                بحث في المنتجات
              </Label>
              <Input
                placeholder="ابحث عن منتج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4" />
                التصنيف
              </Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                disabled={filteredCategories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      filteredCategories.length === 0
                        ? "لا توجد فئات"
                        : "جميع التصنيفات"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التصنيفات</SelectItem>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المنتج</TableHead>
                <TableHead className="text-right">التصنيف</TableHead>
                <TableHead className="text-right">السعر</TableHead>
                <TableHead className="text-right">المخزون</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الامتثال</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-center">
                      <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">
                        {searchTerm || selectedCategory !== "all"
                          ? "لم يتم العثور على منتجات تطابق معايير البحث"
                          : "لم يتم إضافة أي منتجات بعد"}
                      </p>
                      <Button
                        onClick={() => navigate("/merchant/products/add")}
                        variant="outline"
                        className="mt-4"
                      >
                        <Plus className="h-4 w-4 ml-2" />
                        إضافة منتج أول
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.slice(0, 20).map((product) => {
                  const warning = getComplianceWarning(product);
                  const isUnderReview =
                    product.status === ProductStatus.UNDER_REVIEW;
                  const isNonCompliant =
                    product._semantics?.complianceStatus ===
                    ComplianceStatus.NON_COMPLIANT;
                  const categoryName = getProductCategoryName(product);
                  const inventoryQuantity = product.inventory?.quantity || 0;
                  const lowStockThreshold =
                    product.inventory?.lowStockThreshold || 5;

                  return (
                    <TableRow
                      key={product.id}
                      className={isUnderReview ? "bg-yellow-50" : ""}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="h-full w-full object-cover rounded"
                              />
                            ) : (
                              <Package className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.description?.substring(0, 50)}...
                            </p>
                            {warning && (
                              <div
                                className={`flex items-center gap-1 mt-1 ${
                                  warning.type === "error"
                                    ? "text-red-600"
                                    : warning.type === "warning"
                                      ? "text-amber-600"
                                      : "text-blue-600"
                                }`}
                              >
                                <AlertCircle className="h-3 w-3" />
                                <span className="text-xs">
                                  {warning.message}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{categoryName}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {product.price?.toLocaleString()} ريال
                          {product.comparePrice &&
                            product.comparePrice > product.price && (
                              <div className="text-sm text-red-600 line-through">
                                {product.comparePrice?.toLocaleString()} ريال
                              </div>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-20">
                            <Progress
                              value={Math.min(
                                (inventoryQuantity / 100) * 100,
                                100,
                              )}
                              className={`h-2 ${
                                inventoryQuantity === 0
                                  ? "bg-red-200"
                                  : inventoryQuantity <= lowStockThreshold
                                    ? "bg-amber-200"
                                    : "bg-green-200"
                              }`}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span
                              className={`font-medium ${
                                inventoryQuantity === 0
                                  ? "text-red-600"
                                  : inventoryQuantity <= lowStockThreshold
                                    ? "text-amber-600"
                                    : "text-green-600"
                              }`}
                            >
                              {inventoryQuantity}
                            </span>
                            {product.inventory?.trackInventory && (
                              <span className="text-xs text-gray-500">
                                وحدة
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={product.status as ProductStatus} />
                      </TableCell>
                      <TableCell>{getComplianceBadge(product)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenProductDetails(product)}
                            title="عرض التفاصيل"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditProduct(product)}
                            title="تعديل"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenComplianceDetails(product)}
                            title="تفاصيل الامتثال"
                          >
                            <AlertCircle className="h-4 w-4" />
                          </Button>

                          {(isUnderReview || isNonCompliant) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleOpenComplianceDetails(product)
                              }
                              title="مراجعة الامتثال"
                              className="text-amber-600 hover:bg-amber-50"
                            >
                              <ShieldAlert className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
