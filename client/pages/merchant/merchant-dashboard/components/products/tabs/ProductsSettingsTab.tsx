import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Package2,
  Tag,
  BarChart3,
  Eye as EyeIcon,
  Settings,
  Package,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/lib/src";

interface ProductsSettingsTabProps {
  localProducts: Product[];
  loadInitialData: () => Promise<void>;
}

export default function ProductsSettingsTab({
  localProducts,
  loadInitialData,
}: ProductsSettingsTabProps) {
  const { toast } = useToast();
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

  const reloadData = async () => {
    try {
      await loadInitialData();
      toast({
        title: "تم تحديث البيانات",
        description: "تم تحديث بيانات المنتجات",
      });
    } catch (error: any) {
      toast({
        title: "خطأ في تحديث البيانات",
        description: error.message || "تعذر تحديث البيانات",
        variant: "destructive",
      });
    }
  };

  const handleSaveGlobalSettings = () => {
    toast({
      title: "تم حفظ الإعدادات",
      description: "تم حفظ إعدادات المنتجات بنجاح",
    });
  };

  const handleSaveInventorySettings = () => {
    toast({
      title: "تم حفظ الإعدادات",
      description: "تم حفظ إعدادات المخزون بنجاح",
    });
  };

  const handleOpenProductSettings = (product: Product) => {
    setSelectedProductForSettings(product);
    setProductSpecificSettings({
      isFeatured: product.featured || false,
      showInStore: product.status === "active",
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

  const handleSaveProductSettings = async () => {
    if (!selectedProductForSettings) return;

    toast({
      title: "تم حفظ الإعدادات",
      description: `تم حفظ إعدادات المنتج "${selectedProductForSettings.name}" بنجاح`,
    });
    setShowProductSettingsDialog(false);
  };

  // دالة الحصول على اسم التصنيف
  const getProductCategoryName = (product: Product): string => {
    if (!product.category) return "غير مصنف";
    return product.category.toString();
  };

  return (
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
                  const product = localProducts.find((p) => p.id === value);
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
                    <SelectItem value="no-products" disabled>
                      لا توجد منتجات
                    </SelectItem>
                  ) : (
                    localProducts.slice(0, 20).map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {product.price?.toLocaleString()} ريال
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
                          {getProductCategoryName(selectedProductForSettings)}
                        </Badge>
                        <Badge
                          variant={
                            selectedProductForSettings.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {selectedProductForSettings.status === "active"
                            ? "نشط"
                            : "غير نشط"}
                        </Badge>
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

                <Button onClick={handleSaveProductSettings} className="w-full">
                  حفظ إعدادات المنتج المحدد
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog for Product Settings */}
      {showProductSettingsDialog && selectedProductForSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">إعدادات المنتج المحدد</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProductSettingsDialog(false)}
              >
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                سيتم حفظ الإعدادات للمنتج:{" "}
                <strong>{selectedProductForSettings.name}</strong>
              </p>
              <div className="flex gap-4 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowProductSettingsDialog(false)}
                >
                  إلغاء
                </Button>
                <Button onClick={handleSaveProductSettings}>حفظ</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
