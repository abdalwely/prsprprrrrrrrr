import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  RefreshCw,
  Package,
  AlertTriangle,
  AlertOctagon,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Product, productService } from "@/lib/src";

interface InventoryManagementTabProps {
  localProducts: Product[];
  loadInitialData: () => Promise<void>;
}

export default function InventoryManagementTab({
  localProducts,
  loadInitialData,
}: InventoryManagementTabProps) {
  const { toast } = useToast();
  const [inventoryStats, setInventoryStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalInventoryValue: 0,
  });

  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [selectedProductForInventory, setSelectedProductForInventory] =
    useState<Product | null>(null);
  const [newInventoryQuantity, setNewInventoryQuantity] = useState<number>(0);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // دالة حساب إحصاءات المخزون
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
      totalInventoryValue += quantity * (product.price || 0);
    });

    setInventoryStats({
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalInventoryValue,
    });
  };

  // حساب الإحصائيات عند تحميل البيانات
  useEffect(() => {
    calculateInventoryStats(localProducts);
  }, [localProducts]);

  // دالة إعادة تحميل البيانات
  const reloadData = async () => {
    setIsLoading(true);
    try {
      await loadInitialData();
      toast({
        title: "تم تحديث البيانات",
        description: "تم تحديث بيانات المخزون",
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

  // دالة لفتح نافذة تعديل المخزون
  const handleOpenInventoryDialog = (product: Product) => {
    setSelectedProductForInventory(product);
    setNewInventoryQuantity(product.inventory?.quantity || 0);
    setShowInventoryDialog(true);
  };

  // دالة لحفظ تعديل المخزون
  const handleSaveInventory = async () => {
    if (!selectedProductForInventory) return;

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

      await reloadData();
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

  // دالة لتحديث المخزون مباشرة
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

      toast({
        title: "تم تحديث المخزون",
        description: `تم تحديث مخزون ${product.name}`,
      });

      await reloadData();
    } catch (error) {
      toast({
        title: "خطأ في تحديث المخزون",
        description: "تعذر تحديث المخزون",
        variant: "destructive",
      });
    }
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
          <h2 className="text-2xl font-bold">إدارة المخزون</h2>
          <p className="text-muted-foreground">تتبع وإدارة مخزون منتجاتك</p>
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
                  {inventoryStats.totalInventoryValue.toLocaleString()} ريال
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
                <p className="text-gray-500">لا توجد منتجات منخفضة المخزون</p>
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
                <TableHead className="text-right">المخزون الحالي</TableHead>
                <TableHead className="text-right">المخزون المثالي</TableHead>
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
                            // يمكن حفظ هذا القيمة في حالة الحاجة
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
                          onClick={() => handleOpenInventoryDialog(product)}
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
    </div>
  );
}
