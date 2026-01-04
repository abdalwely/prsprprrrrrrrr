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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Clock,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { Product, Category, ComplianceStatus } from "@/lib/src";

interface ProductComplianceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productForComplianceDetails: Product | null;
  localCategories: Category[];
}

export default function ProductComplianceDialog({
  open,
  onOpenChange,
  productForComplianceDetails,
  localCategories,
}: ProductComplianceDialogProps) {
  // دالة الحصول على شارة حالة الامتثال
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

  // دالة الحصول على اسم التصنيف من ID
  const getCategoryNameById = (categoryId: string): string => {
    if (!categoryId) return "غير مصنف";
    const category = localCategories.find((cat) => cat.id === categoryId);
    return category?.name || categoryId || "غير مصنف";
  };

  if (!productForComplianceDetails) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            تفاصيل الامتثال
          </DialogTitle>
          <DialogDescription>
            {productForComplianceDetails &&
              `معلومات الامتثال: ${productForComplianceDetails.name}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            {productForComplianceDetails.images?.[0] && (
              <img
                src={productForComplianceDetails.images[0]}
                alt={productForComplianceDetails.name}
                className="h-12 w-12 object-cover rounded"
              />
            )}
            <div>
              <p className="font-medium">{productForComplianceDetails.name}</p>
              <div className="flex items-center gap-2 mt-1">
                {getComplianceBadge(productForComplianceDetails)}
                <Badge
                  variant={
                    productForComplianceDetails.status === "active"
                      ? "default"
                      : productForComplianceDetails.status === "inactive"
                        ? "secondary"
                        : productForComplianceDetails.status === "draft"
                          ? "outline"
                          : productForComplianceDetails.status ===
                              "under_review"
                            ? "warning"
                            : "destructive"
                  }
                >
                  {productForComplianceDetails.status === "active"
                    ? "نشط"
                    : productForComplianceDetails.status === "inactive"
                      ? "غير نشط"
                      : productForComplianceDetails.status === "draft"
                        ? "مسودة"
                        : productForComplianceDetails.status === "under_review"
                          ? "قيد المراجعة"
                          : "موقوف"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {productForComplianceDetails._semantics ? (
              <>
                <div className="space-y-2">
                  <Label className="text-gray-700">حالة الامتثال</Label>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const semantics =
                          productForComplianceDetails._semantics;
                        switch (semantics.complianceStatus) {
                          case ComplianceStatus.COMPLIANT:
                            return (
                              <>
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="font-medium text-green-700">
                                  متوافق
                                </span>
                              </>
                            );
                          case ComplianceStatus.NON_COMPLIANT:
                            return (
                              <>
                                <XCircle className="h-5 w-5 text-red-600" />
                                <span className="font-medium text-red-700">
                                  غير متوافق
                                </span>
                              </>
                            );
                          case ComplianceStatus.PENDING_REVIEW:
                            return (
                              <>
                                <Clock className="h-5 w-5 text-blue-600" />
                                <span className="font-medium text-blue-700">
                                  قيد المراجعة
                                </span>
                              </>
                            );
                          case ComplianceStatus.EXEMPTED:
                            return (
                              <>
                                <ShieldAlert className="h-5 w-5 text-purple-600" />
                                <span className="font-medium text-purple-700">
                                  معفى
                                </span>
                              </>
                            );
                          default:
                            return (
                              <>
                                <Clock className="h-5 w-5 text-gray-600" />
                                <span className="font-medium text-gray-700">
                                  قيد الكشف
                                </span>
                              </>
                            );
                        }
                      })()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700">طريقة الاكتشاف</Label>
                    <div className="p-3 bg-gray-50 rounded border">
                      <p>
                        {productForComplianceDetails._semantics
                          .detectionMethod || "غير محدد"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700">درجة الثقة</Label>
                    <div className="p-3 bg-gray-50 rounded border">
                      <div className="flex items-center gap-2">
                        <Progress
                          value={
                            (productForComplianceDetails._semantics
                              .confidenceScore || 0) * 100
                          }
                          className="h-2 flex-1"
                        />
                        <span className="text-sm font-medium">
                          {Math.round(
                            (productForComplianceDetails._semantics
                              .confidenceScore || 0) * 100,
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {productForComplianceDetails._semantics.detectedActivity && (
                  <div className="space-y-2">
                    <Label className="text-gray-700">النشاط المكتشف</Label>
                    <div className="p-3 bg-gray-50 rounded border">
                      <p>
                        {
                          productForComplianceDetails._semantics
                            .detectedActivity
                        }
                      </p>
                    </div>
                  </div>
                )}

                {productForComplianceDetails._semantics.productTypeId && (
                  <div className="space-y-2">
                    <Label className="text-gray-700">معرف نوع المنتج</Label>
                    <div className="p-3 bg-gray-50 rounded border">
                      <p>
                        {productForComplianceDetails._semantics.productTypeId}
                      </p>
                    </div>
                  </div>
                )}

                {productForComplianceDetails._semantics.validationFlags &&
                  productForComplianceDetails._semantics.validationFlags
                    .length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-gray-700">التحذيرات</Label>
                      <div className="p-3 bg-red-50 border border-red-200 rounded">
                        <ul className="list-disc list-inside space-y-1">
                          {productForComplianceDetails._semantics.validationFlags.map(
                            (flag, index) => (
                              <li key={index} className="text-sm text-red-700">
                                {flag}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                {productForComplianceDetails._semantics.shadowActions && (
                  <div className="space-y-2">
                    <Label className="text-gray-700">الإجراءات المخفية</Label>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                      <div className="space-y-2">
                        {productForComplianceDetails._semantics.shadowActions
                          .hideFromSearch && (
                          <div className="flex items-center gap-2">
                            <EyeOff className="h-4 w-4 text-amber-600" />
                            <span className="text-sm text-amber-700">
                              المنتج مخفي من نتائج البحث
                            </span>
                          </div>
                        )}
                        {productForComplianceDetails._semantics.shadowActions
                          .hideFromStore && (
                          <div className="flex items-center gap-2">
                            <EyeOff className="h-4 w-4 text-amber-600" />
                            <span className="text-sm text-amber-700">
                              المنتج مخفي من المتجر
                            </span>
                          </div>
                        )}
                        {productForComplianceDetails._semantics.shadowActions
                          .limitPurchase && (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <span className="text-sm text-amber-700">
                              الشراء محدود للعملاء
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">
                  لا توجد معلومات امتثال
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  لم يتم بعد اكتشاف معلومات الامتثال لهذا المنتج
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>إغلاق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
