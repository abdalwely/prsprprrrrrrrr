import React, { useState, useEffect, useCallback } from "react";
import { useStore } from "@/lib/contexts/StoreContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBag, Wrench } from "lucide-react";
import {
  productService,
  Product,
  Category,
  checkProductsMissingCreatedAt,
  fixProductsMissingCreatedAt,
} from "@/lib/src";
import ProductsSettingsTab from "./products/tabs/ProductsSettingsTab";
import CategoriesTab from "./products/tabs/CategoriesTab";
import EditProductDialog from "./products/dialogs/EditProductDialog";
import ProductDetailsDialog from "./products/dialogs/ProductDetailsDialog";
import ProductComplianceDialog from "./products/dialogs/ProductComplianceDialog";
import ProductsEditorTab from "./products/tabs/ProductsEditorTab";
import ProductsManagementTab from "./products/tabs/ProductsManagementTab";
import InventoryManagementTab from "./products/tabs/InventoryManagementTab";

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
  const [isLoading, setIsLoading] = useState(false);

  // Dialog States
  const [showEditProductDialog, setShowEditProductDialog] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [showProductDetailsDialog, setShowProductDetailsDialog] =
    useState(false);
  const [productForDetails, setProductForDetails] = useState<Product | null>(
    null,
  );
  const [showComplianceDetailsDialog, setShowComplianceDetailsDialog] =
    useState(false);
  const [productForComplianceDetails, setProductForComplianceDetails] =
    useState<Product | null>(null);

  // دالة تحميل البيانات الأساسية
  const loadInitialData = useCallback(async () => {
    if (!currentStore?.id) {
      console.log("❌ لا يوجد متجر محدد");
      return;
    }

    setIsLoading(true);
    try {
      console.log("🔄 بدء تحميل بيانات المتجر:", currentStore.id);

      const products = await productService.getByStore(currentStore.id, "all");
      setLocalProducts(products);

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

      toast({
        title: "تم تحميل البيانات",
        description: `تم تحميل ${products.length} منتج`,
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

  // تحميل البيانات عند تغيير المتجر
  useEffect(() => {
    if (currentStore?.id) {
      loadInitialData();
    }
  }, [currentStore?.id, loadInitialData]);

  // دالة إصلاح المنتجات الزراعية
  const handleFixMissingCreatedAt = async () => {
    if (!currentStore?.id) return;

    const confirmed = window.confirm(
      "هل تريد إصلاح جميع المنتجات التي لا تحتوي على تاريخ الإنشاء؟\n" +
        "سيتم تعيين تاريخ إنشاء افتراضي للمنتجات المفقودة.",
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      const checkResult = await checkProductsMissingCreatedAt(currentStore.id);

      console.log("🔍 نتائج التحقق:", checkResult);

      if (checkResult.missingCreatedAt === 0) {
        toast({
          title: "لا توجد منتجات تحتاج إصلاح",
          description: "جميع المنتجات تحتوي على تاريخ إنشاء",
        });
        return;
      }

      const finalConfirm = window.confirm(
        `تم العثور على ${checkResult.missingCreatedAt} منتج بدون تاريخ إنشاء.\n\n` +
          `المنتجات:\n` +
          checkResult.products.map((p) => `• ${p.name}`).join("\n") +
          "\n\n" +
          `هل تريد المتابعة في الإصلاح؟`,
      );

      if (!finalConfirm) return;

      const fixResult = await fixProductsMissingCreatedAt(currentStore.id);

      if (fixResult.success) {
        toast({
          title: "تم الإصلاح بنجاح",
          description: `تم إصلاح ${fixResult.fixedCount} منتج`,
        });

        await loadInitialData();
      } else {
        toast({
          title: "الإصلاح مع أخطاء",
          description: `تم إصلاح ${fixResult.fixedCount} منتج، ولكن حدثت ${fixResult.errors.length} أخطاء`,
          variant: "destructive",
        });
      }

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

  // إذا لم يكن هناك متجر
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

  // إذا كان يتم التحميل
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

  // Render the active tab
  const renderActiveTab = () => {
    switch (subActiveTab) {
      case "management":
        return (
          <ProductsManagementTab
            currentStore={currentStore}
            localProducts={localProducts}
            localCategories={localCategories}
            navigate={navigate}
            loadInitialData={loadInitialData}
            setProductToEdit={setProductToEdit}
            setShowEditProductDialog={setShowEditProductDialog}
            setProductForDetails={setProductForDetails}
            setShowProductDetailsDialog={setShowProductDetailsDialog}
            setProductForComplianceDetails={setProductForComplianceDetails}
            setShowComplianceDetailsDialog={setShowComplianceDetailsDialog}
            handleFixMissingCreatedAt={handleFixMissingCreatedAt}
          />
        );
      case "settings":
        return (
          <ProductsSettingsTab
            localProducts={localProducts}
            loadInitialData={loadInitialData}
          />
        );
      case "categories":
        return (
          <CategoriesTab
            currentStore={currentStore}
            localProducts={localProducts}
            localCategories={localCategories}
            loadInitialData={loadInitialData}
          />
        );
      case "inventory":
        return (
          <InventoryManagementTab
            localProducts={localProducts}
            loadInitialData={loadInitialData}
          />
        );
      case "editor":
        return <ProductsEditorTab setSubActiveTab={setSubActiveTab} />;
      default:
        return (
          <ProductsManagementTab
            currentStore={currentStore}
            localProducts={localProducts}
            localCategories={localCategories}
            navigate={navigate}
            loadInitialData={loadInitialData}
            setProductToEdit={setProductToEdit}
            setShowEditProductDialog={setShowEditProductDialog}
            setProductForDetails={setProductForDetails}
            setShowProductDetailsDialog={setShowProductDetailsDialog}
            setProductForComplianceDetails={setProductForComplianceDetails}
            setShowComplianceDetailsDialog={setShowComplianceDetailsDialog}
            handleFixMissingCreatedAt={handleFixMissingCreatedAt}
          />
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">{renderActiveTab()}</div>

      {/* Dialogs */}
      <EditProductDialog
        open={showEditProductDialog}
        onOpenChange={setShowEditProductDialog}
        productToEdit={productToEdit}
        localCategories={localCategories}
        currentStore={currentStore}
        toast={toast}
        setLocalProducts={setLocalProducts}
        loadInitialData={loadInitialData}
      />

      <ProductDetailsDialog
        open={showProductDetailsDialog}
        onOpenChange={setShowProductDetailsDialog}
        productForDetails={productForDetails}
        localCategories={localCategories}
      />

      <ProductComplianceDialog
        open={showComplianceDetailsDialog}
        onOpenChange={setShowComplianceDetailsDialog}
        productForComplianceDetails={productForComplianceDetails}
        localCategories={localCategories}
      />
    </div>
  );
}
