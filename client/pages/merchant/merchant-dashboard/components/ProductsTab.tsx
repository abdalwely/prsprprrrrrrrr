import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/contexts/StoreContext";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  EyeOff,
  Filter,
  ShieldAlert,
  AlertCircle,
  Package,
  Settings,
  Grid,
  Edit,
  Package2,
  Truck,
  MoreVertical,
  Plus,
  Eye,
  Trash2,
  Tag,
  Layers,
  Search,
  BarChart3,
  FileText,
  Download,
  Upload,
  Loader2,
  Copy,
  Merge,
  ArrowUpDown,
  Eye as EyeIcon,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  AlertOctagon,
  Wrench,
} from "lucide-react";
import { StatusBadge } from "./shared/StatusBadge";
import type {
  Product,
  Category,
  Store,
  ProductStatus as ProductStatusType,
} from "@/lib/firestore";
import {
  getStoreCategoriesByStoreId,
  deleteCategorySafely,
  updateCategoriesOrder,
  getAllCategoriesWithDetails,
  mergeCategoriesWithValidation,
  exportCategoriesFormatted,
  importCategoriesWithValidation,
  productService,
  ComplianceDecision,
  ProductStatus,
  ComplianceStatus,
  getComplianceFlags,
  reviewProduct,
  complianceService,
  optimizationTipsService,
  categoryService,
  checkProductsMissingCreatedAt,
  fixProductsMissingCreatedAt,
} from "@/lib/firestore";
import { Textarea } from "@/components/ui/textarea";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";

interface ProductsTabProps {
  products?: Product[];
  categories?: Category[];
  subActiveTab: string;
  setSubActiveTab: (tabId: string) => void;
  navigate: (path: string) => void;
}

export default function ProductsTab({
  products: initialProducts = [],
  categories: initialCategories = [],
  subActiveTab,
  setSubActiveTab,
  navigate,
}: ProductsTabProps) {
  const { store: currentStore } = useStore();
  const { toast } = useToast();
  const [localProducts, setLocalProducts] =
    useState<Product[]>(initialProducts);
  const [localCategories, setLocalCategories] =
    useState<Category[]>(initialCategories);
  const [complianceFlags, setComplianceFlags] = useState<any[]>([]);
  const [optimizationTips, setOptimizationTips] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  // ⭐ حالة جديدة: الفئات المصفاة
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // ⭐ حالة جديدة: الفئات مع التفاصيل
  const [categoryDetails, setCategoryDetails] = useState<any[]>([]);

  // ⭐ حالة جديدة: إدارة الفئات
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [newCategoryDescription, setNewCategoryDescription] =
    useState<string>("");
  const [newCategoryOrder, setNewCategoryOrder] = useState<number>(0);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState<string | null>(
    null,
  );

  // ⭐ حالة جديدة: حذف الفئات
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"direct" | "move">("direct");
  const [moveToCategoryId, setMoveToCategoryId] = useState<string>("");

  // ⭐ حالة جديدة: دمج الفئات
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [sourceCategoryId, setSourceCategoryId] = useState<string>("");
  const [targetCategoryId, setTargetCategoryId] = useState<string>("");
  const [mergeMoveProducts, setMergeMoveProducts] = useState(true);

  // ⭐ حالة جديدة: تصدير الفئات
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | "excel">(
    "json",
  );

  // ⭐ حالة جديدة: استيراد الفئات
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState<string>("");

  // ⭐ حالة جديدة: مراجعة الامتثال
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [productToReview, setProductToReview] = useState<Product | null>(null);
  const [reviewDecision, setReviewDecision] = useState<
    "approve" | "reject" | "exempt"
  >("approve");
  const [reviewNotes, setReviewNotes] = useState<string>("");
  const [isReviewing, setIsReviewing] = useState(false);

  // ⭐ حالة جديدة: إدارة المخزون
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [selectedProductForInventory, setSelectedProductForInventory] =
    useState<Product | null>(null);
  const [newInventoryQuantity, setNewInventoryQuantity] = useState<number>(0);

  // ⭐ إحصاءات المخزون
  const [inventoryStats, setInventoryStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalInventoryValue: 0,
  });

  // أضف هذا useEffect لمراقبة المنتجات المحملة
  useEffect(() => {
    console.log("📊 تحديث حالة المنتجات المحلية:", {
      totalProducts: localProducts.length,
      sample: localProducts.slice(0, 2).map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        inventory: p.inventory,
      })),
    });
  }, [localProducts]);

  // أضف useEffect لمراقبة المتجر
  useEffect(() => {
    console.log("🏪 تغيير المتجر الحالي:", {
      storeId: currentStore?.id,
      storeName: currentStore?.name,
      hasStore: !!currentStore,
    });
  }, [currentStore]);

  // أضف هذا useEffect لفحص بيانات المنتجات
  useEffect(() => {
    if (localProducts.length > 0) {
      console.log("🔍 فحص جودة بيانات المنتجات المحملة:", {
        total: localProducts.length,
        hasNullNames: localProducts.filter((p) => !p.name).length,
        hasNullPrices: localProducts.filter((p) => !p.price).length,
        hasValidDates: localProducts.filter(
          (p) => p.createdAt instanceof Date && !isNaN(p.createdAt.getTime()),
        ).length,
        sampleDates: localProducts.slice(0, 2).map((p) => ({
          id: p.id,
          name: p.name,
          createdAt: p.createdAt,
          isDate: p.createdAt instanceof Date,
          dateString: p.createdAt.toString(),
        })),
      });
    }
  }, [localProducts]);
  // ⭐ دالة تحميل البيانات الأساسية
  // ⭐ حل مؤقت: استخدام المنتجات المباشرة من Firestore بدلاً من getByStore
  // ⭐ استخدام getByStore بعد إصلاحها
  const loadInitialData = useCallback(async () => {
    if (!currentStore?.id) {
      console.log("❌ لا يوجد متجر محدد");
      return;
    }

    setIsLoading(true);
    try {
      console.log("🔄 بدء تحميل بيانات المتجر:", currentStore.id);

      // 🔍 1. جلب المنتجات باستخدام getByStore بعد الإصلاح
      const products = await productService.getByStore(currentStore.id, "all");

      console.log("✅ المنتجات من getByStore:", {
        total: products.length,
        active: products.filter((p) => p.status === "active").length,
        suspended: products.filter((p) => p.status === "suspended").length,
        under_review: products.filter((p) => p.status === "under_review")
          .length,
        draft: products.filter((p) => p.status === "draft").length,
      });

      // ⭐ ⭐ ⭐ **إضافة: فحص وإصلاح المنتجات بدون createdAt تلقائياً**
      const checkResult = await checkProductsMissingCreatedAt(currentStore.id);

      if (checkResult.missingCreatedAt > 0) {
        console.log(
          `⚠️ العثور على ${checkResult.missingCreatedAt} منتج بدون createdAt`,
        );

        // إذا كان عدد المنتجات المفقودة قليلاً، أصلحها تلقائياً
        if (checkResult.missingCreatedAt <= 5) {
          console.log("🔧 إصلاح تلقائي للمنتجات بدون createdAt...");
          const fixResult = await fixProductsMissingCreatedAt(currentStore.id);

          if (fixResult.success && fixResult.fixedCount > 0) {
            console.log(`✅ تم إصلاح ${fixResult.fixedCount} منتج تلقائياً`);

            // إعادة تحميل البيانات بعد الإصلاح
            const updatedProducts = await productService.getByStore(
              currentStore.id,
              "all",
            );
            setLocalProducts(updatedProducts);

            toast({
              title: "تم الإصلاح التلقائي",
              description: `تم إصلاح ${fixResult.fixedCount} منتج بدون تاريخ إنشاء`,
            });
          }
        }
      }

      // 2. تحميل الفئات
      const categories = await getStoreCategoriesByStoreId(currentStore.id);
      setLocalCategories(categories);

      // 3. استخدام المنتجات من getByStore
      setLocalProducts(products);

      // 4. تحميل تفاصيل الفئات
      const details = await getAllCategoriesWithDetails(currentStore.id);
      setCategoryDetails(details);

      // 5. تحميل بيانات الامتثال
      const flags = await getComplianceFlags(currentStore.id, "pending", 20);
      setComplianceFlags(flags);

      // 6. تحميل نصائح التحسين
      const tips = await optimizationTipsService.getOptimizationDashboard(
        currentStore.id,
      );
      setOptimizationTips(tips);

      // 7. حساب إحصاءات المخزون
      calculateInventoryStats(products);

      toast({
        title: "تم تحميل البيانات",
        description: `تم تحميل ${products.length} منتج و ${categories.length} فئة`,
      });
    } catch (error: any) {
      console.error("❌ خطأ في تحميل البيانات:", error);
      toast({
        title: "خطأ في تحميل البيانات",
        description: error.message || "تعذر تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentStore?.id, toast]);

  // ⭐ تحميل البيانات عند تغيير المتجر أو التبويب
  useEffect(() => {
    if (currentStore?.id) {
      loadInitialData();
    }
  }, [currentStore?.id, loadInitialData]);

  // ⭐ تصفية الفئات
  useEffect(() => {
    if (!localCategories.length) {
      setFilteredCategories([]);
      return;
    }

    let filtered = [...localCategories];
    filtered = filtered.sort((a, b) => a.order - b.order);
    setFilteredCategories(filtered);
    console.log("🔍 الفئات المصفاة:", filtered.length);
  }, [localCategories]);

  // ⭐ دالة حساب إحصاءات المخزون
  const calculateInventoryStats = (products: Product[]) => {
    let totalProducts = products.length;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;
    let totalInventoryValue = 0;

    products.forEach((product) => {
      const quantity = product.inventory?.quantity || 0;
      const lowStockThreshold = product.inventory?.lowStockThreshold || 5;

      if (quantity === 0) {
        outOfStockProducts++;
      } else if (quantity <= lowStockThreshold) {
        lowStockProducts++;
      }

      // حساب القيمة الإجمالية للمخزون
      totalInventoryValue += quantity * product.price;
    });

    setInventoryStats({
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalInventoryValue,
    });
  };

  // ⭐ دالة للحصول على شارة حالة الامتثال
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

  // ⭐ دالة للحصول على تحذير الامتثال
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

  // ⭐ دالة للحصول على اسم التصنيف من المنتج
  const getProductCategoryName = (product: Product): string => {
    if (!product.category) return "غير مصنف";

    const category = filteredCategories.find(
      (cat) => cat.id === product.category || cat.name === product.category,
    );
    return category?.name || product.category || "غير مصنف";
  };

  // ⭐ دالة للحصول على ID التصنيف من المنتج
  const getProductCategoryId = (product: Product): string => {
    if (!product.category) return "";

    const category = filteredCategories.find(
      (cat) => cat.id === product.category || cat.name === product.category,
    );
    return category?.id || product.category || "";
  };

  // ⭐ تصفية المنتجات حسب التصنيف والبحث
  const getFilteredProducts = () => {
    let filtered = [...localProducts];

    // ⭐ ⭐ ⭐ تحقق في بداية الدالة
    console.log("🔍 [getFilteredProducts] بداية:", {
      totalLocalProducts: localProducts.length,
      localProductsStatus: localProducts.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        isActive: p.status === ProductStatus.ACTIVE,
      })),
    });
    // التصفية حسب التصنيف
    if (selectedCategory !== "all") {
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
    // ⭐ ⭐ ⭐ تحقق في نهاية الدالة
    console.log("🔍 [getFilteredProducts] نهاية:", {
      filteredCount: filtered.length,
      filteredStatus: filtered.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
      })),
    });

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  // ⭐ دالة إعادة تحميل البيانات
  const reloadData = async () => {
    if (!currentStore?.id) {
      toast({
        title: "لا يوجد متجر",
        description: "يرجى تحديد متجر أولاً",
        variant: "destructive",
      });
      return;
    }

    console.log("🔄 إعادة تحميل البيانات يدوياً للمتجر:", currentStore.id);

    try {
      await loadInitialData();

      // تحقق يدوي من المنتجات بعد التحميل
      const manualCheck = await productService.getByStore(
        currentStore.id,
        "all",
      );
      console.log("✅ التحقق اليدوي بعد إعادة التحميل:", {
        totalProducts: manualCheck.length,
        newProducts: manualCheck.filter(
          (p) => !localProducts.some((lp) => lp.id === p.id),
        ).length,
      });

      toast({
        title: "تم تحديث البيانات",
        description: `تم تحديث ${manualCheck.length} منتج`,
      });
    } catch (error: any) {
      console.error("❌ خطأ في تحديث البيانات:", error);
      toast({
        title: "خطأ في تحديث البيانات",
        description: error.message || "تعذر تحديث البيانات",
        variant: "destructive",
      });
    }
  };
  // ⭐ دالة لفتح نافذة المراجعة
  const handleOpenReview = (product: Product) => {
    setProductToReview(product);
    setReviewDecision("approve");
    setReviewNotes("");
    setShowReviewDialog(true);
  };

  // ⭐ دالة لتنفيذ المراجعة
  const handleSubmitReview = async () => {
    if (!productToReview || !currentStore) return;

    setIsReviewing(true);
    try {
      const userId = "admin"; // يجب استبدالها بـ userId الحقيقي

      await reviewProduct(
        productToReview.id,
        reviewDecision,
        userId,
        reviewNotes,
      );

      toast({
        title: "تم المراجعة",
        description: `تم ${
          reviewDecision === "approve"
            ? "الموافقة"
            : reviewDecision === "reject"
              ? "الرفض"
              : "الإعفاء"
        } على المنتج`,
      });

      await reloadData();
      setShowReviewDialog(false);
    } catch (error: any) {
      toast({
        title: "خطأ في المراجعة",
        description: error.message || "تعذر إكمال المراجعة",
        variant: "destructive",
      });
    } finally {
      setIsReviewing(false);
    }
  };

  // ⭐ دالة لعرض تفاصيل الامتثال
  const handleShowComplianceDetails = (product: Product) => {
    const semantics = product._semantics;
    if (!semantics) {
      toast({
        title: "لا توجد معلومات امتثال",
        description: "لم يتم بعد اكتشاف معلومات الامتثال لهذا المنتج",
      });
      return;
    }

    const details = [
      `حالة الامتثال: ${semantics.complianceStatus}`,
      `طريقة الاكتشاف: ${semantics.detectionMethod}`,
      `درجة الثقة: ${Math.round((semantics.confidenceScore || 0) * 100)}%`,
    ];

    if (semantics.detectedActivity) {
      details.push(`النشاط المكتشف: ${semantics.detectedActivity}`);
    }

    if (semantics.productTypeId) {
      details.push(`معرف نوع المنتج: ${semantics.productTypeId}`);
    }

    if (semantics.validationFlags && semantics.validationFlags.length > 0) {
      details.push(`التحذيرات: ${semantics.validationFlags.join("، ")}`);
    }

    if (semantics.shadowActions) {
      const actions = [];
      if (semantics.shadowActions.hideFromSearch) actions.push("مخفي من البحث");
      if (semantics.shadowActions.hideFromStore) actions.push("مخفي من المتجر");
      if (semantics.shadowActions.limitPurchase) actions.push("محدد الشراء");
      if (actions.length > 0) {
        details.push(`الإجراءات المخفية: ${actions.join("، ")}`);
      }
    }

    toast({
      title: "تفاصيل الامتثال",
      description: (
        <div className="space-y-2">
          {details.map((detail, index) => (
            <div key={index} className="text-sm">
              {detail}
            </div>
          ))}
        </div>
      ),
      duration: 5000,
    });
  };

  // ⭐ دالة لإضافة/تحديث تصنيف
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

      await reloadData();
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

  // ⭐ دالة لإعادة تعيين نموذج الفئة
  const handleResetCategoryForm = () => {
    setNewCategoryName("");
    setNewCategoryDescription("");
    setNewCategoryOrder(localCategories.length);
    setIsEditingCategory(null);
  };

  // ⭐ دالة لتحميل بيانات الفئة للتعديل
  const handleLoadCategoryForEdit = (category: Category) => {
    setNewCategoryName(category.name);
    setNewCategoryDescription(category.description || "");
    setNewCategoryOrder(category.order);
    setIsEditingCategory(category.id);
  };

  // ⭐ دالة لتغيير حالة الفئة
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

      setLocalCategories((prev) =>
        prev.map((cat) =>
          cat.id === category.id
            ? { ...cat, isActive: !category.isActive }
            : cat,
        ),
      );
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "تعذر تغيير حالة الفئة",
        variant: "destructive",
      });
    }
  };

  // ⭐ دالة لبدء حذف الفئة
  const handleDeleteCategoryClick = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
  };

  // ⭐ دالة تنفيذ حذف الفئة
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

      await reloadData();
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

  // ⭐ دالة لدمج الفئات
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

      await reloadData();
      setShowMergeDialog(false);
    } catch (error: any) {
      toast({
        title: "خطأ في الدمج",
        description: error.message || "تعذر دمج الفئات",
        variant: "destructive",
      });
    }
  };

  // ⭐ دالة لتصدير الفئات
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

  // ⭐ دالة لاستيراد الفئات
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

      await reloadData();
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

  // ⭐ دالة لتحديث ترتيب الفئات
  const handleUpdateCategoryOrder = async (
    categoryId: string,
    newOrder: number,
  ) => {
    try {
      const category = localCategories.find((c) => c.id === categoryId);
      if (!category) return;

      await categoryService.update(categoryId, { order: newOrder });

      setLocalCategories((prev) =>
        prev
          .map((cat) =>
            cat.id === categoryId ? { ...cat, order: newOrder } : cat,
          )
          .sort((a, b) => a.order - b.order),
      );
    } catch (error: any) {
      toast({
        title: "خطأ في تحديث الترتيب",
        description: error.message || "تعذر تحديث الترتيب",
        variant: "destructive",
      });
    }
  };

  // ⭐ دالة لفتح نافذة تعديل المخزون
  const handleOpenInventoryDialog = (product: Product) => {
    setSelectedProductForInventory(product);
    setNewInventoryQuantity(product.inventory?.quantity || 0);
    setShowInventoryDialog(true);
  };

  // ⭐ دالة لحفظ تعديل المخزون
  const handleSaveInventory = async () => {
    if (!selectedProductForInventory || !currentStore?.id) return;

    setIsLoadingInventory(true);
    try {
      await productService.update(selectedProductForInventory.id, {
        inventory: {
          ...selectedProductForInventory.inventory,
          quantity: newInventoryQuantity,
        },
      });

      toast({
        title: "تم تحديث المخزون",
        description: `تم تحديث مخزون "${selectedProductForInventory.name}" إلى ${newInventoryQuantity} وحدة`,
      });

      // تحديث البيانات المحلية
      setLocalProducts((prev) =>
        prev.map((p) =>
          p.id === selectedProductForInventory.id
            ? {
                ...p,
                inventory: {
                  ...p.inventory,
                  quantity: newInventoryQuantity,
                },
              }
            : p,
        ),
      );

      // إعادة حساب الإحصائيات
      calculateInventoryStats(
        localProducts.map((p) =>
          p.id === selectedProductForInventory.id
            ? {
                ...p,
                inventory: { ...p.inventory, quantity: newInventoryQuantity },
              }
            : p,
        ),
      );

      setShowInventoryDialog(false);
    } catch (error: any) {
      toast({
        title: "خطأ في تحديث المخزون",
        description: error.message || "تعذر تحديث المخزون",
        variant: "destructive",
      });
    } finally {
      setIsLoadingInventory(false);
    }
  };

  // ⭐ دالة لتحديث المخزون مباشرة
  const handleQuickInventoryUpdate = async (
    product: Product,
    newQuantity: number,
  ) => {
    try {
      await productService.update(product.id, {
        inventory: {
          ...product.inventory,
          quantity: newQuantity,
        },
      });

      setLocalProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? {
                ...p,
                inventory: {
                  ...p.inventory,
                  quantity: newQuantity,
                },
              }
            : p,
        ),
      );

      // إعادة حساب الإحصائيات
      calculateInventoryStats(
        localProducts.map((p) =>
          p.id === product.id
            ? { ...p, inventory: { ...p.inventory, quantity: newQuantity } }
            : p,
        ),
      );

      toast({
        title: "تم تحديث المخزون",
        description: `تم تحديث مخزون ${product.name}`,
      });
    } catch (error) {
      toast({
        title: "خطأ في تحديث المخزون",
        description: "تعذر تحديث المخزون",
        variant: "destructive",
      });
    }
  };

  // ⭐ إعدادات المنتجات (للتوافق)
  const [productSettings, setProductSettings] = useState({
    global: {
      showTaxIncluded: true,
      autoDiscountOldProducts: false,
      roundPrices: "none" as "none" | "nearest" | "up" | "down",
      featuredAutoSelection: false,
      featuredCriteria: "sales" as "sales" | "rating" | "newest" | "manual",
      maxFeaturedProducts: 12,
      productsPerPage: 20,
      showDiscountedPrice: true,
      sortOrder: "newest" as
        | "newest"
        | "oldest"
        | "price_asc"
        | "price_desc"
        | "name",
    },
    inventory: {
      minStock: 5,
      maxStock: 100,
      trackInventory: true,
    },
  });

  // ⭐ إعدادات منتج محدد
  const [showProductSettingsDialog, setShowProductSettingsDialog] =
    useState(false);
  const [selectedProductForSettings, setSelectedProductForSettings] =
    useState<Product | null>(null);
  const [productSpecificSettings, setProductSpecificSettings] = useState({
    isFeatured: false,
    showInStore: true,
    allowReviews: true,
    allowBackorders: false,
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 10,
    hideFromSearch: false,
    hideFromStore: false,
    limitPurchase: false,
  });

  // ⭐ دالة لحفظ الإعدادات العامة
  const handleSaveGlobalSettings = () => {
    toast({
      title: "تم حفظ الإعدادات",
      description: "تم حفظ إعدادات المنتجات بنجاح",
    });
  };

  // ⭐ دالة لحفظ إعدادات المخزون
  const handleSaveInventorySettings = () => {
    toast({
      title: "تم حفظ الإعدادات",
      description: "تم حفظ إعدادات المخزون بنجاح",
    });
  };

  // ⭐ دالة لفتح إعدادات منتج معين
  const handleOpenProductSettings = (product: Product) => {
    setSelectedProductForSettings(product);
    setProductSpecificSettings({
      isFeatured: product.featured || false,
      showInStore: product.status === ProductStatus.ACTIVE,
      allowReviews: product.reviewsEnabled ?? true,
      allowBackorders: product.inventory?.backorders || false,
      minimumOrderQuantity: 1,
      maximumOrderQuantity: 10,
      hideFromSearch:
        product._semantics?.shadowActions?.hideFromSearch || false,
      hideFromStore: product._semantics?.shadowActions?.hideFromStore || false,
      limitPurchase: product._semantics?.shadowActions?.limitPurchase || false,
    });
    setShowProductSettingsDialog(true);
  };

  // ⭐ دالة لحفظ إعدادات منتج معين
  const handleSaveProductSettings = async () => {
    if (!selectedProductForSettings || !currentStore?.id) return;

    try {
      const updateData: Partial<Product> = {
        featured: productSpecificSettings.isFeatured,
        status: productSpecificSettings.showInStore
          ? ProductStatus.ACTIVE
          : ProductStatus.INACTIVE,
        reviewsEnabled: productSpecificSettings.allowReviews,
        inventory: {
          ...selectedProductForSettings.inventory,
          backorders: productSpecificSettings.allowBackorders,
        },
      };

      // تحديث shadow actions إذا كانت موجودة
      if (selectedProductForSettings._semantics) {
        updateData._semantics = {
          ...selectedProductForSettings._semantics,
          shadowActions: {
            hideFromSearch: productSpecificSettings.hideFromSearch,
            hideFromStore: productSpecificSettings.hideFromStore,
            limitPurchase: productSpecificSettings.limitPurchase,
          },
        };
      }

      await productService.update(selectedProductForSettings.id, updateData);

      toast({
        title: "تم حفظ الإعدادات",
        description: `تم حفظ إعدادات المنتج "${selectedProductForSettings.name}" بنجاح`,
      });

      // تحديث البيانات المحلية
      setLocalProducts((prev) =>
        prev.map((p) =>
          p.id === selectedProductForSettings.id ? { ...p, ...updateData } : p,
        ),
      );

      setShowProductSettingsDialog(false);
    } catch (error: any) {
      toast({
        title: "خطأ في حفظ الإعدادات",
        description: error.message || "تعذر حفظ إعدادات المنتج",
        variant: "destructive",
      });
    }
  };

  // داخل ProductsTab.tsx
  const handleFixMissingCreatedAt = async () => {
    if (!currentStore?.id) return;

    const confirmed = window.confirm(
      "هل تريد إصلاح جميع المنتجات التي لا تحتوي على تاريخ الإنشاء؟\n" +
        "سيتم تعيين تاريخ إنشاء افتراضي للمنتجات المفقودة.",
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      // التحقق أولاً
      const checkResult = await checkProductsMissingCreatedAt(currentStore.id);

      console.log("🔍 نتائج التحقق:", checkResult);

      if (checkResult.missingCreatedAt === 0) {
        toast({
          title: "لا توجد منتجات تحتاج إصلاح",
          description: "جميع المنتجات تحتوي على تاريخ إنشاء",
        });
        return;
      }

      // عرض تأكيد نهائي
      const finalConfirm = window.confirm(
        `تم العثور على ${checkResult.missingCreatedAt} منتج بدون تاريخ إنشاء.\n\n` +
          `المنتجات:\n` +
          checkResult.products.map((p) => `• ${p.name}`).join("\n") +
          "\n\n" +
          `هل تريد المتابعة في الإصلاح؟`,
      );

      if (!finalConfirm) return;

      // تنفيذ الإصلاح
      const fixResult = await fixProductsMissingCreatedAt(currentStore.id);

      // عرض النتائج
      if (fixResult.success) {
        toast({
          title: "تم الإصلاح بنجاح",
          description: `تم إصلاح ${fixResult.fixedCount} منتج`,
        });

        // إعادة تحميل البيانات
        await loadInitialData();
      } else {
        toast({
          title: "الإصلاح مع أخطاء",
          description: `تم إصلاح ${fixResult.fixedCount} منتج، ولكن حدثت ${fixResult.errors.length} أخطاء`,
          variant: "destructive",
        });
      }

      // عرض تفاصيل النتائج في الكونسول
      console.log("📊 تفاصيل الإصلاح:", fixResult);
    } catch (error: any) {
      console.error("❌ خطأ في إصلاح المنتجات:", error);
      toast({
        title: "خطأ في الإصلاح",
        description: error.message || "حدث خطأ أثناء الإصلاح",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ⭐ إذا لم يكن هناك متجر
  if (!currentStore) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-10 w-10 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">لا يوجد متجر نشط</h2>
          <p className="text-muted-foreground mb-6">
            يجب عليك اختيار متجر أو إنشاء متجر جديد لإدارة المنتجات
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/merchant/dashboard")}>
              العودة للوحة التحكم
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              تحديث الصفحة
            </Button>

            {/* زر الإصلاح */}
            <Button
              variant="outline"
              onClick={handleFixMissingCreatedAt}
              disabled={isLoading}
              className="ml-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الإصلاح...
                </>
              ) : (
                <>
                  <Wrench className="mr-2 h-4 w-4" />
                  إصلاح تواريخ المنتجات
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ⭐ إذا كان يتم التحميل
  if (isLoading && subActiveTab === "management") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">جاري تحميل المنتجات...</h2>
          <p className="text-muted-foreground">يرجى الانتظار</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        {/* ⭐ محتوى تبويب "إدارة المنتجات" */}
        {subActiveTab === "management" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-right">
                <h2 className="text-2xl font-bold">إدارة المنتجات</h2>
                <p className="text-muted-foreground">
                  إدارة {filteredProducts.length} منتج من أصل{" "}
                  {localProducts.length} في {currentStore?.name || "متجرك"}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={reloadData}>
                  <RefreshCw className="h-4 w-4 ml-2" />
                  تحديث
                </Button>
              </div>
            </div>

            {/* ⭐ زر إصلاح المنتجات الزراعية */}
            {(currentStore.businessActivities?.subActivities?.includes(
              "agriculture",
            ) ||
              (currentStore.customization &&
                "primaryBusinessType" in currentStore.customization &&
                (currentStore.customization as any).primaryBusinessType ===
                  "agriculture")) && (
              <Button
                variant="outline"
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    const fixedCount =
                      await productService.fixAgricultureProductsCompliance(
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
                }}
              >
                <ShieldAlert className="h-4 w-4 ml-2" />
                إصلاح المنتجات الزراعية
              </Button>
            )}

            {complianceFlags.length > 0 && (
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
            )}

            {optimizationTips?.recommendations &&
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
                            {optimizationTips.recommendations.length} نصيحة
                            متاحة
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
              )}

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
                        const inventoryQuantity =
                          product.inventory?.quantity || 0;
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
                                  {product.images &&
                                  product.images.length > 0 ? (
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
                                      {product.comparePrice?.toLocaleString()}{" "}
                                      ريال
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
                              <StatusBadge
                                status={product.status as ProductStatusType}
                              />
                            </TableCell>
                            <TableCell>{getComplianceBadge(product)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    navigate(`/merchant/products/${product.id}`)
                                  }
                                  title="عرض التفاصيل"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    navigate(
                                      `/merchant/products/${product.id}/edit`,
                                    )
                                  }
                                  title="تعديل"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {(isUnderReview || isNonCompliant) && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenReview(product)}
                                    title="مراجعة الامتثال"
                                    className="text-amber-600 hover:bg-amber-50"
                                  >
                                    <ShieldAlert className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleShowComplianceDetails(product)
                                  }
                                  title="تفاصيل الامتثال"
                                >
                                  <AlertCircle className="h-4 w-4" />
                                </Button>

                                {/* أو في قائمة الإجراءات */}
                                {/* <Button
                                  onClick={handleFixMissingCreatedAt}
                                  disabled={isLoading}
                                >
                                  <AlertCircle className="mr-2 h-4 w-4" />
                                  إصلاح تواريخ الإنشاء المفقودة
                                </Button> */}
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
        )}

        {/* ⭐ محتوى تبويب "إعدادات المنتجات" */}
        {subActiveTab === "settings" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">إعدادات المنتجات</h2>
                <p className="text-muted-foreground">
                  تخصيص إعدادات المنتجات في متجرك
                </p>
              </div>
              <Button variant="outline" onClick={reloadData}>
                <RefreshCw className="h-4 w-4 ml-2" />
                تحديث البيانات
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* إعدادات المخزون */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package2 className="h-5 w-5" />
                    إعدادات المخزون
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>الحد الأدنى للمخزون</Label>
                    <Input
                      type="number"
                      placeholder="5"
                      value={productSettings.inventory.minStock}
                      onChange={(e) =>
                        setProductSettings({
                          ...productSettings,
                          inventory: {
                            ...productSettings.inventory,
                            minStock: parseInt(e.target.value) || 5,
                          },
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      سيتم تنبيهك عندما ينخفض المخزون عن هذا الرقم
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>الحد الأقصى للمخزون</Label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={productSettings.inventory.maxStock}
                      onChange={(e) =>
                        setProductSettings({
                          ...productSettings,
                          inventory: {
                            ...productSettings.inventory,
                            maxStock: parseInt(e.target.value) || 100,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>تتبع المخزون</Label>
                      <p className="text-xs text-muted-foreground">
                        تتبع الكمية المتوفرة تلقائياً
                      </p>
                    </div>
                    <Switch
                      checked={productSettings.inventory.trackInventory}
                      onCheckedChange={(checked) =>
                        setProductSettings({
                          ...productSettings,
                          inventory: {
                            ...productSettings.inventory,
                            trackInventory: checked,
                          },
                        })
                      }
                    />
                  </div>
                  <Button onClick={handleSaveInventorySettings}>
                    حفظ إعدادات المخزون
                  </Button>
                </CardContent>
              </Card>

              {/* إعدادات الأسعار */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    إعدادات الأسعار
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>عرض الأسعار مع الضريبة</Label>
                      <p className="text-xs text-muted-foreground">
                        عرض السعر النهائي شامل الضريبة
                      </p>
                    </div>
                    <Switch
                      checked={productSettings.global.showTaxIncluded}
                      onCheckedChange={(checked) =>
                        setProductSettings({
                          ...productSettings,
                          global: {
                            ...productSettings.global,
                            showTaxIncluded: checked,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>التخفيضات التلقائية</Label>
                      <p className="text-xs text-muted-foreground">
                        تطبيق خصومات على المنتجات القديمة
                      </p>
                    </div>
                    <Switch
                      checked={productSettings.global.autoDiscountOldProducts}
                      onCheckedChange={(checked) =>
                        setProductSettings({
                          ...productSettings,
                          global: {
                            ...productSettings.global,
                            autoDiscountOldProducts: checked,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>تقريب الأسعار</Label>
                    <Select
                      value={productSettings.global.roundPrices}
                      onValueChange={(value: any) =>
                        setProductSettings({
                          ...productSettings,
                          global: {
                            ...productSettings.global,
                            roundPrices: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر طريقة التقريب" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">بدون تقريب</SelectItem>
                        <SelectItem value="nearest">أقرب رقم صحيح</SelectItem>
                        <SelectItem value="up">تقريب لأعلى</SelectItem>
                        <SelectItem value="down">تقريب لأسفل</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSaveGlobalSettings}>
                    حفظ إعدادات الأسعار
                  </Button>
                </CardContent>
              </Card>

              {/* المنتجات المميزة */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    المنتجات المميزة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>تحديد المنتجات المميزة تلقائياً</Label>
                      <p className="text-xs text-muted-foreground">
                        حسب المبيعات أو التقييمات
                      </p>
                    </div>
                    <Switch
                      checked={productSettings.global.featuredAutoSelection}
                      onCheckedChange={(checked) =>
                        setProductSettings({
                          ...productSettings,
                          global: {
                            ...productSettings.global,
                            featuredAutoSelection: checked,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>عدد المنتجات المميزة المسموح بها</Label>
                    <Input
                      type="number"
                      placeholder="12"
                      value={productSettings.global.maxFeaturedProducts}
                      onChange={(e) =>
                        setProductSettings({
                          ...productSettings,
                          global: {
                            ...productSettings.global,
                            maxFeaturedProducts: parseInt(e.target.value) || 12,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>معايير التميز</Label>
                    <Select
                      value={productSettings.global.featuredCriteria}
                      onValueChange={(value: any) =>
                        setProductSettings({
                          ...productSettings,
                          global: {
                            ...productSettings.global,
                            featuredCriteria: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المعيار" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">أعلى المبيعات</SelectItem>
                        <SelectItem value="rating">أعلى التقييمات</SelectItem>
                        <SelectItem value="newest">أحدث المنتجات</SelectItem>
                        <SelectItem value="manual">يدوي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSaveGlobalSettings}>
                    حفظ إعدادات التميز
                  </Button>
                </CardContent>
              </Card>

              {/* إعدادات العرض */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <EyeIcon className="h-5 w-5" />
                    إعدادات العرض
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>ترتيب المنتجات</Label>
                    <Select
                      value={productSettings.global.sortOrder}
                      onValueChange={(value: any) =>
                        setProductSettings({
                          ...productSettings,
                          global: {
                            ...productSettings.global,
                            sortOrder: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الترتيب" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">الأحدث أولاً</SelectItem>
                        <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                        <SelectItem value="price_asc">
                          السعر من الأقل للأعلى
                        </SelectItem>
                        <SelectItem value="price_desc">
                          السعر من الأعلى للأقل
                        </SelectItem>
                        <SelectItem value="name">بالاسم</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>عدد المنتجات في الصفحة</Label>
                    <Input
                      type="number"
                      placeholder="20"
                      value={productSettings.global.productsPerPage}
                      onChange={(e) =>
                        setProductSettings({
                          ...productSettings,
                          global: {
                            ...productSettings.global,
                            productsPerPage: parseInt(e.target.value) || 20,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>عرض الأسعار المخفضة</Label>
                      <p className="text-xs text-muted-foreground">
                        إظهار السعر الأصلي والسعر المخفض
                      </p>
                    </div>
                    <Switch
                      checked={productSettings.global.showDiscountedPrice}
                      onCheckedChange={(checked) =>
                        setProductSettings({
                          ...productSettings,
                          global: {
                            ...productSettings.global,
                            showDiscountedPrice: checked,
                          },
                        })
                      }
                    />
                  </div>
                  <Button onClick={handleSaveGlobalSettings}>
                    حفظ إعدادات العرض
                  </Button>
                </CardContent>
              </Card>

              {/* ⭐ قسم إعدادات منتج محدد */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    إعدادات منتج محدد
                  </CardTitle>
                  <CardDescription>تطبيق إعدادات على منتج معين</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>اختر منتج</Label>
                    <Select
                      onValueChange={(value) => {
                        const product = localProducts.find(
                          (p) => p.id === value,
                        );
                        if (product) {
                          handleOpenProductSettings(product);
                        } else {
                          toast({
                            title: "خطأ",
                            description: "لم يتم العثور على المنتج",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر منتجاً لتخصيص إعداداته" />
                      </SelectTrigger>
                      <SelectContent>
                        {localProducts.length === 0 ? (
                          <SelectItem value="" disabled>
                            لا توجد منتجات
                          </SelectItem>
                        ) : (
                          localProducts.slice(0, 20).map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - {product.price?.toLocaleString()}{" "}
                              ريال
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedProductForSettings && (
                    <>
                      <div className="p-3 bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          {selectedProductForSettings.images?.[0] && (
                            <img
                              src={selectedProductForSettings.images[0]}
                              alt={selectedProductForSettings.name}
                              className="h-12 w-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium">
                              {selectedProductForSettings.name}
                            </p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline">
                                {getProductCategoryName(
                                  selectedProductForSettings,
                                )}
                              </Badge>
                              <StatusBadge
                                status={
                                  selectedProductForSettings.status as ProductStatusType
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <Label className="text-sm">إظهار في المتجر</Label>
                            <p className="text-xs text-muted-foreground">
                              إظهار أو إخفاء المنتج من متجرك
                            </p>
                          </div>
                          <Switch
                            checked={productSpecificSettings.showInStore}
                            onCheckedChange={(checked) =>
                              setProductSpecificSettings((prev) => ({
                                ...prev,
                                showInStore: checked,
                              }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <Label className="text-sm">السماح بالتعليقات</Label>
                            <p className="text-xs text-muted-foreground">
                              السماح للعملاء بتقييم المنتج
                            </p>
                          </div>
                          <Switch
                            checked={productSpecificSettings.allowReviews}
                            onCheckedChange={(checked) =>
                              setProductSpecificSettings((prev) => ({
                                ...prev,
                                allowReviews: checked,
                              }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <Label className="text-sm">الطلبات المؤجلة</Label>
                            <p className="text-xs text-muted-foreground">
                              السماح بالطلب عند نفاذ المخزون
                            </p>
                          </div>
                          <Switch
                            checked={productSpecificSettings.allowBackorders}
                            onCheckedChange={(checked) =>
                              setProductSpecificSettings((prev) => ({
                                ...prev,
                                allowBackorders: checked,
                              }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <Label className="text-sm">منتج مميز</Label>
                            <p className="text-xs text-muted-foreground">
                              عرض المنتج في القسم المميز
                            </p>
                          </div>
                          <Switch
                            checked={productSpecificSettings.isFeatured}
                            onCheckedChange={(checked) =>
                              setProductSpecificSettings((prev) => ({
                                ...prev,
                                isFeatured: checked,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleSaveProductSettings}
                        className="w-full"
                      >
                        حفظ إعدادات المنتج المحدد
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ⭐ محتوى تبويب "التصنيفات والخيارات" */}
        {subActiveTab === "categories" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">التصنيفات والخيارات</h2>
                <p className="text-muted-foreground">
                  إدارة {localCategories.length} تصنيف في متجرك
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowImportDialog(true)}
                >
                  <Upload className="h-4 w-4 ml-2" />
                  استيراد
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowExportDialog(true)}
                >
                  <Download className="h-4 w-4 ml-2" />
                  تصدير
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowMergeDialog(true)}
                >
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
                      onChange={(e) =>
                        setNewCategoryDescription(e.target.value)
                      }
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
                      <Button
                        variant="outline"
                        onClick={handleResetCategoryForm}
                      >
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
                        <p className="text-gray-500 font-medium">
                          لا توجد تصنيفات
                        </p>
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
                        const productCount = localProducts.filter(
                          (p) => p.category === category.id,
                        ).length;

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
                                onClick={() =>
                                  handleLoadCategoryForEdit(category)
                                }
                                title="تعديل"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteCategoryClick(category)
                                }
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

            {categoryDetails.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات التصنيفات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="border rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold">
                        {categoryDetails.length}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        إجمالي التصنيفات
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {categoryDetails.filter((c) => c.isActive).length}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        تصنيفات نشطة
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {categoryDetails.reduce(
                          (sum, cat) => sum + cat.productCount,
                          0,
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        إجمالي المنتجات
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-amber-600">
                        {
                          categoryDetails.filter((c) => c.productCount === 0)
                            .length
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        فئات فارغة
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <h4 className="font-medium">توزيع المنتجات على الفئات:</h4>
                    {categoryDetails
                      .filter((cat) => cat.productCount > 0)
                      .sort((a, b) => b.productCount - a.productCount)
                      .slice(0, 5)
                      .map((cat) => {
                        const maxProducts = Math.max(
                          ...categoryDetails.map((c) => c.productCount),
                        );
                        const percentage =
                          (cat.productCount / maxProducts) * 100;

                        return (
                          <div key={cat.id} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                {cat.name}
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {cat.productCount} منتج
                                </Badge>
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
          </div>
        )}

        {/* ⭐ محتوى تبويب "إدارة المخزون" */}
        {subActiveTab === "inventory" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">إدارة المخزون</h2>
                <p className="text-muted-foreground">
                  تتبع وإدارة مخزون منتجاتك
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={reloadData}>
                  <RefreshCw className="h-4 w-4 ml-2" />
                  تحديث
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">إجمالي المنتجات</p>
                      <p className="text-2xl font-bold">
                        {inventoryStats.totalProducts}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">منخفضة المخزون</p>
                      <p className="text-2xl font-bold text-amber-600">
                        {inventoryStats.lowStockProducts}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertOctagon className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">غير متوفر</p>
                      <p className="text-2xl font-bold text-red-600">
                        {inventoryStats.outOfStockProducts}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">قيمة المخزون</p>
                      <p className="text-2xl font-bold text-green-600">
                        {inventoryStats.totalInventoryValue.toLocaleString()}{" "}
                        ريال
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>المنتجات منخفضة المخزون</CardTitle>
                <CardDescription>المنتجات التي تحتاج إلى تجديد</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {localProducts
                    .filter((p) => {
                      const quantity = p.inventory?.quantity || 0;
                      const threshold = p.inventory?.lowStockThreshold || 5;
                      return quantity > 0 && quantity <= threshold;
                    })
                    .slice(0, 5)
                    .map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div className="flex items-center gap-3">
                          {product.images && product.images.length > 0 ? (
                            <div className="h-10 w-10 bg-muted rounded">
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="h-full w-full object-cover rounded"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500">
                              {getProductCategoryName(product)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-amber-600 font-bold">
                            {product.inventory?.quantity || 0} وحدة
                          </p>
                          <p className="text-xs text-gray-500">متبقي</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenInventoryDialog(product)}
                          >
                            تعديل
                          </Button>
                        </div>
                      </div>
                    ))}

                  {localProducts.filter(
                    (p) =>
                      (p.inventory?.quantity || 0) > 0 &&
                      (p.inventory?.quantity || 0) <= 5,
                  ).length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-gray-500">
                        لا توجد منتجات منخفضة المخزون
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>جميع المنتجات</CardTitle>
                <CardDescription>إدارة مخزون جميع المنتجات</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المنتج</TableHead>
                      <TableHead className="text-right">
                        المخزون الحالي
                      </TableHead>
                      <TableHead className="text-right">
                        المخزون المثالي
                      </TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {localProducts.slice(0, 10).map((product) => {
                      const currentQuantity = product.inventory?.quantity || 0;
                      const lowStockThreshold =
                        product.inventory?.lowStockThreshold || 5;

                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-3 flex-row-reverse">
                              {product.images && product.images.length > 0 ? (
                                <div className="h-10 w-10 bg-muted rounded">
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="h-full w-full object-cover rounded"
                                  />
                                </div>
                              ) : (
                                <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              <div className="text-right">
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {getProductCategoryName(product)}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              <span
                                className={`
                                ${
                                  currentQuantity === 0
                                    ? "text-red-600"
                                    : currentQuantity <= lowStockThreshold
                                      ? "text-amber-600"
                                      : "text-green-600"
                                }
                              `}
                              >
                                {currentQuantity} وحدة
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                defaultValue={lowStockThreshold}
                                className="w-24"
                                onChange={(e) => {
                                  const newThreshold =
                                    parseInt(e.target.value) || 5;
                                  // يمكن حفظ هذا القيمة
                                }}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            {currentQuantity === 0 ? (
                              <Badge variant="destructive">غير متوفر</Badge>
                            ) : currentQuantity <= lowStockThreshold ? (
                              <Badge
                                variant="outline"
                                className="text-amber-600 border-amber-200 bg-amber-50"
                              >
                                منخفض
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-green-600 border-green-200 bg-green-50"
                              >
                                متوفر
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleOpenInventoryDialog(product)
                                }
                              >
                                تعديل الكمية
                              </Button>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleQuickInventoryUpdate(
                                      product,
                                      currentQuantity + 1,
                                    )
                                  }
                                >
                                  +
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleQuickInventoryUpdate(
                                      product,
                                      Math.max(0, currentQuantity - 1),
                                    )
                                  }
                                  disabled={currentQuantity <= 0}
                                >
                                  -
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ⭐ محتوى تبويب "محرر المنتجات" */}
        {subActiveTab === "editor" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">محرر المنتجات</h2>
                <p className="text-muted-foreground">
                  تحرير وتعديل المنتجات بسرعة
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">
                  <Download className="h-4 w-4 ml-2" />
                  تصدير المنتجات
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 ml-2" />
                  استيراد منتجات
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Edit className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    محرر المنتجات قريباً
                  </h3>
                  <p className="text-gray-500 mb-6">
                    هذه الميزة قيد التطوير، ستكون متاحة قريباً لتعديل المنتجات
                    بشكل جماعي
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setSubActiveTab("management")}
                    >
                      الانتقال لإدارة المنتجات
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* نوافذ منبثقة */}

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
                              {localCategories
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
                  {localCategories.map((category) => (
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
                  {localCategories.map((category) => (
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

      {/* نافذة مراجعة الامتثال */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              مراجعة الامتثال
            </DialogTitle>
            <DialogDescription>
              {productToReview && `مراجعة المنتج: ${productToReview.name}`}
            </DialogDescription>
          </DialogHeader>

          {productToReview && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  {productToReview.images &&
                    productToReview.images.length > 0 && (
                      <img
                        src={productToReview.images[0]}
                        alt={productToReview.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                    )}
                  <div>
                    <p className="font-medium">{productToReview.name}</p>
                    <p className="text-sm text-gray-600">
                      {productToReview.category}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>تفاصيل الامتثال</Label>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                  {productToReview._semantics?.validationFlags && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-amber-800">
                        التحذيرات:
                      </p>
                      <ul className="list-disc list-inside text-sm text-amber-700">
                        {productToReview._semantics.validationFlags.map(
                          (flag, index) => (
                            <li key={index}>{flag}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                  {productToReview._semantics?.detectedActivity && (
                    <p className="text-sm text-amber-700 mt-2">
                      النشاط المكتشف:{" "}
                      {productToReview._semantics.detectedActivity}
                    </p>
                  )}
                  {productToReview._semantics?.shadowActions
                    ?.hideFromSearch && (
                    <p className="text-sm text-blue-700 mt-2">
                      ⚠️ المنتج مخفي من نتائج البحث
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>قرار المراجعة</Label>
                <Select
                  value={reviewDecision}
                  onValueChange={(value: any) => setReviewDecision(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approve">موافقة</SelectItem>
                    <SelectItem value="reject">رفض</SelectItem>
                    <SelectItem value="exempt">إعفاء</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>ملاحظات المراجعة</Label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="أدخل ملاحظاتك حول المراجعة..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReviewDialog(false)}
              disabled={isReviewing}
            >
              إلغاء
            </Button>
            <Button onClick={handleSubmitReview} disabled={isReviewing}>
              {isReviewing ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري المعالجة...
                </>
              ) : (
                "تأكيد المراجعة"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة تعديل المخزون */}
      <Dialog open={showInventoryDialog} onOpenChange={setShowInventoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل المخزون</DialogTitle>
            <DialogDescription>
              {selectedProductForInventory &&
                `تعديل مخزون المنتج: ${selectedProductForInventory.name}`}
            </DialogDescription>
          </DialogHeader>

          {selectedProductForInventory && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                {selectedProductForInventory.images?.[0] && (
                  <img
                    src={selectedProductForInventory.images[0]}
                    alt={selectedProductForInventory.name}
                    className="h-12 w-12 object-cover rounded"
                  />
                )}
                <div>
                  <p className="font-medium">
                    {selectedProductForInventory.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    المخزون الحالي:{" "}
                    {selectedProductForInventory.inventory?.quantity || 0}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>الكمية الجديدة</Label>
                <Input
                  type="number"
                  value={newInventoryQuantity}
                  onChange={(e) =>
                    setNewInventoryQuantity(parseInt(e.target.value) || 0)
                  }
                  min="0"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    setNewInventoryQuantity(
                      selectedProductForInventory.inventory?.quantity || 0,
                    )
                  }
                >
                  إعادة تعيين
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setNewInventoryQuantity(newInventoryQuantity + 10)
                  }
                >
                  إضافة 10
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setNewInventoryQuantity(
                      Math.max(0, newInventoryQuantity - 10),
                    )
                  }
                  disabled={newInventoryQuantity < 10}
                >
                  خصم 10
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInventoryDialog(false)}
            >
              إلغاء
            </Button>
            <Button onClick={handleSaveInventory} disabled={isLoadingInventory}>
              {isLoadingInventory ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ التغييرات"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة إعدادات المنتج المحدد */}
      <Dialog
        open={showProductSettingsDialog}
        onOpenChange={setShowProductSettingsDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              إعدادات المنتج المحدد
            </DialogTitle>
            <DialogDescription>
              {selectedProductForSettings &&
                `تخصيص إعدادات المنتج: ${selectedProductForSettings.name}`}
            </DialogDescription>
          </DialogHeader>

          {selectedProductForSettings && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <Label className="text-sm">إظهار في المتجر</Label>
                    <p className="text-xs text-muted-foreground">
                      إظهار أو إخفاء المنتج من متجرك
                    </p>
                  </div>
                  <Switch
                    checked={productSpecificSettings.showInStore}
                    onCheckedChange={(checked) =>
                      setProductSpecificSettings((prev) => ({
                        ...prev,
                        showInStore: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <Label className="text-sm">السماح بالتعليقات</Label>
                    <p className="text-xs text-muted-foreground">
                      السماح للعملاء بتقييم المنتج
                    </p>
                  </div>
                  <Switch
                    checked={productSpecificSettings.allowReviews}
                    onCheckedChange={(checked) =>
                      setProductSpecificSettings((prev) => ({
                        ...prev,
                        allowReviews: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <Label className="text-sm">الطلبات المؤجلة</Label>
                    <p className="text-xs text-muted-foreground">
                      السماح بالطلب عند نفاذ المخزون
                    </p>
                  </div>
                  <Switch
                    checked={productSpecificSettings.allowBackorders}
                    onCheckedChange={(checked) =>
                      setProductSpecificSettings((prev) => ({
                        ...prev,
                        allowBackorders: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <Label className="text-sm">منتج مميز</Label>
                    <p className="text-xs text-muted-foreground">
                      عرض المنتج في القسم المميز
                    </p>
                  </div>
                  <Switch
                    checked={productSpecificSettings.isFeatured}
                    onCheckedChange={(checked) =>
                      setProductSpecificSettings((prev) => ({
                        ...prev,
                        isFeatured: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <Label className="text-sm">إخفاء من البحث</Label>
                    <p className="text-xs text-muted-foreground">
                      إخفاء المنتج من نتائج البحث
                    </p>
                  </div>
                  <Switch
                    checked={productSpecificSettings.hideFromSearch}
                    onCheckedChange={(checked) =>
                      setProductSpecificSettings((prev) => ({
                        ...prev,
                        hideFromSearch: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <Label className="text-sm">إخفاء من المتجر</Label>
                    <p className="text-xs text-muted-foreground">
                      إخفاء المنتج من متجرك
                    </p>
                  </div>
                  <Switch
                    checked={productSpecificSettings.hideFromStore}
                    onCheckedChange={(checked) =>
                      setProductSpecificSettings((prev) => ({
                        ...prev,
                        hideFromStore: checked,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الحد الأدنى للطلب</Label>
                  <Input
                    type="number"
                    value={productSpecificSettings.minimumOrderQuantity}
                    onChange={(e) =>
                      setProductSpecificSettings((prev) => ({
                        ...prev,
                        minimumOrderQuantity: parseInt(e.target.value) || 1,
                      }))
                    }
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label>الحد الأقصى للطلب</Label>
                  <Input
                    type="number"
                    value={productSpecificSettings.maximumOrderQuantity}
                    onChange={(e) =>
                      setProductSpecificSettings((prev) => ({
                        ...prev,
                        maximumOrderQuantity: parseInt(e.target.value) || 10,
                      }))
                    }
                    min="1"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowProductSettingsDialog(false)}
            >
              إلغاء
            </Button>
            <Button onClick={handleSaveProductSettings}>حفظ الإعدادات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
